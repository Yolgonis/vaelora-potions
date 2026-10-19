/**
 * Vaelora İksirleri — içince otomatik uygulama.
 *
 * Bir Vaelora iksirinin "İç" aktivitesi kullanılınca iksirin efektleri alıcıya
 * uygulanır, iyileştirme iksirlerinde zar atılıp sonuç uygulanır. Son şişe
 * içilince eşya silinir ve kartın efekt düğmesi kaybolur; bu betik o düğmeye
 * gerek bırakmaz. Midi-QOL ayarlarından bağımsız çalışır.
 *
 * Alıcı: içen karakter. Oyuncu tam olarak bir token hedeflemişse ve o token
 * içenle aynı tavırdaysa (dost-dost), iksir ona içirilmiş sayılır. Düşman
 * hedefliyken içilen iksir içene uygulanır.
 *
 * Oyuncunun sahibi olmadığı bir alıcıda iş aktif GM'e gider; socket üzerinden
 * yalnızca iksir kimliği gönderilir, GM efekti compendium'dan yeniden kurar.
 *
 * Bedel / Yan Etki keşfi: ./costs.js
 * İksir karıştırma: ./mixing.js
 */

import { MODULE_ID, SOCKET_NAME, PACK_ID, isVaeloraPotion, registerCosts, revealOnDrink, onRevealRequest, api } from "./costs.js";
import { registerMixing, activeOtherPotions, triggerMix, onMixRequest } from "./mixing.js";

const UNIT_SECONDS = { round: 6, turn: 6, minute: 60, hour: 3600, day: 86400 };

/** activity.uuid -> alıcı aktörün uuid'si (preUse'da belirlenir, postUse'da kullanılır) */
const pendingRecipients = new Map();

/**
 * Midi-QOL "Self" menzilli aktivitelerde hedefleri dnd5e.preUseActivity'den
 * hemen önce temizliyor. Kısa süre önce bırakılan hedefler burada tutulur.
 */
const UNTARGET_WINDOW_MS = 500;
let recentlyUntargeted = [];

function isEnabled() {
  return game.settings.get(MODULE_ID, "autoApply");
}

/** İksirin ilk aktivitesi "İç" aktivitesidir; ek aktiviteler (nefes, saldırı) kendi kartlarıyla çalışır. */
function isDrinkActivity(activity) {
  const item = activity?.item;
  return isVaeloraPotion(item) && item.system.activities.contents[0]?.id === activity.id;
}

function currentTargets() {
  const targets = Array.from(game.user.targets);
  if ( targets.length ) return targets;
  const since = Date.now() - UNTARGET_WINDOW_MS;
  return Array.from(new Set(recentlyUntargeted.filter(r => r.at >= since).map(r => r.token)))
    .filter(token => token.document && !token.destroyed);
}

/**
 * "Self" menzilli iksir içene gider; tek bir dost hedef varsa ona içirilir.
 * Menzilli iksir (ör. Kan Borcu, 5 ft) tek bir hedef ister; hedef yoksa null döner
 * ve kullanım şişe harcanmadan iptal edilir.
 */
function resolveRecipient(activity) {
  const drinker = activity.actor;
  const targets = currentTargets().filter(t => t.actor);
  const target = targets.length === 1 ? targets[0] : null;
  if ( (activity.range?.units ?? "self") !== "self" ) return target?.actor ?? null;
  if ( !target || (target.actor === drinker) ) return drinker;
  const own = drinker.getActiveTokens(false, true)[0] ?? drinker.prototypeToken;
  return target.document.disposition === own.disposition ? target.actor : drinker;
}

/**
 * Otomasyonu olmayan iksir için süresi kadar, değişikliksiz bir takip efekti.
 * GM süreyi karakterde görür; karıştırma da bu efektle fark edilir.
 */
function trackingEffect(item, activity) {
  const { value, units } = activity.duration ?? {};
  const seconds = UNIT_SECONDS[units] * Number(value);
  if ( !Number.isFinite(seconds) || (seconds <= 0) ) return null;
  return {
    name: item.name, img: item.img, origin: item.uuid, transfer: false, disabled: false, changes: [],
    duration: { seconds, rounds: units === "round" ? Number(value) : null },
    flags: { [MODULE_ID]: { potion: item.system.identifier, tracking: true } }
  };
}

function buildEffectData(item, activity) {
  const identifier = item.system.identifier;
  const effects = activity.effects
    .map(({ _id }) => item.effects.get(_id))
    .filter(Boolean)
    .map(effect => {
      const data = effect.toObject();
      delete data._id;
      data.origin = effect.uuid;
      data.transfer = false;
      data.disabled = false;
      data.duration = { ...data.duration, startTime: null, startRound: null, startTurn: null, combat: null };
      foundry.utils.setProperty(data, `flags.${MODULE_ID}.potion`, identifier);
      return data;
    });
  if ( effects.length ) return effects;
  const tracking = trackingEffect(item, activity);
  return tracking ? [tracking] : [];
}

