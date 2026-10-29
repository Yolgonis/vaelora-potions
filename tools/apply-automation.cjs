/**
 * Vaelora İksirleri'ne automation.cjs tanımlarını uygular.
 *
 * Kullanım (Foundry KAPALIYKEN, depo kökünden):
 *   node tools/apply-automation.cjs            # uygula
 *   node tools/apply-automation.cjs --dry-run  # yalnızca özet
 *
 * Kaynak: json/vaelora-potions.json
 * Hedefler: aynı JSON, json/items/<identifier>.json ve packs/vaelora-potions (LevelDB).
 * Tekrar çalıştırılabilir: önceki otomasyon (flags.vaelora-potions.auto) silinip
 * tanımlardan yeniden üretilir. Kimlikler identifier'dan türetildiği için sabittir.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ClassicLevel } = require("C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level");
const AUTOMATION = require("./automation.cjs");

const MODULE_DIR = path.resolve(__dirname, "..");
const JSON_PATH = path.join(MODULE_DIR, "json", "vaelora-potions.json");
const ITEM_DIR = path.join(MODULE_DIR, "json", "items");
const PACK_DIR = path.join(MODULE_DIR, "packs", "vaelora-potions");
const MODULE_ID = "vaelora-potions";
const DRY_RUN = process.argv.includes("--dry-run");

const UNIT_SECONDS = { round: 6, turn: 6, minute: 60, hour: 3600, day: 86400 };
const ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function stableId(prefix, seed) {
  const hash = crypto.createHash("sha256").update(seed).digest();
  let id = prefix;
  for (let i = 0; id.length < 16; i++) id += ALNUM[hash[i] % ALNUM.length];
  return id;
}

function parseFormula(formula) {
  const m = /^(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?$/.exec(formula.replace(/\s+/g, ""));
  if (m) return { number: Number(m[1]), denomination: Number(m[2]), bonus: m[3] ? `${m[3] === "-" ? "-" : ""}${m[4]}` : "", custom: { enabled: false, formula: "" } };
  if (/^\d+$/.test(formula)) return { number: null, denomination: null, bonus: formula, custom: { enabled: false, formula: "" } };
  return { number: null, denomination: null, bonus: "", custom: { enabled: true, formula } };
}

function effectDuration(activity) {
  const value = Number(activity.duration?.value);
  const unit = activity.duration?.units;
  const seconds = UNIT_SECONDS[unit] && Number.isFinite(value) ? value * UNIT_SECONDS[unit] : null;
  return {
    startTime: null, seconds, combat: null,
    rounds: unit === "round" && Number.isFinite(value) ? value : null,
    turns: null, startRound: null, startTurn: null
  };
}

function makeEffect(item, id, name, { changes = [], statuses = [] }, duration) {
  return {
    _id: id, name, img: item.img, origin: null, transfer: false, type: "base", system: {},
    changes, disabled: false, duration, description: "", tint: "#ffffff", statuses, sort: 0,
    flags: { [MODULE_ID]: { auto: true } },
    _stats: { ...item._stats, compendiumSource: null, duplicateSource: null }
  };
}

const baseTarget = (count = "") => ({
  template: { contiguous: false, units: "ft", type: "", size: "", width: "", height: "", count: "", stationary: false },
  affects: { choice: false, count, type: "creature", special: "" },
  override: false, prompt: true
});

function rangeOf(value) {
  return value ? { override: false, units: "ft", special: "", value: String(value) } : { override: false, units: "self", special: "" };
}

function followUpActivity(item, spec, index) {
  const id = stableId("VaeAut", `${item.system.identifier}:action:${index}`);
  const activity = {
    _id: id, type: spec.type, name: spec.name, sort: 100000 * (index + 1), img: "",
    activation: { type: spec.activation ?? "action", value: null, condition: "", override: false },
    consumption: {
      targets: spec.uses ? [{ type: "activityUses", value: "1", target: "", scaling: {} }] : [],
      scaling: { allowed: false, max: "" }, spellSlot: true
    },
    description: { chatFlavor: "" },
    duration: { units: "inst", concentration: false, override: false },
    effects: [], range: rangeOf(spec.range), target: baseTarget(),
    uses: { spent: 0, recovery: [], max: spec.uses ? String(spec.uses) : "" },
    appliedEffects: [],
    flags: { [MODULE_ID]: { auto: true } }
  };
  if (spec.template) {
    Object.assign(activity.target.template, { type: spec.template.type, size: String(spec.template.size) });
  }
  const effects = [];

  if (spec.type === "save" || spec.type === "damage") {
    if (spec.damage) {
      activity.damage = {
        parts: [{ ...parseFormula(spec.damage), types: spec.types ?? [], scaling: { number: 1 } }]
      };
    } else {
      activity.damage = { parts: [] };
    }
    if (spec.type === "damage") activity.damage.critical = { allow: false };
  }
  if (spec.type === "save") {
    activity.damage.onSave = spec.onSave ?? "none";
    activity.save = { ability: [spec.ability], dc: { calculation: "", formula: String(spec.dc) } };
    if (spec.statuses?.length) {
      const effectId = stableId("VaeEfA", `${item.system.identifier}:action:${index}`);
      const rounds = spec.statusRounds ?? 1;
      effects.push(makeEffect(item, effectId, spec.name, { statuses: spec.statuses }, {
        startTime: null, seconds: rounds * 6, combat: null, rounds, turns: null, startRound: null, startTurn: null
      }));
      activity.effects = [{ _id: effectId, onSave: false }];
    }
  }
  if (spec.type === "heal") {
    activity.healing = { ...parseFormula(spec.heal), types: ["healing"], scaling: { number: 1 } };
    activity.target = baseTarget("1");
  }
  return { activity, effects };
}

function applyAutomation(item, spec) {
  // Önceki otomasyonu temizle.
  item.effects = (item.effects ?? []).filter(e => !e.flags?.[MODULE_ID]?.auto);
  for (const [id, activity] of Object.entries(item.system.activities)) {
    if (activity.flags?.[MODULE_ID]?.auto) delete item.system.activities[id];
  }

  // Etki bitince gelen bedel tanımı eşyanın bayrağında durur; scripts/penalties.js okur.
  if (item.flags?.[MODULE_ID]) delete item.flags[MODULE_ID].onEnd;
  if (spec?.onEnd) item.flags[MODULE_ID] = { ...(item.flags[MODULE_ID] ?? {}), onEnd: spec.onEnd };

  const [drinkId, original] = Object.entries(item.system.activities)[0];
  const drink = structuredClone(original.flags?.[MODULE_ID]?.original ?? original);
  const originalSnapshot = structuredClone(drink);

  if (!spec) {
    item.system.activities[drinkId] = drink;
    return item;
  }

  drink.flags = { ...(drink.flags ?? {}), [MODULE_ID]: { original: originalSnapshot } };
  drink.effects = [];

  // Bedel, iksirin kendi efektine eklenir; ayrı efekt adı GM'e özel bölümü ele verirdi.
  const effectData = {
    changes: [...(spec.effect?.changes ?? []), ...(spec.drawback?.changes ?? [])],
    statuses: [...new Set([...(spec.effect?.statuses ?? []), ...(spec.drawback?.statuses ?? [])])]
  };
  if (effectData.changes.length || effectData.statuses.length) {
    const effectId = stableId("VaeEff", `${item.system.identifier}:drink`);
    item.effects.push(makeEffect(item, effectId, item.name, effectData, effectDuration(drink)));
    drink.effects = [{ _id: effectId }];
  }

  if (spec.heal) {
    const heal = typeof spec.heal === "string" ? { formula: spec.heal } : spec.heal;
    drink.type = "heal";
    delete drink.roll;
    drink.healing = { ...parseFormula(heal.formula), types: [heal.temp ? "temphp" : "healing"], scaling: { number: 1 } };
    if (heal.range) {
      drink.range = rangeOf(heal.range);
      drink.target = { ...drink.target, affects: { ...drink.target.affects, count: "1", type: "creature" } };
    }
  }
  item.system.activities[drinkId] = drink;

  (spec.actions ?? []).forEach((action, index) => {
    const { activity, effects } = followUpActivity(item, action, index);
    item.system.activities[activity._id] = activity;
    item.effects.push(...effects);
  });

  // İçtikten sonra kullanılan aktiviteler için şişe boş olarak kalır (resmî Potion of Fire Breath gibi).
  item.system.uses.autoDestroy = !(spec.actions?.length);
  return item;
}

function comparable(doc) {
  const { effects, _stats, ...rest } = doc;
  return JSON.stringify(rest);
}

(async () => {
  const items = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const unknown = Object.keys(AUTOMATION).filter(k => !items.some(i => i.system.identifier === k));
  if (unknown.length) throw new Error(`automation.cjs içinde bilinmeyen identifier: ${unknown.join(", ")}`);

  const db = new ClassicLevel(PACK_DIR, { keyEncoding: "utf8", valueEncoding: "utf8", createIfMissing: false });
  try {
    await db.open();
  } catch (err) {
    throw new Error(`Compendium açılamadı. Foundry açık olabilir; kapatıp tekrar deneyin. (${err.message})`);
  }

  try {
    // Güvenlik: compendium'daki eşyalar JSON ile aynı olmalı; aksi halde Foundry içinde
    // yapılmış düzenlemeler üzerine yazılırdı.
    const packEffects = new Map();
    for await (const [key, value] of db.iterator({ gte: "!items.effects!", lt: "!items.effects!\uffff" })) {
      const [itemId] = key.slice("!items.effects!".length).split(".");
      if (!packEffects.has(itemId)) packEffects.set(itemId, []);
      packEffects.get(itemId).push({ key, doc: JSON.parse(value) });
    }
    const mismatched = [];
    for (const item of items) {
      const raw = await db.get(`!items!${item._id}`).catch(() => null);
      if (!raw) { mismatched.push(`${item.name} (compendium'da yok)`); continue; }
      const packDoc = JSON.parse(raw);
      const jsonEffectIds = (item.effects ?? []).map(e => e._id).sort().join(",");
      if (comparable(packDoc) !== comparable(item) || [...packDoc.effects].sort().join(",") !== jsonEffectIds) {
        mismatched.push(item.name);
      }
    }
    if (mismatched.length) {
      throw new Error(`Compendium ile JSON farklı (${mismatched.length}): ${mismatched.slice(0, 10).join(", ")}. `
        + "Foundry'de compendium düzenlendiyse önce JSON'a aktarılmalı.");
    }

    const summary = { heal: 0, effect: 0, drawback: 0, actions: 0, untouched: 0 };
    for (const item of items) {
      const spec = AUTOMATION[item.system.identifier];
      applyAutomation(item, spec);
      if (!spec) summary.untouched++;
      if (spec?.heal) summary.heal++;
      if (spec?.effect || spec?.drawback) summary.effect++;
      if (spec?.drawback) summary.drawback++;
      if (spec?.actions) summary.actions += spec.actions.length;
    }
    console.log(`Otomasyon: ${Object.keys(AUTOMATION).length} iksir | iyileştirme ${summary.heal}, süreli efekt ${summary.effect} (bedelli ${summary.drawback}), ek aktivite ${summary.actions} | dokunulmayan ${summary.untouched}`);
    if (DRY_RUN) return;

    const ops = [];
    for (const [, list] of packEffects) for (const { key } of list) ops.push({ type: "del", key });
    for (const item of items) {
      const { effects, ...doc } = item;
      ops.push({ type: "put", key: `!items!${item._id}`, value: JSON.stringify({ ...doc, effects: (effects ?? []).map(e => e._id) }) });
      for (const effect of effects ?? []) {
        ops.push({ type: "put", key: `!items.effects!${item._id}.${effect._id}`, value: JSON.stringify(effect) });
      }
    }
    await db.batch(ops);

    fs.writeFileSync(JSON_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf8");
    for (const item of items) {
      fs.writeFileSync(path.join(ITEM_DIR, `${item.system.identifier}.json`), `${JSON.stringify(item, null, 2)}\n`, "utf8");
    }
    console.log("JSON ve compendium güncellendi.");
  } finally {
    await db.close();
  }
})().catch(err => { console.error(err.message); process.exit(1); });
