/**
 * json/tables/*.json dosyalarını packs/vaelora-tables compendium'una yazar.
 *
 * Kullanım (Foundry KAPALIYKEN, depo kökünden):
 *   node tools/write-tables.cjs            # yaz
 *   node tools/write-tables.cjs --dry-run  # yalnızca özet
 *
 * JSON tek kaynaktır: paketteki her tablo ve sonuçları JSON'dan yeniden yazılır;
 * JSON'da olmayan tablo paketten silinmez, uyarı verilir.
 */
const fs = require("fs");
const path = require("path");
const { ClassicLevel } = require("C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level");

const MODULE_DIR = path.resolve(__dirname, "..");
const TABLE_DIR = path.join(MODULE_DIR, "json", "tables");
const PACK_DIR = path.join(MODULE_DIR, "packs", "vaelora-tables");
const DRY_RUN = process.argv.includes("--dry-run");

(async () => {
  const tables = fs.readdirSync(TABLE_DIR).filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(TABLE_DIR, f), "utf8")));

  const db = new ClassicLevel(PACK_DIR, { keyEncoding: "utf8", valueEncoding: "utf8", createIfMissing: false });
  try {
    await db.open();
  } catch (err) {
    throw new Error(`Compendium açılamadı. Foundry açık olabilir; kapatıp tekrar deneyin. (${err.message})`);
  }

  try {
    const packTableIds = [];
    for await (const key of db.keys({ gte: "!tables!", lt: "!tables!\uffff" })) packTableIds.push(key.slice("!tables!".length));
    const orphans = packTableIds.filter(id => !tables.some(t => t._id === id));
    if (orphans.length) console.warn(`Uyarı: JSON'da olmayan paket tabloları (dokunulmadı): ${orphans.join(", ")}`);

    const ops = [];
    for (const table of tables) {
      for await (const key of db.keys({ gte: `!tables.results!${table._id}.`, lt: `!tables.results!${table._id}.\uffff` })) {
        ops.push({ type: "del", key });
      }
      const { results, ...doc } = table;
      ops.push({ type: "put", key: `!tables!${table._id}`, value: JSON.stringify({ ...doc, results: results.map(r => r._id) }) });
      for (const result of results) {
        ops.push({ type: "put", key: `!tables.results!${table._id}.${result._id}`, value: JSON.stringify(result) });
      }
      console.log(`${packTableIds.includes(table._id) ? "güncellenecek" : "eklenecek"}: ${table.name} (${results.length} sonuç)`);
    }
    if (DRY_RUN) return;
    await db.batch(ops);
    console.log("Tablolar compendium'a yazıldı.");
  } finally {
    await db.close();
  }
})().catch(err => { console.error(err.message); process.exit(1); });
