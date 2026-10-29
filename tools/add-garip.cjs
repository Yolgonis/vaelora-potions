/**
 * Garip iksirleri (tools/garip-*.cjs) iksir JSON'una, json/items/ klasörüne ve
 * packs/vaelora-potions compendium'una ekler.
 *
 * Kullanım (Foundry KAPALIYKEN, depo kökünden):
 *   node tools/add-garip.cjs --dry-run
 *   node tools/add-garip.cjs
 *   node tools/apply-automation.cjs     # ardından efektleri üretir
 *
 * Tekrar çalıştırılabilir: identifier'ı JSON'da olan iksir atlanır.
 * Güvenlik: compendium'daki eşyalar JSON ile aynı değilse durur.
 */
const fs = require("fs");
const path = require("path");
const { ClassicLevel } = require("C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level");
const AUTOMATION = require("./automation.cjs");

const MODULE_DIR = path.resolve(__dirname, "..");
const JSON_PATH = path.join(MODULE_DIR, "json", "vaelora-potions.json");
const ITEM_DIR = path.join(MODULE_DIR, "json", "items");
const PACK_DIR = path.join(MODULE_DIR, "packs", "vaelora-potions");
const MODULE_ID = "vaelora-potions";
const DRY_RUN = process.argv.includes("--dry-run");
const TEMPLATE_IDENTIFIER = "ciy-nefesi"; // otomasyonsuz, sade bir Common iksir

const DURATION = {
  inst: { value: "", units: "inst", text: "Anlık" },
  m: { units: "minute", text: n => `${n} dakika` },
  h: { units: "hour", text: n => `${n} saat` },
  d: { units: "day", text: n => `${n} gün` },
  r: { units: "round", text: n => `${n} tur` }
};

function parseDuration(spec) {
  if (spec === "inst") return { value: "", units: "inst", text: "Anlık" };
  const m = /^(\d+)([mhdr])$/.exec(spec);
  if (!m) throw new Error(`Geçersiz süre: ${spec}`);
  const kind = DURATION[m[2]];
  return { value: m[1], units: kind.units, text: kind.text(m[1]) };
}

const escape = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function description(p, durationText) {
  return `<p><em>${escape(p.flavor)}</em></p><p><strong>Etki.</strong> ${escape(p.effect)}</p>`
    + `<p><strong>Süre.</strong> ${durationText}</p>`
    + `<section class="secret"><p><strong>Bedel / Yan Etki.</strong> ${escape(p.cost)}</p></section>`;
}

function pad(n) { return String(n).padStart(10, "0"); }

