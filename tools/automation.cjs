/**
 * Vaelora İksirleri — otomasyon tanımları.
 *
 * Her anahtar bir iksirin `system.identifier` değeridir. Yalnızca koşulsuz,
 * zarla ölçülebilen mekanikler buradadır; koşullu ("zehre karşı", "açık gökyüzü
 * altındayken"), tur başına bir kez, yerleşim/anlatı gerektiren kısımlar
 * açıklamada kalır ve GM tarafından yönetilir.
 *
 * Alanlar:
 *   heal:    içince iyileştirme. "2d6+4", { formula, temp: true } veya { formula, range: 5 } (başkasına)
 *   effect:  içince kendine uygulanan süreli Active Effect { changes, statuses }
 *   drawback: "Bedel / Yan Etki" bölümünün iksir süresince geçerli, koşulsuz kısmı
 *            { changes, statuses }. Ayrı bir efekt olmaz; iksirin efektine eklenir
 *            (ayrı "Bedel" efekti oyunculara GM'e özel bölümü ele verirdi). Etki
 *            bittiğinde/tetiklendiğinde gelen bedeller (bitkinlik, yaşlanma) GM'de kalır.
 *   actions: içtikten sonra kullanılabilen ek aktiviteler (iksir şişesi boş olarak kalır)
 *     { type: "save", name, ability, dc, damage?: "6d6", types?: [...], onSave?: "half"|"none",
 *       range?: 30, template?: { type: "cone"|"radius"|"cube", size }, uses?: 3,
 *       activation?: "action"|"bonus", statuses?: [...], statusRounds?: 1 }
 *     { type: "damage", name, damage, types, range?, template?, uses?, activation? }
 *     { type: "heal", name, heal, range?, uses?, activation? }
 */

const MODE = { CUSTOM: 0, MULTIPLY: 1, ADD: 2, UPGRADE: 4, OVERRIDE: 5 };
const c = (key, mode, value) => ({ key, mode, value: String(value), priority: null });

const adv = {
  skill: s => c(`system.skills.${s}.roll.mode`, MODE.ADD, 1),
  check: a => c(`system.abilities.${a}.check.roll.mode`, MODE.ADD, 1),
  save: a => c(`system.abilities.${a}.save.roll.mode`, MODE.ADD, 1),
  concentration: () => c("system.attributes.concentration.roll.mode", MODE.ADD, 1),
  death: () => c("system.attributes.death.roll.mode", MODE.ADD, 1)
};
const dis = {
  skill: s => c(`system.skills.${s}.roll.mode`, MODE.ADD, -1),
  check: a => c(`system.abilities.${a}.check.roll.mode`, MODE.ADD, -1),
  init: () => c("system.attributes.init.roll.mode", MODE.ADD, -1)
};
const skillBonus = (s, n) => c(`system.skills.${s}.bonuses.check`, MODE.ADD, n > 0 ? `+${n}` : String(n));
const vuln = (...types) => types.map(t => c("system.traits.dv.value", MODE.ADD, t));
const setSpeed = (kind, n) => c(`system.attributes.movement.${kind}`, MODE.OVERRIDE, n);
const res = (...types) => types.map(t => c("system.traits.dr.value", MODE.ADD, t));
const imm = (...types) => types.map(t => c("system.traits.di.value", MODE.ADD, t));
const cimm = (...conds) => conds.map(t => c("system.traits.ci.value", MODE.ADD, t));
const walk = n => c("system.attributes.movement.walk", MODE.ADD, n);
const move = (kind, n) => c(`system.attributes.movement.${kind}`, MODE.UPGRADE, n);
const sense = (kind, n) => c(`system.attributes.senses.ranges.${kind}`, MODE.UPGRADE, n);
const acBonus = n => c("system.attributes.ac.bonus", MODE.ADD, `+${n}`);
const acFlat = n => [c("system.attributes.ac.calc", MODE.OVERRIDE, "flat"), c("system.attributes.ac.flat", MODE.OVERRIDE, n)];
const weaponDamage = (formula, type) => ["mwak", "rwak"].map(k => c(`system.bonuses.${k}.damage`, MODE.ADD, `${formula}[${type}]`));
const hpMax = n => c("system.attributes.hp.bonuses.overall", MODE.ADD, n);
const light = (bright, dim) => [c("ATL.light.bright", MODE.UPGRADE, bright), c("ATL.light.dim", MODE.UPGRADE, dim)];
// Midi-QOL bayrakları; Midi kurulu değilse etkisizdir.
const midi = (key, value = 1) => c(`flags.midi-qol.${key}`, MODE.CUSTOM, value);

