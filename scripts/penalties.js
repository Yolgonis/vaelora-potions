/**
 * Vaelora İksirleri — etki bitince gelen bedeller.
 *
 * İksirin `flags.vaelora-potions.onEnd` tanımı (tools/automation.cjs) içince etkinin bayrağına
 * kopyalanır. Etki SÜRESİ DOLUNCA silinirse (Times-Up ya da süre ilerlemesi) aktif GM'in
 * istemcisi bedeli uygular ve GM'e fısıltıyla bir kart gönderir: Geri al, Yeniden at (kurtarmalı
 * bedellerde) ve Uygula (onay gerektirenlerde). GM etkiyi süre dolmadan elle silerse bedel
 * uygulanmaz; yani GM her zaman müdahale edebilir.
 *
 * onEnd tanımı:
 *   save:       { ability, dc }  başarısızsa uygulanır; başarılıysa bedel yok
 *   exhaustion: n                Bitkinlik Seviyesi ekler (en çok 6)
 *   hp:         n                Can Puanını n'ye indirir
 *   damage:     { formula, type } hasar atar ve uygular
 *   effect:     { name?, seconds, changes?, statuses? } süreli ceza efekti
 *   confirm:    true             otomatik uygulanmaz; GM kartındaki Uygula düğmesiyle uygulanır
 *   note:       metin            GM'e hatırlatma (otomatikleştirilemeyen kısım)
 */

import { MODULE_ID } from "./costs.js";

const SETTING = "autoPenalties";

export function registerPenalties() {
  game.settings.register(MODULE_ID, SETTING, {
    name: "Etki bitince bedelleri otomatik uygula",
    hint: "İksirin etkisi süresi dolarak bitince Bitkinlik, durum, hasar ve kurtarma atışlı bedeller kendiliğinden uygulanır; GM'e geri alma düğmeli bir kart gelir. Kapalıyken bedeller yalnızca GM kartındaki Uygula düğmesiyle uygulanır. Etki süresi dolmadan elle silinirse bedel hiçbir zaman uygulanmaz.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

/** İçilen iksirin onEnd tanımını efekt verisine taşır. */
export function carryOnEnd(item, effectData) {
  const onEnd = item.getFlag?.(MODULE_ID, "onEnd");
  if ( onEnd ) foundry.utils.setProperty(effectData, `flags.${MODULE_ID}.onEnd`, foundry.utils.deepClone(onEnd));
  return effectData;
}

const esc = text => foundry.utils.escapeHTML(String(text));

// GM kartları Türkçe yazılır; Foundry dili İngilizce olsa da.
const STATUS_TR = {
  poisoned: "Zehirlenmiş", stunned: "Sersemlemiş", incapacitated: "Etkisiz", blinded: "Kör", deafened: "Sağır",
  frightened: "Korkmuş", prone: "Yere Düşmüş", restrained: "Kısıtlanmış", paralyzed: "Felçli", charmed: "Büyülenmiş"
};
const DAMAGE_TR = {
  force: "kuvvet", fire: "ateş", cold: "soğuk", lightning: "yıldırım", thunder: "gök gürültüsü", poison: "zehir",
  acid: "asit", necrotic: "nekrotik", radiant: "ışıksal", psychic: "psişik", bludgeoning: "ezici", piercing: "delici", slashing: "kesici"
};
const ABILITY_TR = { str: "Kuvvet", dex: "Çeviklik", con: "Dayanıklılık", int: "Zekâ", wis: "Bilgelik", cha: "Karizma" };

function statusName(id) {
  if ( STATUS_TR[id] ) return STATUS_TR[id];
  const status = CONFIG.statusEffects.find(s => s.id === id);
  return status ? game.i18n.localize(status.name) : id;
}

function abilityName(key) {
  return ABILITY_TR[key] ?? CONFIG.DND5E.abilities[key]?.label ?? key;
}

function isExpired(effect) {
  const remaining = effect.duration?.remaining;
  return Number.isFinite(remaining) && (remaining <= 0);
}

/** Bedeli uygular. Döner: { lines, undo, saved } */
async function applySpec(actor, name, spec) {
  const lines = [];
  const undo = [];

  if ( spec.save ) {
    // Zar doğrudan atılır (iletişim kutusu ve Midi-QOL akışına bağımlı olmadan); avantaj/dezavantaj
    // ve yetkinlik, karakterin kurtarma atışı verisinden gelir.
    const save = actor.system.abilities?.[spec.save.ability]?.save;
    const roll = new CONFIG.Dice.D20Roll(`1d20 + ${Number(save?.value ?? 0)}`, actor.getRollData(), {
      advantageMode: save?.roll?.mode ?? 0
    });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${name}: bedel kurtarma atışı (${abilityName(spec.save.ability)}, DC ${spec.save.dc})`
    });
    const success = roll.total >= spec.save.dc;
    lines.push(`${abilityName(spec.save.ability)} kurtarma atışı (DC ${spec.save.dc}): ${roll.total} — ${success ? "başarılı, bedel yok" : "başarısız"}`);
    if ( success ) return { lines, undo, saved: true };
  }

  if ( spec.exhaustion ) {
    const current = actor.system.attributes.exhaustion ?? 0;
    const next = Math.min(6, current + spec.exhaustion);
    await actor.update({ "system.attributes.exhaustion": next });
    undo.push({ type: "exhaustion", value: current });
    lines.push(`Bitkinlik Seviyesi ${current} → ${next}`);
  }

  if ( spec.hp !== undefined ) {
    const current = actor.system.attributes.hp.value;
    await actor.update({ "system.attributes.hp.value": spec.hp });
    undo.push({ type: "hp", value: current });
    lines.push(`Can Puanı ${current} → ${spec.hp}`);
  }

  if ( spec.damage ) {
    const type = spec.damage.type;
    const roll = new CONFIG.Dice.DamageRoll(spec.damage.formula, actor.getRollData(), { type, types: [type] });
    await roll.evaluate();
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${name}: bedel hasarı` });
    await actor.applyDamage([{ value: roll.total, type }]);
    undo.push({ type: "damage", value: roll.total });
    lines.push(`${roll.total} ${DAMAGE_TR[type] ?? type} hasarı (${spec.damage.formula})`);
  }

  if ( spec.effect ) {
    const { seconds, changes = [], statuses = [] } = spec.effect;
    const effectName = spec.effect.name ?? `${name}: bedel`;
    const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: effectName, img: "icons/svg/hazard.svg", origin: null, transfer: false, disabled: false,
      changes: foundry.utils.deepClone(changes), statuses: [...statuses],
      duration: { seconds, rounds: seconds <= 60 ? Math.ceil(seconds / 6) : null },
      flags: { [MODULE_ID]: { penalty: true } }
    }]);
    undo.push({ type: "effect", id: created.id });
    const label = statuses.length ? statuses.map(statusName).join(", ") : effectName;
    lines.push(`${label} (${formatSeconds(seconds)})`);
  }

  return { lines, undo, saved: false };
}

