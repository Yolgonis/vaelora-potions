/**
 * Vaelora İksirleri — iksir karıştırma.
 *
 * Bir yaratık üzerinde bir Vaelora iksirinin etkisi sürerken başka bir Vaelora
 * iksiri içtiğinde "Vaelora İksir Karışımı Tablosu"nda 1d20 atılır. Herkese kısa
 * bir not düşer; tablo sonucu yalnızca GM'e fısıldanır ve GM tarafından uygulanır.
 * Tablo GM'e özel pakette olduğu için çekimi her zaman aktif GM yapar.
 */

import { MODULE_ID, SOCKET_NAME } from "./costs.js";

const TABLE_UUID = "Compendium.vaelora-potions.vaelora-tables.RollTable.VaeTbl0000000002";

export function registerMixing() {
  game.settings.register(MODULE_ID, "mixAnomaly", {
    name: "İksir karışımı tablosu",
    hint: "Bir Vaelora iksirinin etkisi sürerken başka bir Vaelora iksiri içilince İksir Karışımı Tablosu atılır; sonuç yalnızca GM'e görünür. Otomatik uygulama açıkken çalışır.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

function isActive(effect) {
  if ( effect.disabled ) return false;
  const remaining = effect.duration?.remaining;
  return (remaining === null) || (remaining === undefined) || (remaining > 0);
}

/** Alıcıda süren, başka bir Vaelora iksirinden gelen efektlerin iksir adları. */
export function activeOtherPotions(recipient, identifier) {
  const names = new Map();
  for ( const effect of recipient.effects ) {
    const potion = effect.getFlag(MODULE_ID, "potion");
    if ( !potion || (potion === identifier) || !isActive(effect) ) continue;
    names.set(potion, effect.name);
  }
  return [...names.values()];
}

async function drawAsGm(recipient, newName, otherNames) {
  const table = await fromUuid(TABLE_UUID);
  if ( !table ) return console.warn(`${MODULE_ID} | İksir Karışımı Tablosu bulunamadı`);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: recipient }),
    content: `<p><strong>${otherNames.join(", ")}</strong> ile <strong>${newName}</strong> birbirine karıştı. Bir şeyler ters gidiyor…</p>`
  });
  const { roll, results } = await table.roll();
  await table.toMessage(results, {
    roll,
    messageData: { speaker: ChatMessage.getSpeaker({ actor: recipient }), flavor: `${recipient.name}: ${table.name}` },
    messageOptions: { rollMode: CONST.DICE_ROLL_MODES.PRIVATE }
  });
}

export function triggerMix(recipient, newName, otherNames) {
  if ( !game.settings.get(MODULE_ID, "mixAnomaly") || !otherNames.length ) return;
  if ( game.user.isGM ) return drawAsGm(recipient, newName, otherNames);
  game.socket.emit(SOCKET_NAME, { type: "mix", recipientUuid: recipient.uuid, newName, otherNames });
}

export async function onMixRequest(payload, senderId) {
  const sender = game.users.get(senderId);
  const recipient = await fromUuid(payload.recipientUuid);
  if ( !sender || !recipient?.testUserPermission(sender, "OWNER") ) return;
  if ( !game.settings.get(MODULE_ID, "mixAnomaly") ) return;
  const otherNames = Array.isArray(payload.otherNames) ? payload.otherNames.map(String).slice(0, 5) : [];
  if ( !otherNames.length ) return;
  await drawAsGm(recipient, String(payload.newName), otherNames);
}
