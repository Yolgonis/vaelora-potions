/**
 * Garip iksirler — Uncommon (20, 125–500 gp) ve Very Rare (10, 7500–50000 gp).
 * U/V(ad, tat/görünüş, etki, süre, bedel, fiyat, otomasyon?) — garip-ortak.cjs ile aynı biçim.
 */
module.exports = (h, P) => {
  const { adv, dis, walk, move, sense, res, vuln, imm, c, MODE, setSpeed } = h;
  const U = (...a) => P("uncommon", ...a);
  const V = (...a) => P("veryRare", ...a);

  // ---------------- Uncommon ----------------
  U("İkiz Ses İksiri", "Berrak sıvı, içildiğinde boğazda iki ayrı titreşim bırakır.",
    "Sesin 60 ft içindeki herhangi bir noktadan çıkıyormuş gibi gelir; kendi ağzından konuşmadan o noktadan konuşabilirsin. Sesi yalnızca duymak isteyenler algılar.",
    "1h", "Kendi sesini duymakta zorlanırsın; Karizma (Performans) kontrollerinde dezavantaj alırsın.", 150,
    { drawback: { changes: [dis.skill("prf")] } });

  U("Duvar Yürüyüşü Özü", "Yapışkan, gri bir öz; parmak uçlarına sürülür gibi serinlik verir.",
    "Düz duvarlarda ve tavanlarda ellerin serbestken yürüyebilirsin; tırmanma hızın 30 ft olur.",
    "1h", "Zeminde yürürken ayakların yapışır; yatay yüzeylerde Hızın 10 ft azalır.", 400,
    { effect: { changes: [move("climb", 30)] }, drawback: { changes: [walk(-10)] } });

  U("Kırk Parmak Tozu", "İnce, gri bir toz; avuçta kıpırdadığı hissedilir.",
    "Parmakların inanılmaz ustalaşır: El Çabukluğu kontrollerinde avantaj kazanırsın ve her turun başında bir ek nesne etkileşimi yaparsın.",
    "1h", "Kaba kuvvet gerektiren işlerde güçsüzleşirsin; Kuvvet (Atletizm) kontrollerinde dezavantaj alırsın.", 250,
    { effect: { changes: [adv.skill("slt")] }, drawback: { changes: [dis.skill("ath")] } });

  U("Rüzgâr Fısıltısı İksiri", "Hafif, havalı bir sıvı; yudumlandığında kulağın içinde rüzgâr uğuldar.",
    "Rüzgârın taşıdığı sesleri duyarsın: rüzgârla gelen konuşmaları, 1 mil'e kadar, rüzgârın yönünden anlarsın. Rüzgâr yoksa etki yoktur.",
    "8h", "Rüzgârlı havada konuşmalar sürekli kulağına fısıldar; Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 175,
    { drawback: { changes: [dis.skill("prc")] } });

  U("Eşya Yankısı İksiri", "Hafif metalik tatta, ağızda eski bir madeni para gibi.",
    "Dokunduğun bir nesnenin son bir saat içinde yaşadığı en belirgin olayı görürsün (kim tuttu, ne duydu); sahne yalnızca nesnenin çevresindekileri gösterir.",
    "10m", "Her görüşten sonra başın döner; o tur sonuna kadar Zekâ (Soruşturma) kontrollerinde dezavantaj alırsın.", 300);

  U("Yağmur Gözü İksiri", "Mavi gri bir sıvı, dilin üstünde yağmur damlası gibi yayılır.",
    "Hava durumunu 24 saat öncesinden bilirsin; yağmur, kar ve sis içinde Gizlilik kontrollerinde avantaj kazanırsın.",
    "8h", "Açık, kuru havada Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 200,
    { effect: { changes: [adv.skill("ste")] } });

  U("Çürük Dokunuş Özütü", "Mantar ve nemli toprak kokan koyu bir sıvı.",
    "Dokunduğun yiyecek, ahşap ya da bitki saniyeler içinde çürür (en fazla 10 lb). Canlı yaratıklara etki etmez.",
    "10m", "Dokunduğun her organik şey çürüme eğilimi gösterir; ellerin çıplakken yiyecek tutamazsın.", 275);

  U("Sessizlik Küresi Şurubu", "Yutmak için çok sessiz bir şurup; kendi yutkunuşunu duymazsın.",
    "Bonus Aksiyon ile 10 ft yarıçaplı bir sessizlik küresi yaratırsın; kürenin içinde ses çıkmaz, ses geçmez. Küre sana bağlıdır ve seninle hareket eder (süre boyunca 1 kez).",
    "1h", "Küre içinde sen de konuşamazsın; sözel bileşenli Büyüleri yapamazsın.", 350);

  U("Kemik Boğaz Şurubu", "Ağızda kuru bir kemik tozu tadı bırakır.",
    "Duyduğun herhangi bir sesi birebir taklit edebilirsin; konuşma, kapı sesi, hayvan ve çalgı. Taklit için Karizma (Aldatma) kontrollerinde avantaj kazanırsın.",
    "1h", "Kendi gerçek sesini bir süre unutursun; normal konuşurken Karizma (İkna) kontrollerinde dezavantaj alırsın.", 225,
    { effect: { changes: [adv.skill("dec")] }, drawback: { changes: [dis.skill("per")] } });

  U("Taş Kalp Çorbası", "Ağır, kireç kokulu bir çorba.",
    "Taş ve toprak aracılığıyla 30 ft içindeki yürüyen yaratıkların titreşimini hissedersin (tremorsense 30 ft).",
    "1h", "Bedenin ağırlaşır; Hızın 10 ft azalır.", 325,
    { effect: { changes: [sense("tremorsense", 30)] }, drawback: { changes: [walk(-10)] } });

  U("Kıvılcım Parmak Şurubu", "Ekşi, hafif çıtırtılı bir sıvı.",
    "Parmak uçların kıvılcım saçar: 30 ft içindeki bir ateşi tutuşturabilir, kilitleri ve metal nesneleri hafifçe sarsabilirsin. Silahsız vuruşlarına ek 1d4 yıldırım hasarı eklenir (süre boyunca 3 kez).",
    "10m", "Kıvılcım sana da zarar verir: her kullanımda 1 yıldırım hasarı alırsın.", 275);

  U("Yedi Fersah Şurubu", "Toprak kokulu, ağır içimli bir şurup.",
    "Hızın 30 ft artar.",
    "1h", "Dengeni zor korursun; Çeviklik (Akrobasi) kontrollerinde dezavantaj alırsın.", 450,
    { effect: { changes: [walk(30)] }, drawback: { changes: [dis.skill("acr")] } });

  U("Üçüncü El İksiri", "Parlak yeşil bir sıvı; elinde hafif bir ağırlık bırakır.",
    "Görünmez bir üçüncü elin 30 ft içinde 10 lb'ye kadar nesneleri taşır, kapı açar, ip çözer; saldırı yapamaz.",
    "1h", "Gerçek ellerin titrer; El Çabukluğu kontrollerinde dezavantaj alırsın.", 300,
    { drawback: { changes: [dis.skill("slt")] } });

  U("İç Ses Fısıltısı İksiri", "Tatsız, ince bir sıvı; yutunca kafatasında tatlı bir uğultu yayar.",
    "30 ft içinde görebildiğin dostlarınla düşünce yoluyla konuşabilirsin; onlar da sana cevap verebilir.",
    "1h", "Aklından geçen her şey tartışmaya açıktır; yüzeysel düşüncelerin sızar. Bilgelik kurtarma atışlarında dezavantaj alırsın.", 250);

  U("Hayalet Kapı Damlası", "Bulutlu, ışık geçiren bir damla.",
    "Bir kez, 1 ft kalınlığa kadar bir duvardan ya da kapıdan geçebilirsin. Yanında taşıdığın nesneler geçmez, geride kalır.",
    "inst", "Geçerken bir tur boyunca Duyarsız olursun (Aksiyon alamazsın).", 450);

  U("Çift Gölge İksiri", "Gri sıvı, şişede iki ayrı gölge çizer.",
    "Gölgenin bir kopyası 30 ft içinde bir noktada belirir; Aldatma (Karizma) kontrollerinde avantaj kazanırsın ve saldırılar kopyayı hedef alabilir (kopya ilk vuruşta dağılır).",
    "10m", "Gölgenin kopyası dağıldığında 1d4 psişik hasar alırsın.", 200,
    { effect: { changes: [adv.skill("dec")] } });

  U("Uyuklayan Taş Şurubu", "Ağır, taş tozu kokulu sakin bir sıvı.",
    "Hareketsiz kaldığında taş bir kütle gibi görünürsün; hareketsizken Gizlilik kontrollerinde avantaj kazanır ve doğal taşlardan ayırt edilemezsin.",
    "8h", "Hareket ettiğinde etki biter (ilk adımdan sonra).", 150,
    { effect: { changes: [adv.skill("ste")] } });

  U("Kuş Beyni İksiri", "Açık mavi, tüy hafifliğinde bir sıvı.",
    "Görüş alanındaki bir kuşun gözünden 10 dakika boyunca görebilirsin; bu sırada kendi bedenin görmez ve duymaz.",
    "10m", "Kuşun duygularını da yaşarsın; kuş korkarsa sen de korkarsın (Bilgelik kurtarma atışı DC 12).", 175);

  U("Taşan Kalp İksiri", "Sıcak, kırmızı bir sıvı; bedene yayılırken kalp çarpar.",
    "Dokunduğun bir yaratığı, kendi Can Puanından 1d6 harcayarak 2d6 iyileştirebilirsin (süre boyunca 3 kez).",
    "1h", "Harcadığın Can Puanları iyileştirme ile geri kazanılamaz; ancak Dinlenme ile yenilenir.", 275);

  U("Dilsiz Nöbet İksiri", "Acı kahve gibi bir sıvı, midede ağırlık bırakır.",
    "Uyumazsın ve uyuma ihtiyacın olmaz; büyülü uykuya karşı Dayanıklılık kurtarma atışlarında avantaj kazanırsın. Nöbet tutarken Algı kontrollerinde avantaj kazanırsın.",
    "8h", "Etki bittiğinde 1 saat boyunca Bilgelik kurtarma atışlarında dezavantaj alırsın.", 200,
    { effect: { changes: [adv.skill("prc")] } });

  // ---------------- Very Rare ----------------
  V("Tavan Yürüyüşü Özütü", "Mat siyah bir sıvı; şişeyi eğdiğinde damlalar yukarı akar.",
    "Yerçekimi senin için tersine döner: tavanlarda, duvarlarda ve baş aşağı yürürsün, düşme ya da yön kaybı yaşamazsın. İstediğin zaman normale dönebilirsin (Bonus Aksiyon).",
    "1h", "Normale döndüğünde yere düşebilirsin; yüksekte normale dönersen düşme hasarı alırsın.", 12000,
    { effect: { changes: [move("climb", 30)] } });

  V("Kırk Gölge Tiryakı", "Siyah şurup, her bakışta farklı bir yönde gölge çizer.",
    "Gölgen dört kopyaya bölünür; kopyalar 60 ft içinde hareket eder ve aynı hareketleri taklit eder. Saldırı yapamazlar ama düşmanları yanıltırlar: seni hedef alan saldırılar dezavantajlı olur.",
    "1h", "Etki sona erdiğinde kopyalar sana geri döner; o turda gölgen sende değildir (Bilgelik kurtarma atışı DC 16, başarısızlıkta 1 tur sersemlersin).", 30000);

  V("Eşyaların Ruhu Tiryakı", "Altın renkli bir sıvı; şişedeki her dalga eşyaya benzer bir şekil alır.",
    "Dokunduğun, en fazla 10 adet Küçük ya da Orta nesne canlanır ve emirlerini dinler (Animated Objects olarak çalışır).",
    "10m", "Canlandırılan eşyalar etki bitince kendiliğinden dağılabilir; bazıları sana düşmanca davranabilir (GM).", 20000);

  V("Zamanın Makası İksiri", "Gümüş bir sıvı; şişedeki damlalar bazen geriye doğru akar.",
    "Etki süresince bir kez, Reaksiyon olarak son 6 saniyeyi (1 turu) geri sarabilirsin; kendi turundaki tüm eylemlerini yeniden yaparsın. Diğer yaratıklar ne olduğunu hatırlar.",
    "1h", "Geri sarma sonrası 2 Bitkinlik Seviyesi kazanırsın.", 40000);

  V("Gökyüzü Tersine İksiri", "Yarı saydam mavi bir sıvı, içinde bulutlar döner.",
    "Gökyüzü ile zemin senin için yer değiştirir: 120 ft içindeki bir alanı seçersin; o alandaki yaratıklar yukarı düşer (yerçekimi tersine döner) ve tavana çarparsa 1d6 darbe hasarı alır.",
    "1h", "Alan seni de kapsayabilir; seçimini yanlış yaparsan sen de yukarı düşersin (Çeviklik kurtarma atışı DC 16).", 15000);

  V("Yankı Evreni Özütü", "Berrak ama ses geçirmez; şişeye vurunca titreşim duyulur.",
    "Kör görüş 120 ft: gözlerin kapalı olsan bile ses yankısıyla çevreni görürsün.",
    "1h", "Etki süresince sağır kalırsın ve bu sırada sesli komutlara karşılık veremezsin.", 35000,
    { effect: { changes: [sense("blindsight", 120)] }, drawback: { statuses: ["deafened"] } });

  V("Yağmur Çağıran Kan", "Gri bulut kokulu koyu bir sıvı.",
    "Bir mil yarıçapında hava durumunu değiştirirsin: yağmur, fırtına, kar ya da açık hava (bir seçim, 1 saat içinde olur).",
    "1d", "Hava seni takip eder; ruh halin hava durumunu etkiler (GM).", 25000);

  V("Gölge Takas İksiri", "Gece rengi bir sıvı; yutunca gölgen bir adım gerinde kalır.",
    "Bir gölgeden başka bir gölgeye ışınlanırsın: 500 ft içinde loş ışık ya da karanlıkta, görebildiğin bir noktaya (Bonus Aksiyon, süre boyunca 3 kez).",
    "1h", "Her ışınlanmadan sonra gölgen sana bir tur geç gelir; saldırılara karşı o turda AC'in 2 azalır.", 20000);

  V("İsimsiz Rüya İksiri", "Opak mor bir sıvı; kokusu ve tadı yoktur.",
    "Uyurken bir yaratığın rüyasına girebilirsin (adını ve yüzünü biliyorsan). Rüyada onunla konuşabilir, ona bir mesaj bırakabilirsin; uyanınca rüyayı hatırlar.",
    "8h", "Rüyadan çıkarken DC 16 Bilgelik kurtarma atışı yaparsın; başarısızsa 1 saat boyunca uyanamazsın.", 45000);

  V("Taştan Bedel İksiri", "Gri, ağır bir sıvı; şişeyi tutan eli taşlaştırır.",
    "Bedenin taşa dönüşür: kesici, delici ve ezici hasara karşı direnç kazanırsın ve hareket etmesen de yaşarsın.",
    "1h", "Hızın 10 ft'e düşer ve Çeviklik kurtarma atışlarında otomatik başarısız olursun.", 30000,
    { effect: { changes: res("bludgeoning", "piercing", "slashing") }, drawback: { changes: [setSpeed("walk", 10)] } });
};