const BASE = {
  // ---------------- Common ----------------
  "atesbocegi-surubu": { effect: { changes: light(20, 40) } },
  "durust-dil-damlasi": { effect: { changes: [adv.skill("ins")] } },
  "kedi-adimi-iksiri": { effect: { changes: [adv.skill("acr")] } },
  "mum-alevi-iksiri": { effect: { changes: light(5, 10) } },
  "tuyhafif-tonik": { effect: { changes: [c("system.attributes.encumbrance.bonuses.overall", MODE.ADD, 50)] } },

  // ---------------- Uncommon ----------------
  "akrep-safrasi": { effect: { changes: res("poison") } },
  "aybaligi-ozutu": { effect: { changes: [move("swim", 40)] } },
  "bagcik-buyusu-iksiri": { effect: { changes: [walk(10)] } },
  "buzdamari-iksiri": { effect: { changes: res("cold") } },
  "camgoz-serumu": { effect: { changes: [sense("darkvision", 60)] } },
  "cesaret-demi": { effect: { changes: cimm("frightened") } },
  "celik-sinir-iksiri": { effect: { changes: [adv.concentration()] } },
  "coban-yildizi-damlasi": { effect: { changes: [adv.skill("sur")] } },
  "firtina-cami-iksiri": { effect: { changes: res("lightning") } },
  "goktasi-derisi-iksiri": { effect: { changes: [acBonus(1)] } },
  "gumusdil-iksiri": { effect: { changes: [adv.skill("per")] } },
  "gunes-kabugu-iksiri": { effect: { changes: res("radiant") } },
  "hokkabaz-nefesi": {
    actions: [{
      type: "save", name: "Kıvılcım Konisi", ability: "dex", dc: 13, onSave: "none",
      template: { type: "cone", size: 10 }, uses: 1, activation: "bonus",
      statuses: ["blinded"], statusRounds: 1
    }]
  },
  "karinca-gucu-surubu": { effect: { changes: [c("system.attributes.encumbrance.multipliers.overall", MODE.MULTIPLY, 2)] } },
  "keskin-zihin-serumu": { effect: { changes: [adv.check("int"), adv.save("int")] } },
  "kozdamari-iksiri": { effect: { changes: res("fire") } },
  "kurt-gulusu-damlasi": { effect: { changes: [c("system.skills.itm.bonuses.check", MODE.ADD, "+2")] } },
  "mezar-tuzu-iksiri": { effect: { changes: res("necrotic") } },
  "ruzgar-topugu-iksiri": { effect: { changes: [walk(10)] } },
  "sis-pelerini-iksiri": { effect: { changes: [midi("grants.disadvantage.attack.rwak"), midi("grants.disadvantage.attack.rsak")] } },
  "taskalp-iksiri": { heal: { formula: "2d6+4", temp: true }, effect: { changes: cimm("prone") } },
  "yankisiz-adim-iksiri": { effect: { changes: [adv.skill("ste")] } },

  // ---------------- Rare ----------------
  "ay-cekimi-iksiri": {
    actions: [{ type: "save", name: "Ay Çekimi", ability: "str", dc: 16, range: 60, activation: "bonus" }]
  },
  "bogucu-sarmasik-iksiri": {
    actions: [{
      type: "save", name: "Sarmaşıklar", ability: "str", dc: 16, range: 30,
      template: { type: "cube", size: 20 }, uses: 1, statuses: ["restrained"], statusRounds: 10
    }]
  },
  "buyucu-kirani-iksiri": { effect: { changes: [midi("magicResistance.all")] } },
  "canavar-terbiyecisi-iksiri": {
    actions: [{ type: "save", name: "Canavarı Yatıştır", ability: "wis", dc: 16, range: 30, uses: 1 }]
  },
  "demir-orman-ozsuyu": { effect: { changes: [...acFlat(18), ...cimm("prone")] } },
  "ejder-nefesi-iksiri": {
    actions: [{
      type: "save", name: "Ejder Nefesi", ability: "dex", dc: 15, damage: "6d6",
      types: ["fire", "cold", "lightning"], onSave: "half", template: { type: "cone", size: 30 }, uses: 1
    }]
  },
  "firtina-gozu-serumu": { effect: { changes: res("lightning", "thunder") } },
  "gok-gurultusu-taci": { effect: { changes: imm("thunder") } },
  "golge-degisimi-iksiri": {
    actions: [{ type: "save", name: "Gölge Değişimi", ability: "cha", dc: 15, range: 60, uses: 1, activation: "bonus" }]
  },
  "gunes-muhru-iksiri": { effect: { changes: light(30, 60) } },
  "kan-borcu-iksiri": { heal: { formula: "8d4+8", range: 5 } },
  "kara-mercan-kani": { effect: { changes: [...res("acid", "poison"), move("swim", 30)] } },
  "kizil-ay-damitisi": { effect: { changes: weaponDamage("1d4", "necrotic") } },
  "kristal-nabiz-iksiri": { effect: { changes: [hpMax(30)] } },
  "kuzey-ruzgari-kani": { effect: { changes: [move("fly", 60)] } },
  "leviathan-solugu": { effect: { changes: [move("swim", 60), ...res("cold")] } },
  "melek-tuyu-nektari": {
    effect: { changes: [move("fly", 40), ...res("radiant")] },
    actions: [{ type: "heal", name: "Melek Dokunuşu", heal: "6d8", range: 5, uses: 1 }]
  },
  "mor-alev-damitisi": { effect: { changes: weaponDamage("2d6", "psychic") } },
  "mor-yanki-damitisi": { effect: { changes: res("psychic") } },
  "olum-sessizligi-iksiri": {
    effect: { changes: [c("system.attributes.movement.walk", MODE.OVERRIDE, 0)], statuses: ["blinded", "incapacitated"] }
  },
  "ruh-capasi": { effect: { changes: [adv.death()] } },
  "ruh-feneri-iksiri": { effect: { changes: res("necrotic") } },
  "tas-yagmuru-iksiri": {
    actions: [{
      type: "save", name: "Taş Yağmuru", ability: "dex", dc: 16, damage: "4d8", types: ["bludgeoning"],
      onSave: "none", range: 60, template: { type: "radius", size: 10 }, uses: 3
    }]
  },
  "yildirim-omurgasi-iksiri": { effect: { changes: [walk(20)] } },
  "yildizsiz-gece-iksiri": { effect: { changes: [sense("darkvision", 120)] } },
  "yirtici-suret-iksiri": { effect: { changes: [sense("darkvision", 60), walk(10)] } },
  "zincirbozan-ozutu": { effect: { changes: cimm("grappled", "restrained") } },

  // ---------------- Very Rare ----------------
  "denizlerin-buyrugu-iksiri": { effect: { changes: [move("swim", 90)] } },
  "ejder-yuregi-iksiri": {
    actions: [{
      type: "save", name: "Ejder Yüreği Nefesi", ability: "dex", dc: 18, damage: "10d6",
      types: ["acid", "cold", "fire", "lightning", "poison", "thunder", "necrotic", "radiant", "psychic", "force"],
      onSave: "half", template: { type: "cone", size: 60 }, uses: 1
    }]
  },
  "goklerin-gazabi-iksiri": {
    actions: [{
      type: "save", name: "Yıldırım İndir", ability: "dex", dc: 19, damage: "8d10", types: ["lightning"],
      onSave: "half", range: 120, template: { type: "radius", size: 10 }
    }]
  },
  "kitalarin-nabzi-iksiri": {
    actions: [{
      type: "damage", name: "Deprem Dalgası", damage: "8d10", types: ["thunder"],
      template: { type: "cone", size: 30 }, uses: 1
    }]
  },
  "mutlak-sessizlik-iksiri": { effect: { changes: imm("thunder") } },
  "ruh-aynasi-iksiri": { effect: { changes: [...imm("psychic"), ...cimm("charmed")] } },
  "ruhsuz-beden-iksiri": { effect: { changes: [...imm("psychic", "necrotic"), ...cimm("charmed", "frightened")] } },
  "titan-kani-iksiri": {
    effect: { changes: [c("system.traits.size", MODE.OVERRIDE, "grg"), c("system.abilities.str.value", MODE.UPGRADE, 25)] }
  },
  "unutulmus-ad-tiryaki": { effect: { changes: cimm("charmed", "frightened") } },
  "yildiz-dususu-iksiri": {
    effect: { changes: [move("fly", 60)] },
    actions: [{
      type: "save", name: "Yıldız Düşüşü", ability: "dex", dc: 18, damage: "8d6", types: ["radiant"],
      onSave: "half", template: { type: "radius", size: 20 }, uses: 1
    }]
  },

  // ---------------- Legendary ----------------
  "bosluga-yazilmis-ad": { effect: { statuses: ["invisible"] } },
  "dunya-kalbinin-kani": { effect: { changes: [...imm("poison"), ...cimm("poisoned", "diseased")] } },
  "ejderhalarin-ilk-atesi": {
    effect: { changes: imm("fire") },
    actions: [{
      type: "damage", name: "İlk Ateş Nefesi", damage: "18d6", types: ["fire"],
      template: { type: "cone", size: 90 }, uses: 3
    }]
  },
  "ilk-safagin-gozyasi": { heal: { formula: "@attributes.hp.max" } },
  "kizil-tutulma-kani": {
    effect: { changes: [c("system.traits.size", MODE.OVERRIDE, "lg"), move("fly", 40), ...res("ALL"), ...weaponDamage("2d8", "necrotic")] }
  },
  "tanrisal-soz-nektari": {
    actions: [{ type: "save", name: "Tanrısal Emir", ability: "wis", dc: 20, range: 120, uses: 1 }]
  },
  "yoklugun-sarabi": { effect: { statuses: ["invisible"] } }
};

