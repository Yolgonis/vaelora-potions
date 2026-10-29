/**
 * Garip iksirler (3.7.0): 70 Common, 20 Uncommon, 10 Very Rare.
 *
 * `module.exports = h => [{ rarity, name, flavor, effect, dur, cost, price, auto }]`
 * `h`, automation.cjs'in yardımcılarıdır. `auto` aynı biçimde { effect, drawback, ... } olur.
 */
const ortak = require("./garip-ortak.cjs");
const diger = require("./garip-diger.cjs");

const MAP = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

function slug(name) {
  return name.toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, ch => MAP[ch])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = h => {
  const list = [];
  const P = (rarity, name, flavor, effect, dur, cost, price, auto = {}) =>
    list.push({ rarity, name, identifier: slug(name), flavor, effect, dur, cost, price, auto });
  ortak(h, P);
  diger(h, P);
  return list;
};
module.exports.slug = slug;
