# Vaelora İksirleri (vaelora-potions)

Foundry VTT 13 / dnd5e 5.3.3 modülü: Vaelora evrenine özel 200 Türkçe iksir ve GM anomali tablosu. Kullanıcı (Yolgonis) ile Türkçe konuş. Genel kampanya bağlamı: `C:\Claude\Vaelora\CLAUDE.md`.

- Bu klasör Foundry'de `Data\modules\vaelora-potions` junction'ıyla yüklenir; burada yapılan değişikliği Foundry doğrudan görür.
- GitHub: `Yolgonis/vaelora-potions` (gizli). Her iş bitince commit + push.
- `core.autocrlf=false` (satır sonları dönüştürülmez).

## İksir mekaniği nasıl değiştirilir

Compendium'u Foundry içinden elle düzenleme. Tek kaynak `json/vaelora-potions.json`; otomasyon `tools/automation.cjs` içinde tanımlıdır (identifier → heal / effect / drawback / actions). Değişiklikten sonra Foundry KAPALIYKEN:

```
node tools/apply-automation.cjs --dry-run
node tools/apply-automation.cjs
```

Betik JSON'u, `json/items/*.json` dosyalarını ve `packs/vaelora-potions` compendium'unu yazar; tekrar çalıştırılabilir ve compendium JSON'dan farklıysa durur.

Bedel keşfi: `scripts/costs.js` `TextEditor.enrichHTML`'i sarar; Vaelora iksirinde GM olmayan kullanıcı için secret görünürlüğünü sahiplik değil `revealedCosts` dünya ayarı belirler (dnd5e açıklamayı `secrets: item.isOwner` ile işlediğinden oyuncu bedeli kendi envanterinde görüyordu). İlk içişte açılır, GM sayfa başlığı düğmesi veya `VaeloraPotions` API'siyle açar/gizler.

Karıştırma: `scripts/mixing.js`; tablo `json/tables/vaelora-iksir-karisimi-tablosu.json` (VaeTbl0000000002). Tablo JSON'u değişince Foundry kapalıyken `node tools/write-tables.cjs`.

Çalışma zamanı: `scripts/main.js` içince efektleri ve iyileştirmeyi uygular (alıcı seçimi, menzilli iksirlerde hedef zorunluluğu, GM socket yolu). Midi-QOL "Self" menzilde hedefleri `dnd5e.preUseActivity`'den hemen önce temizler; betik bu yüzden son 500 ms'de bırakılan hedefi kullanır. `module.json`'daki `esmodules`/`socket` değişiklikleri ancak dünya yeniden başlatılınca okunur.

Kurallar: yalnızca koşulsuz mekanikler otomatikleşir; koşullu, tur başına bir kez, seçim gerektiren veya etki bittiğinde gelen kısımlar açıklamada GM'e kalır. Bedel ayrı efekt olmaz, iksirin efektine eklenir (ad GM'e özel bölümü ele vermesin). Ek aktiviteli iksirlerde `autoDestroy` kapalıdır.

## Dağıtım

Patreon/zip paketine `tools/`, `CLAUDE.md`, `.git*` girmez.