function formatSeconds(s) {
  if ( s % 86400 === 0 ) return `${s / 86400} gün`;
  if ( s % 3600 === 0 ) return `${s / 3600} saat`;
  if ( s % 60 === 0 ) return `${s / 60} dakika`;
  return `${s / 6} tur`;
}

async function undoAll(actor, undo) {
  for ( const step of [...undo].reverse() ) {
    if ( step.type === "exhaustion" ) await actor.update({ "system.attributes.exhaustion": step.value });
    else if ( step.type === "hp" ) await actor.update({ "system.attributes.hp.value": step.value });
    else if ( step.type === "damage" ) await actor.applyDamage([{ value: step.value, type: "healing" }]);
    else if ( step.type === "effect" ) {
      const effect = actor.effects.get(step.id);
      if ( effect ) await effect.delete();
    }
  }
}

function cardHtml({ potion, actorName, state, lines, note, spec }) {
  const stateText = {
    applied: "Uygulandı",
    undone: "Geri alındı",
    pending: "Uygulanmadı (GM onayı bekliyor)",
    saved: "Kurtarma başarılı"
  }[state];
  const buttons = [];
  if ( state === "pending" ) buttons.push(`<button type="button" data-vp-penalty="apply">Uygula</button>`);
  if ( state === "applied" ) buttons.push(`<button type="button" data-vp-penalty="undo">Geri al</button>`);
  if ( (state === "applied" || state === "saved" || state === "undone") && spec.save ) {
    buttons.push(`<button type="button" data-vp-penalty="reroll">Yeniden at</button>`);
  }
  return `<div class="vp-penalty">
    <p><strong>${esc(potion)}</strong> — ${esc(actorName)}: etki bitti, bedel. <em>${stateText}</em></p>
    ${lines.length ? `<ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
    ${note ? `<p><em>GM: ${esc(note)}</em></p>` : ""}
    ${buttons.join(" ")}
  </div>`;
}

async function postCard(actor, potion, spec, result, state) {
  const flagData = { actorUuid: actor.uuid, potion, spec, undo: result?.undo ?? [], state };
  return ChatMessage.create({
    whisper: game.users.filter(u => u.isGM).map(u => u.id),
    speaker: ChatMessage.getSpeaker({ actor }),
    content: cardHtml({ potion, actorName: actor.name, state, lines: result?.lines ?? describe(spec), note: spec.note, spec }),
    flags: { [MODULE_ID]: { penalty: flagData } }
  });
}

/** Uygulanmamış bedelin kısa özeti (onay bekleyen kart için). */
function describe(spec) {
  const lines = [];
  if ( spec.save ) lines.push(`${abilityName(spec.save.ability)} kurtarma atışı, DC ${spec.save.dc}`);
  if ( spec.exhaustion ) lines.push(`${spec.exhaustion} Bitkinlik Seviyesi`);
  if ( spec.hp !== undefined ) lines.push(`Can Puanı ${spec.hp}'e iner`);
  if ( spec.damage ) lines.push(`${spec.damage.formula} ${DAMAGE_TR[spec.damage.type] ?? spec.damage.type} hasarı`);
  if ( spec.effect ) {
    const { statuses = [], name, seconds } = spec.effect;
    lines.push(`${statuses.length ? statuses.map(statusName).join(", ") : (name ?? "Ceza efekti")} (${formatSeconds(seconds)})`);
  }
  return lines;
}

