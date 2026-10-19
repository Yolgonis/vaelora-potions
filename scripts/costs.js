/**
 * Vaelora İksirleri — Bedel / Yan Etki keşfi.
 *
 * Her iksirin açıklamasındaki tek secret block "Bedel / Yan Etki" bölümüdür.
 * dnd5e açıklamayı `secrets: item.isOwner` ile işlediği için oyuncu, envanterine
 * giren iksirin bedelini görürdü. Burada bedel, grup onu öğrenene kadar GM
 * dışındaki herkesten gizlenir; öğrenildikten sonra compendium'da da görünür.
 *
 * Öğrenme:
 *  - Bir iksir ilk kez içildiğinde bedeli herkes için açılır ve sohbete düşer.
 *  - GM, iksir sayfasının başlığındaki düğmeyle veya API ile açar/gizler
 *    (simya incelemesi, Identify gibi kararlar GM'de kalır).
 *
 * Bilgi dünya ayarında tutulur (`revealedCosts`: identifier -> true); yalnızca
 * GM yazabildiği için oyuncunun içmesi socket ile aktif GM'e bildirilir.
 */

export const MODULE_ID = "vaelora-potions";
export const SOCKET_NAME = `module.${MODULE_ID}`;
export const PACK_ID = `${MODULE_ID}.vaelora-potions`;
const SETTING = "revealedCosts";

export function isVaeloraPotion(item) {
  return item?.type === "consumable" && Boolean(item.flags?.[MODULE_ID]);
}

export function isCostKnown(identifier) {
  return Boolean(game.settings.get(MODULE_ID, SETTING)?.[identifier]);
}

async function findPotion(identifier) {
  const pack = game.packs.get(PACK_ID);
  const index = await pack.getIndex({ fields: ["system.identifier"] });
  const entry = index.find(e => e.system?.identifier === identifier);
  return entry ? pack.getDocument(entry._id) : null;
}

function costHtml(item) {
  const html = item.system.description.value ?? "";
  const section = new DOMParser().parseFromString(html, "text/html").querySelector("section.secret");
  return section?.innerHTML ?? "";
}

async function setKnown(identifier, known) {
  const current = { ...game.settings.get(MODULE_ID, SETTING) };
  if ( known ) current[identifier] = true;
  else delete current[identifier];
  await game.settings.set(MODULE_ID, SETTING, current);
}

/** Yalnızca GM çağırır. */
async function revealAsGm(identifier, { announce = false, speakerActor = null } = {}) {
  if ( isCostKnown(identifier) ) return false;
  const item = await findPotion(identifier);
  if ( !item ) return false;
  await setKnown(identifier, true);
  if ( announce ) {
    await ChatMessage.create({
      speaker: speakerActor ? ChatMessage.getSpeaker({ actor: speakerActor }) : ChatMessage.getSpeaker({ alias: "Vaelora İksirleri" }),
      content: `<div class="vaelora-potion-cost"><p><strong>${item.name}</strong>: bedeli artık biliniyor.</p>${costHtml(item)}</div>`
    });
  }
  return true;
}

/** İçme sonrası: GM doğrudan açar, oyuncu aktif GM'den ister. */
export function revealOnDrink(item, drinker) {
  const identifier = item.system.identifier;
  if ( isCostKnown(identifier) ) return;
  if ( game.user.isGM ) return revealAsGm(identifier, { announce: true, speakerActor: drinker });
  game.socket.emit(SOCKET_NAME, { type: "reveal", identifier, drinkerUuid: drinker.uuid });
}

export async function onRevealRequest(payload, senderId) {
  const sender = game.users.get(senderId);
  const drinker = await fromUuid(payload.drinkerUuid);
  if ( !sender || !drinker?.testUserPermission(sender, "OWNER") ) return;
  await revealAsGm(payload.identifier, { announce: true, speakerActor: drinker });
}

/**
 * dnd5e ve Tidy sayfaları açıklamayı `relativeTo: item` ile zenginleştirir.
 * Vaelora iksirinde GM olmayan kullanıcı için secret görünürlüğünü sahiplik
 * değil, bedelin bilinip bilinmediği belirler.
 */
function patchEnrichHTML() {
  const cls = foundry.applications.ux.TextEditor.implementation;
  if ( cls.enrichHTML._vaeloraPotions ) return;
  const original = cls.enrichHTML;
  const wrapped = async function(content, options = {}) {
    const item = options?.relativeTo;
    if ( !game.user.isGM && isVaeloraPotion(item) ) {
      options = { ...options, secrets: isCostKnown(item.system.identifier) };
    }
    return original.call(this, content, options);
  };
  wrapped._vaeloraPotions = true;
  cls.enrichHTML = wrapped;
}

function rerenderPotionSheets() {
  for ( const app of foundry.applications.instances.values() ) {
    if ( isVaeloraPotion(app.document) || (app.document?.documentName === "Actor") ) app.render();
  }
  for ( const app of Object.values(ui.windows) ) {
    if ( isVaeloraPotion(app.document) || (app.document?.documentName === "Actor") ) app.render();
  }
}

export const api = {
  isCostKnown,
  /** Bedeli herkes için açar (yalnızca GM). announce: sohbete yaz. */
  async revealCost(identifierOrItem, { announce = true } = {}) {
    if ( !game.user.isGM ) throw new Error("Yalnızca GM bedel açabilir.");
    const id = identifierOrItem?.system?.identifier ?? identifierOrItem;
    return revealAsGm(id, { announce });
  },
  /** Bedeli yeniden gizler (yalnızca GM). */
  async hideCost(identifierOrItem) {
    if ( !game.user.isGM ) throw new Error("Yalnızca GM bedel gizleyebilir.");
    const id = identifierOrItem?.system?.identifier ?? identifierOrItem;
    await setKnown(id, false);
  },
  knownCosts() {
    return Object.keys(game.settings.get(MODULE_ID, SETTING) ?? {});
  }
};

export function registerCosts() {
  game.settings.register(MODULE_ID, SETTING, {
    scope: "world",
    config: false,
    type: Object,
    default: {},
    onChange: () => rerenderPotionSheets()
  });
  patchEnrichHTML();

  // GM için iksir sayfası başlığında aç/gizle düğmesi.
  Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
    const item = app.document;
    if ( !game.user.isGM || !isVaeloraPotion(item) ) return;
    const known = isCostKnown(item.system.identifier);
    controls.push({
      icon: known ? "fa-solid fa-eye-slash" : "fa-solid fa-eye",
      label: known ? "Bedeli oyunculardan gizle" : "Bedeli oyunculara aç",
      action: "vaeloraToggleCost",
      onClick: () => known ? api.hideCost(item) : api.revealCost(item)
    });
  });
}