// Bedel / Yan Etki: yalnızca iksir süresince geçerli ve koşulsuz olanlar.
const DRAWBACKS = {
  // Common
  "atesbocegi-surubu": { changes: [dis.skill("ste")] },
  "cuce-midesi-surubu": { changes: [dis.skill("ste")] },
  "durust-dil-damlasi": { changes: [dis.skill("dec")] },
  "kedi-adimi-iksiri": { changes: [dis.skill("ath")] },
  "kayip-esya-tuzu": { changes: [dis.skill("prc")] },
  "kul-parmagi-yagi": { changes: [skillBonus("slt", -1)] },
  // Uncommon
  "aybaligi-ozutu": { changes: [walk(-10)] },
  "buzdamari-iksiri": { changes: vuln("fire") },
  "celik-sinir-iksiri": { changes: [dis.init()] },
  "goktasi-derisi-iksiri": { changes: [dis.skill("ste")] },
  "gumusdil-iksiri": { changes: [dis.skill("dec")] },
  "gunes-kabugu-iksiri": { changes: light(10, 20) },
  "keskin-zihin-serumu": { changes: [dis.check("wis")] },
  "kozdamari-iksiri": { changes: vuln("cold") },
  "kurt-gulusu-damlasi": { changes: [skillBonus("per", -2)] },
  "sis-pelerini-iksiri": { changes: [midi("disadvantage.attack.rwak"), midi("disadvantage.attack.rsak")] },
  "taskalp-iksiri": { changes: [walk(-10)] },
  "yanki-nefesi-iksiri": { statuses: ["deafened"] },
  // Rare
  "cehennem-sogugu-iksiri": { changes: vuln("fire") },
  "demir-orman-ozsuyu": { changes: [setSpeed("walk", 15), setSpeed("fly", 0), setSpeed("swim", 0)] },
  "kizil-ay-damitisi": { changes: vuln("radiant") },
  "kristal-nabiz-iksiri": { changes: vuln("thunder") },
  "leviathan-solugu": { changes: [setSpeed("walk", 15)] },
  "olum-sessizligi-iksiri": { changes: res("ALL") },
  "ruh-avcisi-iksiri": { changes: vuln("necrotic") },
  "ruya-yuruyusu-iksiri": { statuses: ["unconscious"] },
  "yercekimi-civisi-iksiri": { changes: [walk(-10)] },
  // Very Rare / Legendary
  "denizlerin-buyrugu-iksiri": { changes: vuln("fire") },
  "dunya-koku-ozsuyu": { changes: [walk(-10)] }
};

for (const [id, drawback] of Object.entries(DRAWBACKS)) {
  BASE[id] = { ...(BASE[id] ?? {}), drawback };
}

module.exports = BASE;