async function onEffectDeleted(effect) {
  if ( !game.users.activeGM?.isSelf ) return;
  const spec = effect.getFlag(MODULE_ID, "onEnd");
  const actor = effect.parent;
  if ( !spec || !(actor instanceof Actor) || !isExpired(effect) ) return;

  const potion = effect.name;
  const auto = game.settings.get(MODULE_ID, SETTING) && !spec.confirm;
  const hasMechanics = Boolean(spec.save || spec.exhaustion || (spec.hp !== undefined) || spec.damage || spec.effect);
  if ( !hasMechanics ) return postCard(actor, potion, spec, { lines: [], undo: [] }, "applied");
  if ( !auto ) return postCard(actor, potion, spec, null, "pending");

  const result = await applySpec(actor, potion, spec);
  return postCard(actor, potion, spec, result, result.saved ? "saved" : "applied");
}

async function onCardClick(message, action) {
  const data = message.getFlag(MODULE_ID, "penalty");
  const actor = await fromUuid(data.actorUuid);
  if ( !actor ) return ui.notifications.warn("Karakter bulunamadı.");

  if ( (action === "undo") || (action === "reroll") ) {
    await undoAll(actor, data.undo);
    data.undo = [];
    data.state = "undone";
  }
  if ( (action === "apply") || (action === "reroll") ) {
    const result = await applySpec(actor, data.potion, data.spec);
    data.undo = result.undo;
    data.state = result.saved ? "saved" : "applied";
    data.lines = result.lines;
  }
  const lines = data.lines ?? (data.state === "undone" ? ["Bedel geri alındı."] : describe(data.spec));
  await message.update({
    content: cardHtml({ potion: data.potion, actorName: actor.name, state: data.state, lines, note: data.spec.note, spec: data.spec }),
    flags: { [MODULE_ID]: { penalty: data } }
  });
}

export function hookPenalties() {
  Hooks.on("deleteActiveEffect", effect => {
    onEffectDeleted(effect).catch(err => console.error(`${MODULE_ID} | bedel uygulanamadı`, err));
  });
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if ( !game.user.isGM || !message.getFlag(MODULE_ID, "penalty") ) return;
    html.querySelectorAll("[data-vp-penalty]").forEach(button => {
      button.addEventListener("click", async event => {
        event.preventDefault();
        const buttons = html.querySelectorAll("[data-vp-penalty]");
        buttons.forEach(b => { b.disabled = true; });
        try { await onCardClick(message, button.dataset.vpPenalty); }
        catch (err) { console.error(`${MODULE_ID} | bedel kartı`, err); buttons.forEach(b => { b.disabled = false; }); }
      });
    });
  });
}
