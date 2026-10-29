# Vaelora İksirleri

Foundry VTT 13 ve D&D 5e 5.3.3 için hazırlanmış 300 özgün Türkçe iksir içerir (Common 100, Uncommon 80, Rare 60, Very Rare 40, Legendary 20).

- İksir compendium'u Common, Uncommon, Rare, Very Rare ve Legendary klasörlerine ayrılmıştır.
- Fiyatlar sabit değildir; aynı nadirlikteki iksirler etki gücü, süre, hasar/iyileştirme kapasitesi ve bedeline göre farklı fiyatlandırılır.
- Uzaklıklar ft, ağırlıklar lb ve fiyatlar gp cinsindendir.
- Bedel / Yan Etki bölümleri grup onu öğrenene kadar yalnızca GM'e görünür (aşağıda: Bedelin keşfi).
- Vaelora Anomali Yan Etki Tablosu ve Vaelora İksir Karışımı Tablosu ayrı ve GM erişimli compendium içindedir.

## Garip iksirler (3.7.0)

100 yeni iksir eklendi: 70 Common, 20 Uncommon, 10 Very Rare. Etkileri bilerek tuhaftır (taşla konuşmak, gölgeyi kâğıt inceliğine indirmek, tavanda yürümek, zamanı geri sarmak) ve her birinin bir bedeli vardır. Koşulsuz mekanikler (hız, avantaj/dezavantaj, direnç, ışık) içince otomatik uygulanır; kalanı açıklamada GM'e bırakılır. Mevcut 200 iksire dokunulmadı.

## Etki bitince gelen bedeller (3.8.0)

Etkinin SÜRESİ DOLUNCA gelen bedeller (23 iksir) artık kendiliğinden uygulanır: Bitkinlik Seviyesi, Can Puanı düşüşü, hasar, durumlar (Sersemlemiş, Zehirlenmiş, Etkisiz), süreli cezalar ve DC'li kurtarma atışları (zar atılır, başarısızsa bedel gelir). Otomatikleştirilemeyen kısımlar (biyolojik yaşlanma, anı kaybı vb.) GM'e hatırlatma olarak düşer.

GM'e her seferinde fısıltıyla bir kart gelir:
- **Geri al:** uygulanan Bitkinlik, can, hasar ve cezayı geri alır.
- **Yeniden at:** kurtarma atışlı bedellerde zarı yeniden atar.
- **Uygula:** onay gerektiren bedellerde (ör. Boşluk Kabı: saklanan büyü kullanılmadıysa hasar) bedeli GM onaylayınca uygular.

GM müdahalesi: Etkiyi süresi dolmadan elle silersen bedel hiç uygulanmaz. Ayar **Etki bitince bedelleri otomatik uygula** kapatılırsa tüm bedeller yalnızca kartın Uygula düğmesiyle uygulanır.

### Kurtarma atışını oyuncu atar (3.8.1)

Kurtarma atışlı bedellerde (Akrep Safrası, Mor Yankı Damıtısı, Kırk Gölge Tiryakı) karakterin sahibi bağlı bir oyuncuysa ona **Kurtarma atışını at** düğmeli bir kart gelir. Oyuncu zarı kendi istemcisinde atar; sonucu aktif GM alır, bedeli uygular ve kartı günceller. Karta oyuncu yalnızca bu düğmeyi görür, Geri al ve Yeniden at GM'e kalır. Bağlı oyuncu yoksa ya da ayar **Bedel kurtarma atışlarını oyuncu atsın** kapalıysa zar otomatik atılır.

## Zar süreli iksirler (3.7.1)

Süresi zar formülü olan iksirler (Zamanın Dışında Bir Damla: 1d4+1 tur) artık içilince süre atılıp efekt oluşturuluyor. Bir tur 6 saniye sayılır, atılan süre sohbette duyurulur ve efekt o kadar tur sürer. Formül `scripts/main.js` içindeki `DURATION_FORMULAS` tablosunda tutulur, çünkü dnd5e süre alanı zar formülü kabul etmez.

## İksir karıştırma (3.6.0)

Bir yaratık üzerinde bir Vaelora iksirinin etkisi sürerken başka bir Vaelora iksiri içilirse **Vaelora İksir Karışımı Tablosu**'nda 1d20 atılır. Herkese "iksirler birbirine karıştı" notu düşer; tablo sonucu yalnızca GM'e fısıldanır ve GM tarafından uygulanır. Sonuçların 17'si kötü ya da tuhaf, 3'ü iyidir. Aynı iksiri yeniden içmek karıştırma sayılmaz.

- Otomasyonu olmayan iksirler de içildiğinde süreleri kadar boş bir takip efekti alır; böylece karıştırma fark edilir ve GM kalan süreyi karakterde görür.
- Ayar: **İksir karışımı tablosu** (dünya ayarı, varsayılan açık). Otomatik uygulama açıkken çalışır.
- Anomali Yan Etki Tablosu değişmedi; Anomali Çözücüsü için kullanılmaya devam eder.

## 3.5.0 değişiklikleri

Birbirinin kopyası olan dört iksir yenisiyle değiştirildi; compendium kimlikleri aynı kaldı:

| Eski | Yeni |
|---|---|
| Zehirçiçeği İksiri (Akrep Safrası ile aynı) | Yalancı Nabız Damlası (U, 400 gp) |
| Kurtkulak Özütü (Çınlayan Kulak Toniği ile aynı) | Ödünç Ses Şurubu (U, 250 gp) |
| Kıvılcım Yudumu (Ateşböceği Şurubu ile aynı) | Kayıp Eşya Tuzu (C, 90 gp) |
| Sessiz Ayak İksiri (Yankısız Adım ile aynı) | Paylaşılan Gölge İksiri (U, 450 gp) |

Yalnızca direnç veren beş iksire elemente uygun birer özellik eklendi ve fiyatları yükseldi: Buzdamarı (175 gp), Közdamarı (225 gp), Fırtına Camı (275 gp), Güneş Kabuğu (250 gp), Mezar Tuzu (250 gp). Eklenen özellikler koşullu olduğu için GM tarafından uygulanır.

## Bedelin keşfi (3.4.0)

Her iksirin Bedel / Yan Etki bölümü, grup onu öğrenene kadar oyunculardan gizlidir; iksir oyuncunun envanterindeyken de. Bedel öğrenilince grubun bütün üyeleri onu hem envanterde hem compendium'da görür.

- **İçerek öğrenme:** Bir iksir ilk kez içildiğinde bedeli açılır ve sohbete yazılır. Kimin içtiği önemli değil; bilgi bütün grup için ortaktır.
- **GM kararı:** Simya incelemesi, Identify veya bir NPC'nin anlatması gibi durumlarda GM, iksir sayfasının başlık menüsündeki **Bedeli oyunculara aç / gizle** düğmesini kullanır.
- **Makro API:** `VaeloraPotions.revealCost("goktasi-derisi-iksiri")`, `VaeloraPotions.hideCost(...)`, `VaeloraPotions.isCostKnown(...)`, `VaeloraPotions.knownCosts()`. Bir eşya da verilebilir.

## Otomasyon (3.3.0)

80 iksirin koşulsuz mekanikleri otomatiktir:

- **Süreli efekt (60 iksir):** İçince karaktere iksir süresince bir Active Effect uygulanır: direnç ve bağışıklık, durum bağışıklığı, avantaj (yetenek, kurtarma, konsantrasyon), hız ve uçuş, karanlık görüş, AC, silah hasarı bonusu, azami can, boyut.
- **İyileştirme (3 iksir):** Taşkalp (geçici can), Kan Borcu (5 ft içindeki bir yaratık), İlk Şafağın Gözyaşı (tam can).
- **Ek aktiviteler (14):** İçtikten sonra kullanılan nefesler, kurtarma zarları ve alan saldırıları kendi DC'si, hasarı, şablonu ve kullanım hakkıyla aktivite olarak eklenmiştir. Bu iksirlerde şişe içildikten sonra envanterde boş olarak kalır (resmî Potion of Fire Breath gibi); haklar bitince silinebilir.

- **Bedel / Yan Etki (29 iksir):** İksir süresince geçerli, koşulsuz bedeller (dezavantaj, zayıflık, hız düşüşü, Sağır/Bilinçsiz) iksirin kendi efektine eklenir; ayrı bir "Bedel" efekti görünmez. Etki bittiğinde veya tetiklendiğinde gelen bedeller (bitkinlik, yaşlanma vb.) GM tarafından uygulanır.

### İçince otomatik uygulama

"İç" aktivitesi kullanılınca modülün betiği efektleri ve iyileştirmeyi kendisi uygular; sohbet kartındaki düğmeye gerek yoktur. Son şişe içilip eşya silindiğinde de çalışır ve Midi-QOL ayarlarından bağımsızdır.

- **Kime:** Varsayılan olarak içen karaktere. Tam olarak bir dost token hedefliyken içilen iksir o yaratığa içirilir; düşman hedefliyken içen alır.
- **Menzilli iksirler** (Kan Borcu, 5 ft): Tek bir hedef ister. Hedef yoksa kullanım şişe harcanmadan iptal edilir.
- **Yeniden içme:** Aynı iksirin eski efekti silinir, süre tazelenir.
- **İyileştirme:** Zar alıcının değerleriyle atılır (İlk Şafağın Gözyaşı alıcının azami canını kullanır), sonuç sohbete düşer ve uygulanır.
- **Başkasının karakteri:** Oyuncu alıcının sahibi değilse işlem bağlı GM üzerinden yapılır; GM efekti compendium'dan kurar.
- Ayar: **İksirleri içince otomatik uygula** (dünya ayarı, varsayılan açık). Midi-QOL'ün "Auto apply item effects" ayarı kapalıyken test edildi; açıkken çift uygulama denenmedi.

Koşullu ("zehre karşı", "açık gökyüzü altındayken"), tur başına bir kez, seçim gerektiren veya anlatısal kısımlar açıklamada kalır ve GM tarafından yönetilir. Işık efektleri ATL (Active Token Effects), bazı efektler Midi-QOL bayrakları kullanır.

Not: Karakterlerin envanterinde zaten bulunan iksir kopyaları otomatik güncellenmez; compendium'dan yeniden sürüklenmelidir.