(async () => {
  const items = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const garip = AUTOMATION._garip;
  const template = items.find(i => i.system.identifier === TEMPLATE_IDENTIFIER);
  if (!template) throw new Error(`Şablon iksir yok: ${TEMPLATE_IDENTIFIER}`);

  const names = new Set(items.map(i => i.name));
  const identifiers = new Set(items.map(i => i.system.identifier));
  const fresh = garip.filter(p => !identifiers.has(p.identifier));
  const dupNames = fresh.filter(p => names.has(p.name));
  if (dupNames.length) throw new Error(`Aynı adlı iksir var: ${dupNames.map(p => p.name).join(", ")}`);
  const seen = new Set();
  for (const p of fresh) {
    if (seen.has(p.identifier)) throw new Error(`Yinelenen identifier: ${p.identifier}`);
    seen.add(p.identifier);
  }

  const RANGE = { common: [50, 100], uncommon: [101, 500], veryRare: [5001, 50000] };
  for (const p of fresh) {
    const [lo, hi] = RANGE[p.rarity] ?? [];
    if (lo === undefined) throw new Error(`Desteklenmeyen nadirlik: ${p.rarity} (${p.name})`);
    if (p.price < lo || p.price > hi) throw new Error(`Fiyat aralık dışı: ${p.name} ${p.price}`);
  }

  const byRarity = r => items.filter(i => i.system.rarity === r);
  const folderOf = {}, imagesOf = {}, sortOf = {}, priceTiers = {};
  for (const r of ["common", "uncommon", "veryRare"]) {
    const list = byRarity(r);
    folderOf[r] = list[0].folder;
    imagesOf[r] = [...new Set(list.map(i => i.img))];
    sortOf[r] = Math.max(...list.map(i => i.sort));
    priceTiers[r] = [...new Set([...list.map(i => i.system.price.value), ...fresh.filter(p => p.rarity === r).map(p => p.price)])].sort((a, b) => a - b);
  }

  let nextNumber = Math.max(...items.map(i => Number(i._id.replace("VaePot", "")))) + 1;
  const now = Date.now();
  const created = [];
  const counters = {};

  for (const p of fresh) {
    const n = nextNumber++;
    const index = counters[p.rarity] = (counters[p.rarity] ?? 0) + 1;
    const dur = parseDuration(p.dur);
    const tiers = priceTiers[p.rarity];
    const band = 1 + Math.min(5, Math.floor(tiers.indexOf(p.price) * 6 / tiers.length));
    const img = imagesOf[p.rarity][(n * 7) % imagesOf[p.rarity].length];

    const item = structuredClone(template);
    delete item.effects;
    item._id = `VaePot${pad(n)}`;
    item.name = p.name;
    item.img = img;
    item.folder = folderOf[p.rarity];
    item.sort = sortOf[p.rarity] + index * 100000;
    item.flags = {
      [MODULE_ID]: { version: "3.7.0", powerScore: Number((0.5 + band * 0.3).toFixed(2)), priceBand: band },
      dnd5e: { riders: { activity: [], effect: [] } }
    };
    item._stats = { ...template._stats, createdTime: now, modifiedTime: now };
    item.system.identifier = p.identifier;
    item.system.rarity = p.rarity;
    item.system.price = { value: p.price, denomination: "gp" };
    item.system.description = { value: description(p, dur.text), chat: "" };

    const activityId = `VaeAct${pad(n)}`;
    const [, drink] = Object.entries(item.system.activities)[0];
    item.system.activities = {
      [activityId]: {
        ...structuredClone(drink),
        _id: activityId,
        img,
        description: { chatFlavor: `${p.name} içilir.` },
        duration: { concentration: false, value: dur.value, units: dur.units, special: "", override: false },
        effects: []
      }
    };
    item.effects = [];
    created.push(item);
  }

  const counts = {};
  for (const i of [...items, ...created]) counts[i.system.rarity] = (counts[i.system.rarity] ?? 0) + 1;
  console.log(`Eklenecek: ${created.length} | toplam sonrası: ${items.length + created.length}`, JSON.stringify(counts));
  if (DRY_RUN || !created.length) return;

  const db = new ClassicLevel(PACK_DIR, { keyEncoding: "utf8", valueEncoding: "utf8", createIfMissing: false });
  try { await db.open(); }
  catch (err) { throw new Error(`Compendium açılamadı. Foundry açık olabilir; kapatıp tekrar deneyin. (${err.message})`); }

  try {
    const mismatched = [];
    for (const item of items) {
      const raw = await db.get(`!items!${item._id}`).catch(() => null);
      if (!raw) { mismatched.push(item.name); continue; }
      const packDoc = JSON.parse(raw);
      const { effects, _stats, ...rest } = item;
      const { effects: packEffects, _stats: packStats, ...packRest } = packDoc;
      if (JSON.stringify(rest) !== JSON.stringify(packRest)) mismatched.push(item.name);
    }
    if (mismatched.length) {
      throw new Error(`Compendium ile JSON farklı (${mismatched.length}): ${mismatched.slice(0, 10).join(", ")}.`);
    }

    await db.batch(created.map(item => {
      const { effects, ...doc } = item;
      return { type: "put", key: `!items!${item._id}`, value: JSON.stringify({ ...doc, effects: [] }) };
    }));

    const all = [...items, ...created];
    fs.writeFileSync(JSON_PATH, `${JSON.stringify(all, null, 2)}\n`, "utf8");
    for (const item of created) {
      fs.writeFileSync(path.join(ITEM_DIR, `${item.system.identifier}.json`), `${JSON.stringify(item, null, 2)}\n`, "utf8");
    }
    console.log("JSON, json/items ve compendium güncellendi. Şimdi: node tools/apply-automation.cjs");
  } finally {
    await db.close();
  }
})().catch(err => { console.error(err.message); process.exit(1); });