async function applyPotion({ item, activity, recipient, speakerActor }) {
  const identifier = item.system.identifier;

  // Başka bir iksirin etkisi sürerken içildiyse karışım tablosu atılır.
  const mixedWith = activeOtherPotions(recipient, identifier);

  // Aynı iksir yeniden içilirse eski efekt yenisiyle değişir (süre tazelenir).
  const effects = buildEffectData(item, activity);
  if ( effects.length ) {
    const stale = recipient.effects.filter(e => e.getFlag(MODULE_ID, "potion") === identifier).map(e => e.id);
    if ( stale.length ) await recipient.deleteEmbeddedDocuments("ActiveEffect", stale);
    await recipient.createEmbeddedDocuments("ActiveEffect", effects);
  }

  if ( (activity.type === "heal") && activity.healing?.formula ) {
    const type = activity.healing.types.first() ?? "healing";
    const roll = new CONFIG.Dice.DamageRoll(activity.healing.formula, recipient.getRollData(), { type, types: [type] });
    await roll.evaluate();
    const label = game.i18n.localize(CONFIG.DND5E.healingTypes[type]?.label ?? "DND5E.Healing");
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: speakerActor }),
      flavor: recipient === speakerActor ? `${item.name}: ${label}` : `${item.name} → ${recipient.name}: ${label}`
    });
    await recipient.applyDamage([{ value: roll.total, type }]);
  }

  if ( mixedWith.length ) await triggerMix(recipient, item.name, mixedWith);
}

async function requestGmApply(item, drinker, recipient) {
  if ( !game.users.activeGM ) {
    ui.notifications.warn(`${item.name}: ${recipient.name} üzerine uygulamak için bağlı bir GM gerekiyor.`);
    return;
  }
  game.socket.emit(SOCKET_NAME, {
    type: "apply",
    identifier: item.system.identifier,
    drinkerUuid: drinker.uuid,
    recipientUuid: recipient.uuid
  });
}

async function onGmApplyRequest(payload, senderId) {
  const sender = game.users.get(senderId);
  const [drinker, recipient] = await Promise.all([fromUuid(payload.drinkerUuid), fromUuid(payload.recipientUuid)]);
  if ( !sender || !drinker || !recipient ) return;
  if ( !drinker.testUserPermission(sender, "OWNER") ) return;

  const pack = game.packs.get(PACK_ID);
  const index = await pack.getIndex({ fields: ["system.identifier"] });
  const entry = index.find(e => e.system?.identifier === payload.identifier);
  if ( !entry ) return;
  const item = await pack.getDocument(entry._id);
  await applyPotion({ item, activity: item.system.activities.contents[0], recipient, speakerActor: drinker });
}

Hooks.once("init", () => {
  registerCosts();
  registerMixing();
  game.settings.register(MODULE_ID, "autoApply", {
    name: "İksirleri içince otomatik uygula",
    hint: "Bir Vaelora iksiri içilince efektleri ve iyileştirmesi kendiliğinden uygulanır. Tek bir dost token hedeflenmişse iksir ona içirilir. Kapalıyken efektler sohbet kartındaki düğmeyle uygulanır.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

function onSocket(payload, senderId) {
  if ( !game.users.activeGM?.isSelf ) return;
  if ( payload?.type === "apply" ) return onGmApplyRequest(payload, senderId);
  if ( payload?.type === "reveal" ) return onRevealRequest(payload, senderId);
  if ( payload?.type === "mix" ) return onMixRequest(payload, senderId);
}

Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).api = api;
  globalThis.VaeloraPotions = api;
  game.socket.on(SOCKET_NAME, onSocket);
});

Hooks.on("targetToken", (user, token, targeted) => {
  if ( user !== game.user ) return;
  const since = Date.now() - UNTARGET_WINDOW_MS;
  recentlyUntargeted = recentlyUntargeted.filter(r => (r.at >= since) && (r.token !== token));
  if ( !targeted ) recentlyUntargeted.push({ token, at: Date.now() });
});

Hooks.on("dnd5e.preUseActivity", (activity, usageConfig) => {
  if ( !isEnabled() || !isDrinkActivity(activity) ) return;
  const recipient = resolveRecipient(activity);
  if ( !recipient ) {
    // Şişe harcanmadan önce durdur.
    ui.notifications.warn(`${activity.item.name} bir hedef ister: önce tek bir token hedefle.`);
    return false;
  }
  pendingRecipients.set(activity.uuid, recipient.uuid);
  // İyileştirmeyi bu betik atar; dnd5e'nin ikinci bir iyileştirme zarı atmasını engelle.
  if ( activity.type === "heal" ) usageConfig.subsequentActions = false;
});

Hooks.on("dnd5e.postUseActivity", (activity) => {
  if ( !isEnabled() || !isDrinkActivity(activity) ) return;
  if ( !pendingRecipients.has(activity.uuid) ) return;
  const recipientUuid = pendingRecipients.get(activity.uuid);
  pendingRecipients.delete(activity.uuid);
  const item = activity.item;
  const drinker = activity.actor;
  const recipient = fromUuidSync(recipientUuid) ?? drinker;

  const run = recipient.isOwner
    ? applyPotion({ item, activity, recipient, speakerActor: drinker })
    : requestGmApply(item, drinker, recipient);
  run.catch(err => {
    console.error(`${MODULE_ID} | ${item.name} uygulanamadı`, err);
    ui.notifications.error(`${item.name} otomatik uygulanamadı; sohbet kartındaki düğmeyi kullanın.`);
  });
});

// İçilen iksirin bedeli grup için öğrenilir (otomatik uygulama kapalı olsa da).
Hooks.on("dnd5e.postUseActivity", (activity) => {
  if ( !isDrinkActivity(activity) ) return;
  Promise.resolve(revealOnDrink(activity.item, activity.actor))
    .catch(err => console.error(`${MODULE_ID} | bedel açılamadı`, err));
});
