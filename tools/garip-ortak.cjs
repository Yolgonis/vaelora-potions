/**
 * Garip iksirler — Common (70). Fiyat 50–100 gp.
 * C(ad, tat/görünüş, etki, süre, bedel, fiyat, otomasyon?)
 * Süre: "10m" dakika, "1h" saat, "1d" gün, "3r" tur, "inst" anlık.
 * Otomasyon yalnızca koşulsuz mekanikleri kapsar; gerisi açıklamada GM'e kalır.
 */
module.exports = (h, P) => {
  const { adv, dis, walk, move, sense, light, res, vuln, c, MODE, acBonus } = h;
  const C = (...a) => P("common", ...a);

  C("Geveze Taş Damlası", "Şişenin dibinde küçük bir çakıl taşı durmadan tıkırdar.",
    "Yumruk büyüklüğündeki bir taşla konuşabilirsin. Taş yalnızca son bir saat içinde çevresinde olanları anlatabilir ve zamanı karıştırır; “az önce” ile “yüz yıl önce” ona aynı gelir.",
    "1h", "Taş susmaz; Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 60,
    { drawback: { changes: [dis.skill("ste")] } });

  C("Kâğıt Gölge Şurubu", "Mürekkep lekeli şurup, yutulunca dilin altında kâğıt gibi hışırdar.",
    "Gölgen kâğıt inceliğine iner. Gölgeni 30 ft içinde bir yüzeyde istediğin yere kaydırabilir, kapı altı gibi dar aralıklardan geçirebilirsin. Gölge hiçbir şeye dokunamaz, yalnızca görünür.",
    "10m", "Gerçek gölgen yoktur; bunu fark eden yaratıklara karşı Karizma (Aldatma) kontrollerinde dezavantaj alırsın.", 70,
    { drawback: { changes: [dis.skill("dec")] } });

  C("Koku Hatırası Özütü", "Şişeden hiçbir koku gelmez, ama kapağı açan herkes çocukluğundan bir koku anımsar.",
    "Hatırladığın bir kokuyu çevrendeki 10 ft içinde yayarsın. Kokuyu yalnızca sen ve seçtiğin yaratıklar algılar.",
    "1h", "Burnun o kokuya kilitlenir; başka koku alamazsın ve kokuyla ilgili Bilgelik (Algı) kontrollerinde otomatik başarısız olursun.", 50);

  C("Sıçrayan Ökçe Şurubu", "Kabarcıkları şişenin içinde sürekli yukarı sıçrar.",
    "Hızın 10 ft artar ve her adımda hafifçe zıplarsın; yürürken zemindeki ince tuzaklara (ip, baskı plakası) basmazsın.",
    "1h", "Sessiz hareket edemezsin; Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 80,
    { effect: { changes: [walk(10)] }, drawback: { changes: [dis.skill("ste")] } });

  C("Çınlayan Kemik Çayı", "Fincanda demlenirken ince bir kemik tıkırtısı duyulur.",
    "Kemiklerin diyapazon gibi titreşir; 60 ft içindeki canlıların kalp atışlarını duyar ve Bilgelik (Algı) kontrollerinde avantaj kazanırsın.",
    "1h", "Gök gürültüsü hasarına karşı savunmasız olursun.", 90,
    { effect: { changes: [adv.skill("prc")] }, drawback: { changes: vuln("thunder") } });

  C("Gevşek Eklem Şurubu", "Yağlı, tarçın kokulu şurup kemiklere sürülmüş gibi kayar.",
    "Tutulma ve bağlanmadan kurtulmak için yaptığın Çeviklik (Akrobasi) ve Kuvvet (Atletizm) kontrollerinde avantaj kazanırsın; bir boyut daha dar aralıklardan sıkışarak geçebilirsin.",
    "1h", "Taşıma kapasiten yarıya iner.", 70,
    { effect: { changes: [adv.skill("acr"), adv.skill("ath")] },
      drawback: { changes: [c("system.attributes.encumbrance.multipliers.overall", MODE.MULTIPLY, 0.5)] } });

  C("Işık Yutan Damla", "Damlanın düştüğü yerde ışık bir an soluklaşır.",
    "10 ft yarıçaplı bir alan seni izler. Alandaki parlak ışık loş ışığa, loş ışık karanlığa dönüşür; ışık kaynakları sönmez, yalnızca soluklaşır.",
    "10m", "Sen de dahil alandaki yaratıklar, karanlıkta görme yoksa Bilgelik (Algı) kontrollerinde dezavantaj alır.", 80);

  C("Çeviri Çorbası", "Her kaşıkta ağzında başka bir dilin tadı belirir.",
    "Konuştuğun her cümle, dinleyen yaratığın ana diline çevrilir. Yazıyı çeviremezsin.",
    "1h", "Kendi ana dilinde konuşamazsın; GM, ince anlamları bozan yanlış çevirileri sahneye katabilir.", 90);

  C("Tavşan Kulağı Damlası", "Damla dile değince uzaktaki bir fısıltı yankılanır.",
    "Sessiz ortamlarda 120 ft'ten fısıltıyı duyabilirsin ve işitmeye dayalı Bilgelik (Algı) kontrollerinde avantaj kazanırsın.",
    "1h", "60 ft içinde yüksek bir ses (çığlık, gong, borazan) olursa 1 dakika boyunca sağır olursun.", 60,
    { effect: { changes: [adv.skill("prc")] } });

  C("Kedi Dili Damlası", "Pembe, hafif pürüzlü bir sıvı; yutunca boğazında mırıltı titreşir.",
    "Kedilerle ve diğer sıradan kedigillerle konuşabilirsin. Bu yaratıklar seni anlar, ama cevap vermek zorunda değildir.",
    "1h", "Köpek ve kurtgillere karşı Karizma kontrollerinde dezavantaj alırsın.", 60);

  C("Havlayan Dil Şurubu", "Şurup kahverengi ve hafif tüy kokulu.",
    "Köpek ve kurtgillerle konuşabilirsin. Sıradan köpekler seni dost sayar ve saldırmaz.",
    "1h", "Kedigillere karşı Karizma kontrollerinde dezavantaj alırsın.", 60);

  C("Karga Sesi Özütü", "Şişeyi sallayınca içinden kuş sesi gelir.",
    "Duyduğun herhangi bir kuş ya da küçük hayvan sesini kusursuz taklit edebilirsin. Sahte olduğunu yalnızca DC 14 Bilgelik (Algı) kontrolünü geçen yaratıklar anlar.",
    "10m", "Sesin kısık ve boğuk çıkar; Karizma (İkna) kontrollerinde dezavantaj alırsın.", 70,
    { drawback: { changes: [dis.skill("per")] } });

  C("Kuru Kalma Damlası", "Cam şişenin dışı asla ıslanmaz; su damlaları yüzeyden kayar.",
    "Üzerindeki ve taşıdığın her şey ıslanmaz; yağmur, sis ve sıçrayan su üstünden akar. Islaklıktan doğan olumsuz etkileri yok sayarsın.",
    "8h", "Dudakların kurur ve çatlar; Karizma (Performans) kontrollerinde dezavantaj alırsın.", 90,
    { drawback: { changes: [dis.skill("prf")] } });

  C("Ters Çan Şurubu", "Mavi şurup içilince kulaklarında ters yönde bir çan çalar.",
    "Zaman ölçmen kusursuz olur: geçen süreyi saniyesine kadar bilirsin ve tur sıranı asla kaçırmazsın. Bir iksir etkisinin kalan süresini sayabilirsin.",
    "8h", "Dakikalar sana uzun gelir; Bilgelik (Sezgi) kontrollerinde dezavantaj alırsın.", 50,
    { drawback: { changes: [dis.skill("ins")] } });

  C("Boncuk Kalp Damlası", "Kırmızı boncuklar şişede kendi kendine ritim tutar.",
    "Kalp atışını kontrol edersin: Dayanıklılık kurtarma atışlarında avantaj kazanırsın.",
    "1h", "Heyecanlandığında yüzün kızarır; Karizma (Aldatma) kontrollerinde dezavantaj alırsın.", 90,
    { effect: { changes: [c("system.abilities.con.save.roll.mode", MODE.ADD, 1)] }, drawback: { changes: [dis.skill("dec")] } });

  C("Sünger Parmak Merhemi", "Merhemin içindeki mikroskobik kancalar şişede parıldar.",
    "Parmak uçların her yüzeye tutunur: tırmanma hızın 30 ft olur ve düz duvarlarda tırmanmak için ek kontrol gerekmez.",
    "10m", "Elinde taşıdığın her nesne parmaklarına yapışır; bir nesneyi bırakmak için Bonus Aksiyon harcarsın.", 100,
    { effect: { changes: [move("climb", 30)] } });

  C("Yarım Gölge Özütü", "Şişenin içinde duman gibi bir gölge yarısı dolaşır.",
    "Vücudunun yarısı gölgeye çekilir: loş ışıkta ya da karanlıkta, Saklanma eylemini Bonus Aksiyon olarak yapabilirsin.",
    "1h", "Parlak ışıkta Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 80);

  C("Dilsiz Nota Şurubu", "Şurubun tadı çalgı teli gibi titreşir.",
    "Dudakların kıpırdamadan 30 ft içindeki bir yaratığa ses çıkarmadan mesaj iletebilirsin. Mesajı yalnızca o yaratık duyar.",
    "1h", "Yüksek sesle konuşamazsın; sözel bileşenli Büyüleri yalnızca fısıltıyla yapabilirsin.", 70);

  C("Aklı Sakız Damlası", "Yapışkan bir sıvı, parmaklar arasında ip gibi uzanır.",
    "Küçük bir nesneyi (en fazla 5 lb) 10 ft uzaktan görünmez yapışkan bir bağla çekebilir ya da tutabilirsin.",
    "10m", "Elinde ne tutuyorsan eline yapışır; bırakmak için DC 12 Kuvvet kontrolü gerekir.", 60);

  C("Dolap Gözü Şurubu", "Şurup öyle koyu ki kapalı şişeye bakmak karanlığa bakmak gibidir.",
    "30 ft içindeki kapalı kutu, sandık ve dolapların içindeki nesne sayısını ve türünü hissedersin; kurşun ya da büyülü korumalar bunu engeller.",
    "10m", "Başının arkasında sürekli bir göz hissi taşırsın; Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 90,
    { drawback: { changes: [dis.skill("prc")] } });

  C("Pamuk Dil Damlası", "Dilini alıştıran, pamuk gibi yumuşak bir damla.",
    "Sözlerin sakinleştirici olur: konuştuğun yaratıklara karşı Karizma (İkna) kontrollerinde avantaj kazanırsın.",
    "1h", "Gizli niyet saklayamazsın; Karizma (Aldatma) kontrollerinde dezavantaj alırsın.", 80,
    { effect: { changes: [adv.skill("per")] }, drawback: { changes: [dis.skill("dec")] } });

  C("Terli Taş Çayı", "Demlenirken fincanın kenarına damlalar toplanır.",
    "Çok sıcak ya da çok soğuk nesnelere çıplak elle dokunabilirsin; ısıdan hasar almazsın.",
    "1h", "Hiç terlemezsin; sıcak havada Dayanıklılık kurtarma atışlarında dezavantaj alırsın.", 90);

  C("Fısıltı Mumu Damlası", "Şişede mum alevi gibi bir şey titreşir.",
    "100 ft içindeki bir noktaya bir fısıltı yerleştirirsin; biri o noktaya yaklaştığında tek cümlelik mesajı duyar. Fısıltı bir kez çalar.",
    "1h", "Fısıltıyı bıraktığın turda sesin kısılır ve o tur boyunca konuşamazsın.", 70);

  C("Tıkırtılı Çorap Tozu", "Şişede küçük tıkırtılar duyulur.",
    "Gittiğin her yolu geri dönerken birebir hatırlarsın; yürüdüğün bir yolda asla kaybolmazsın.",
    "8h", "Tanımadığın yerlerde ayakkabıların seni yanlış yöne çekebilir; yön bulmaya dayalı Bilgelik (Hayatta Kalma) kontrollerinde dezavantaj alırsın.", 60,
    { drawback: { changes: [dis.skill("sur")] } });

  C("Bulut Ensesi Damlası", "Beyaz bir sıvı, şişede küçük bir bulut gibi yükselir.",
    "Başının üstünde 2 ft'lik küçük bir bulut belirir; yağmur ve güneşten seni korur, yukarıdan düşen küçük nesneleri yumuşatır.",
    "8h", "Bulut bazen yağmur yağdırır (her saat başı 1d6'da 1: yağmur seni ve yanındakileri ıslatır).", 60);

  C("Koyun Bakışı Damlası", "Pembe şurup, yutulunca midede sıcak bir yün hissi bırakır.",
    "Öfkeli ya da gergin yaratıkları yatıştırmak için yaptığın Karizma (İkna) kontrollerinde avantaj kazanırsın; sıradan hayvanlar saldırmadan önce tereddüt eder.",
    "1h", "Korkutma (Karizma) kontrollerinde dezavantaj alırsın.", 70,
    { effect: { changes: [adv.skill("per")] }, drawback: { changes: [dis.skill("itm")] } });

  C("Dizgin Kanı Özütü", "Şişenin kapağı at ağzı gibi hafifçe ısırır.",
    "Binek ve koşum hayvanlarını yönetirken yaptığın Bilgelik (Hayvan Terbiyesi) kontrollerinde avantaj kazanırsın; bineğin Hızı 10 ft artar.",
    "1h", "Yaya hareket ederken Hızın 10 ft azalır.", 80,
    { effect: { changes: [adv.skill("ani")] }, drawback: { changes: [walk(-10)] } });

  C("Kış Bahçesi Şurubu", "Tadı karla örtülü bir bahçe gibi tuzludur.",
    "Basılan zeminden filizler çıkar: doğal Zor Arazi'yi (bitki, çamur, buz) yok sayarsın ve bastığın yerde çiçekler kalır.",
    "1h", "Çiçekler izini belli eder; seni takip eden yaratıklar Bilgelik (Hayatta Kalma) kontrollerinde avantaj kazanır.", 90);

  C("Ağır Göz Kapağı Özütü", "Şişeyi tutan elin göz kapakları ağırlaşır.",
    "Yorgunluğa karşı yaptığın Dayanıklılık kurtarma atışlarında avantaj kazanırsın; 1. Bitkinlik Seviyesinin cezasını yok sayarsın.",
    "8h", "Etki bittiğinde 1 saat boyunca Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 100);

  C("Tek Kulak Çanı Şurubu", "Cam şişenin ağzında minik bir çan asılıdır.",
    "Bir kulağın çan gibi çınlar: 120 ft içinde görmesen bile yaklaşan görünmez ya da gizli bir yaratığın yönünü hissedersin.",
    "1h", "Çınlama dikkatini dağıtır; Konsantrasyon kurtarma atışlarında dezavantaj alırsın.", 90,
    { drawback: { changes: [c("system.attributes.concentration.roll.mode", MODE.ADD, -1)] } });

  C("Sallantılı Yürüyüş Damlası", "Sıvı şişede dalgalanıp durur, yutarken mide bulantısı verir.",
    "Zemin sallanıyormuş gibi hissedersin; bunun karşılığında gemi, sal ve sallanan zeminlerde dengen bozulmaz ve bu tür yerlerde yaptığın Çeviklik kontrollerinde avantaj kazanırsın.",
    "1h", "Karada normal yürürken zorlanırsın; Çeviklik (Akrobasi) kontrollerinde dezavantaj alırsın.", 60,
    { drawback: { changes: [dis.skill("acr")] } });

  C("Ters Akşam Damlası", "Koyu mor bir sıvı, dilde ekşi bir tat bırakır.",
    "Gün ışığına duyarlı etkilere (parlama, güneş yanığı) bağışık olursun ve 60 ft karanlıkta görürsün.",
    "8h", "Gün ışığında Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 50,
    { effect: { changes: [sense("darkvision", 60)] }, drawback: { changes: [dis.skill("prc")] } });

  C("Kürk Düğmesi Damlası", "İçinde ince kürk telleri havada asılı durur.",
    "Cildin yoğun kürkle kaplanır: soğuk hasarına karşı direnç kazanırsın ve çevresel soğuktan etkilenmezsin.",
    "1h", "Sıcak havada Dayanıklılık kurtarma atışlarında dezavantaj alırsın.", 90,
    { effect: { changes: res("cold") } });

  C("Kapı Gıcırtısı Damlası", "Şişeyi çevirmek paslı menteşe sesi çıkarır.",
    "Kapı, kilit ve menteşelerin sesini bastırırsın; kilit açarken (Hırsız Aletleri) yaptığın kontrollerde avantaj kazanırsın.",
    "10m", "Kendi eklemlerin gıcırdar; Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 100,
    { drawback: { changes: [dis.skill("ste")] } });

  C("Gökkuşağı Tükürüğü İksiri", "İçinde ince bir gökkuşağı çizgisi yüzer.",
    "Tükürüğün 5 ft uzunluğunda renkli bir ışık yayı bırakır; birkaç saniye parlar. İz bırakmak ve işaret koymak için kullanılır.",
    "1h", "Renk her seferinde rastgele çıkar (GM seçer).", 50);

  C("Ay Işığı Çorbası", "Gümüş renginde, ay gibi parlayan bir çorba.",
    "Ay ışığı altındayken Hızın 10 ft artar ve 30 ft karanlıkta görürsün.",
    "8h", "Gün ışığında Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 90,
    { effect: { changes: [sense("darkvision", 30)] }, drawback: { changes: [dis.skill("prc")] } });

  C("Dev Yumruk Çayı", "Demlenen yapraklar küçük bir eli andıran biçimde açılır.",
    "Elin iki katı büyür: silahsız vuruşların 1d8 hasar verir ve kavrama kontrollerinde (Atletizm) avantaj kazanırsın.",
    "1h", "İnce el işçiliği gerektiren kontrollerde (El Çabukluğu) dezavantaj alırsın.", 100,
    { effect: { changes: [adv.skill("ath")] }, drawback: { changes: [dis.skill("slt")] } });

  C("Taşıyıcı Yel Damlası", "Havada dönen küçük bir girdap gibi görünür.",
    "10 lb'ye kadar bir nesne yanında havada süzülür ve seni takip eder; sana yardımcı bir el gibidir ama kendi başına bir şey kullanamaz.",
    "1h", "Nesne bazen rüzgârda yönünü şaşırır: DC 10 Zekâ kontrolü başarısızsa onu yanlış yere bırakır.", 80);

  C("Ses Hapsi Damlası", "Cam şişenin içinden dışarıya hiçbir ses çıkmaz.",
    "Ağzı kapalı bir kabın içine 1 dakikalık bir sesi kaydedersin; kabı açana kadar ses saklı kalır ve açılınca bir kez çalar.",
    "inst", "Kendi sesin 1 saat boyunca yarı sessiz çıkar; Karizma (Performans) kontrollerinde dezavantaj alırsın.", 70);

  C("Mürekkep Tüküren Damla", "Kalem ucuna benzer bir tat; ağızda mürekkep izi kalır.",
    "Ağzından yazı tükürebilirsin: kâğıda ya da duvara en fazla 50 kelimelik metin yazar, el yazını taklit edebilirsin.",
    "10m", "Dilin ve dudakların mürekkep lekeli kalır; Karizma (İkna) kontrollerinde dezavantaj alırsın.", 60,
    { drawback: { changes: [dis.skill("per")] } });

  C("Seramik Deri Şurubu", "Şurup şişede gri çatlaklar oluşturur.",
    "Cildin pürüzsüz seramik gibi sertleşir: AC'ne +1 kazanırsın.",
    "10m", "Hareketlerin kısıtlanır; Çeviklik (Akrobasi) kontrollerinde dezavantaj alırsın.", 100,
    { effect: { changes: [acBonus(1)] }, drawback: { changes: [dis.skill("acr")] } });

  C("Sıcak Ayak İksiri", "Ayak tabanında sıcak bir karıncalanma bırakır.",
    "Buz ve kar üzerinde kaymazsın; ayağının altındaki 1 ft'lik buz erir.",
    "8h", "Yanıcı zeminlerde (kuru ot, halı) basılan yer ısınır; dikkatli olmazsan yangın çıkabilir.", 70);

  C("Kıskaç Gülümsemesi Damlası", "Damla dile değince dişler hafifçe kenetlenir.",
    "Isırık gücün artar: dişlerinle 50 lb'ye kadar bir nesneyi kaldırabilir, çeneyle tutma gerektiren Atletizm kontrollerinde avantaj kazanırsın.",
    "10m", "Çenen kilitlenir; konuşmak için DC 10 Kuvvet kontrolü gerekir.", 90,
    { effect: { changes: [adv.skill("ath")] } });

  C("Kuyruk Sallayan Damla", "Şurubun tadı kuru köpek mamasını andırır.",
    "Sana yaklaşan sıradan hayvanlar saldırmaz ve seni sever; vahşi hayvanlar korkmaz.",
    "1h", "Her duygunu belli edersin; Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 60,
    { drawback: { changes: [dis.skill("ste")] } });

  C("Dalga Sesi Damlası", "Kulağa tuz ve dalga sesi gelir.",
    "Sakin suyun üzerinde yürüyebilirsin (dalgalı suda DC 12 Çeviklik kontrolü gerekir).",
    "1h", "Karada Hızın 10 ft azalır.", 100,
    { drawback: { changes: [walk(-10)] } });

  C("Çatlak Ses Özütü", "Çatlamış çan gibi tınlayan bir sıvıdır.",
    "Çığlık atarsın: 30 ft içindeki her yaratık DC 12 Bilgelik kurtarma atışı yapar; başarısız olan bir sonraki sırasının sonuna kadar Korkmuş olur. Etki süresince bir kez kullanılır.",
    "10m", "Sesin 1 saat boyunca kısık kalır.", 100);

  C("Kuytu Köşe Damlası", "Koyu gri bir damla, ağızda köşe bucak tozu bırakır.",
    "Sırtını bir duvara ya da büyük bir nesneye dayayarak saklanırken Çeviklik (Gizlilik) kontrollerinde avantaj kazanırsın.",
    "1h", "Duvardan 10 ft uzaktaysan Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 80);

  C("Bulanık Gözlük Şurubu", "Şurup bir mercek gibi bulanık görünür.",
    "10 ft'ten yakın nesneler olağanüstü net görünür; okuma ve ince inceleme gibi yakın işlerde Zekâ (Soruşturma) kontrollerinde avantaj kazanırsın.",
    "1h", "30 ft ötesindeki her şey bulanıktır; bu menzilde Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 70,
    { effect: { changes: [adv.skill("inv")] } });

  C("Mırıltı Damlası", "Şişe titreştiğinde içinden bir mırıltı duyulur.",
    "Mırıldandığın sürece 30 ft içindeki dostların korku etkilerine karşı yaptığı kurtarma atışlarında avantaj kazanır.",
    "10m", "Mırıldanmak zorundasın; durursan etki biter. Çeviklik (Gizlilik) kontrollerinde dezavantaj alırsın.", 90,
    { drawback: { changes: [dis.skill("ste")] } });

  C("Çıtırdayan Meşe Damlası", "Odun kokulu bir damla; şişede çıtırtılar duyulur.",
    "30 ft içindeki küçük bir ateş (meşale, mum, ocak) seni dinler; söndür, yak ya da büyüklüğünü değiştir.",
    "10m", "Ateşin yanındayken kendi kendine kıpırdar; sakin bir ateşin yanında bile ürkek davranır.", 100);

  C("Yarım Yalan Damlası", "Ekşi, biraz şekerli bir şurup.",
    "Söylediklerinin yarısı doğruysa Karizma (Aldatma) kontrollerinde avantaj kazanırsın.",
    "1h", "Tam doğruyu söylemek için DC 12 Karizma kontrolü gerekir.", 100,
    { effect: { changes: [adv.skill("dec")] } });

  C("Rüzgâr Bükücü Damlası", "Havada dönen küçük bir hortum gibi kokar.",
    "Ağzından üflediğin hava güçlüdür: 15 ft konide küçük nesneleri (5 lb altı) uçurur, mumları söndürür, ince kapıları açarsın.",
    "10m", "Her üflemeden sonra bir tur nefes alamazsın, o tur konuşamazsın.", 80);

  C("Kızgın Kömür Çayı", "Çay bardağında kor gibi parlar.",
    "Elinle yakıcı nesnelere dokunabilirsin; ellerin sıcak kalır ve 1 ft'lik buzu eritebilir, küçük ateşleri yakabilirsin.",
    "1h", "Dokunduğun yanıcı nesneler tutuşabilir (her dokunuşta 1d6'da 1).", 70);

  C("Gözyaşı Şeker Damlası", "Tuzlu ve tatlı karışık bir damla.",
    "Gözyaşların şifa verir: bir turda ağlarsan 1d4 Can Puanı iyileştirirsin (süre boyunca 3 kez).",
    "1h", "Ağlarken kontrolünü yitirirsin; o turda başka eylem yapamazsın.", 90);

  C("Taşlaşmış Gülüş Damlası", "Şurubun tadı kaya tuzu gibi.",
    "Yüzün taş gibi sertleşir ve duygu belli etmezsin: Karizma (Aldatma) kontrollerinde avantaj kazanırsın.",
    "1h", "Yüz ifaden değişmez; Karizma (İkna) kontrollerinde dezavantaj alırsın.", 80,
    { effect: { changes: [adv.skill("dec")] }, drawback: { changes: [dis.skill("per")] } });

  C("Örümcek Ağı Şekeri", "Yapışkan bir şeker, dilin üstünde ince iplikler bırakır.",
    "Elinden ince ipek iplik fırlatırsın: 30 ft'e kadar uzanır, 50 lb taşır ve bir nesneye ya da yaratığa bağlanabilir.",
    "10m", "İpek parmaklarına yapışır; El Çabukluğu kontrollerinde dezavantaj alırsın.", 90,
    { drawback: { changes: [dis.skill("slt")] } });

  C("Boş Cep Özütü", "Hiçbir tadı olmayan berrak bir sıvıdır.",
    "Ceplerine koyduğun nesneler ağırlık yapmaz: 20 lb'ye kadar nesne taşıma kapasiteni etkilemez.",
    "8h", "Cebindeki nesneleri hatırlamak zorlaşır; belirli bir nesneyi bulmak için ek bir eylem gerekir.", 50);

  C("Sağır Çan Damlası", "Şurup sessizlik tadındadır.",
    "Gök gürültüsü hasarına karşı direnç kazanırsın.",
    "10m", "Etki süresince sağırsın; işitmeye dayalı Bilgelik (Algı) kontrollerinde otomatik başarısız olursun.", 70,
    { effect: { changes: res("thunder") }, drawback: { statuses: ["deafened"] } });

  C("Kaplumbağa Kabuğu Çayı", "Demlenirken çay kabuk parçalarıyla kaplanır.",
    "Bonus Aksiyon ile kabuğuna çekilebilirsin: AC'ne +4 kazanırsın ama hareket edemez ve eylem yapamazsın.",
    "1h", "Kabuktan çıkmak Bonus Aksiyon alır; kabuktayken dışarıyı göremezsin.", 100);

  C("Yılan Dili Damlası", "Dilini hafifçe çatallaştıran ekşi bir damla.",
    "Yılanlar ve sürüngenlerle konuşabilirsin; dilinle kokuyu alır, iz sürmek için yaptığın Bilgelik (Hayatta Kalma) kontrollerinde avantaj kazanırsın.",
    "1h", "Dilini çıkarmadan konuşamazsın; fısıltıyla konuşursun.", 70,
    { effect: { changes: [adv.skill("sur")] } });

  C("Yalancı Gün Doğumu Damlası", "Şurup sabah ışığı gibi sarı bir parıltı verir.",
    "Bedenin gün doğumu gibi ısı ve ışık yayar: 20 ft parlak ışık, 40 ft loş ışık.",
    "1h", "Gözlerin ışığa duyarlı olur; Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 100,
    { effect: { changes: light(20, 40) }, drawback: { changes: [dis.skill("prc")] } });

  C("Bozuk Pusula Kanı", "Siyah bir sıvı, şişede yönünü şaşırır.",
    "30 ft içindeki dostlarının yönünü her zaman hissedersin, aralarında bir duvar ya da dağ olsa bile.",
    "8h", "Kendi yönünü bulamazsın; yön bulmaya dayalı Bilgelik (Hayatta Kalma) kontrollerinde otomatik başarısız olursun.", 60);

  C("Kemik Tozu Çayı", "Beyaz toz, şişede kemik gibi tıkırdar.",
    "Ölümsüzler seni ölü sanır: bir ölümsüz sana ilk saldırmadan önce DC 12 Bilgelik kurtarma atışı yapar; başarısız olursa saldırmaz.",
    "1h", "Canlı hayvanlar senden korkar ve kaçar.", 80);

  C("Sabun Köpüğü Şurubu", "Köpüklü, güzel kokulu bir şurup.",
    "Etrafında 10 ft yarıçaplı kaygan bir köpük alanı oluşur; alandaki dostların tutulmadan kurtulma kontrollerinde avantaj kazanır.",
    "10m", "Köpük sana da kayganlık verir; Çeviklik (Akrobasi) kontrollerinde dezavantaj alırsın.", 50,
    { drawback: { changes: [dis.skill("acr")] } });

  C("Kuşbakışı Damlası", "Açık mavi bir damla, ağızda ferahlık bırakır.",
    "Başının üstünde bir noktadan bakıyormuş gibi 30 ft içindeki alanın ayrıntılı bir krokisini görürsün; Zekâ (Soruşturma) kontrollerinde avantaj kazanırsın.",
    "10m", "Bedenine odaklanamazsın; Dayanıklılık kurtarma atışlarında dezavantaj alırsın.", 100,
    { effect: { changes: [adv.skill("inv")] } });

  C("Dehşet Gülüşü Damlası", "Dişleri hafifçe titreten bir damla.",
    "Sırıtışın korkunç görünür: Korkutma (Karizma) kontrollerinde avantaj kazanırsın.",
    "1h", "Kimse seni samimi bulmaz; Karizma (İkna) kontrollerinde dezavantaj alırsın.", 80,
    { effect: { changes: [adv.skill("itm")] }, drawback: { changes: [dis.skill("per")] } });

  C("Süt Sisi Özütü", "Süt gibi beyaz bir sıvı.",
    "Soluğunla çevrende ince bir sis bırakırsın: 10 ft yarıçapta hafif bir sis alanı oluşur ve içindeki görüş loş ışık sayılır.",
    "10m", "Sis seni de etkiler; alanda Bilgelik (Algı) kontrollerinde dezavantaj alırsın.", 90,
    { drawback: { changes: [dis.skill("prc")] } });

  C("Gıdıklı Yel Damlası", "Havada gizlenmiş bir kahkaha gibi kokar.",
    "Dokunduğun yaratık DC 10 Dayanıklılık kurtarma atışında başarısız olursa kendi sırasının sonuna kadar saldırı atışlarında dezavantaj alır (süre boyunca 3 kez).",
    "10m", "Sen de gıdıklanmaya duyarlısın; sana dokunan yaratıklar seni gıdıklayabilir.", 100);

  C("Düğüm Kalbi Şurubu", "İçinde ince bir iplik düğüm halinde asılıdır.",
    "Her düğümü kolayca çözebilirsin; ip, bağ ve tutsaklık düğümlerinden kurtulmak için yaptığın kontrollerde avantaj kazanırsın.",
    "1h", "Çözdüğün düğümü yeniden bağlayamazsın.", 80,
    { effect: { changes: [adv.skill("acr")] } });

  C("Sessiz Pençe İksiri", "Şurup yumuşak, kedi tüyü kokulu.",
    "Ayakların yumuşak ve sessiz olur: hareket ederken ses çıkarmazsın ve Çeviklik (Gizlilik) kontrollerinde avantaj kazanırsın.",
    "1h", "Parmakların inceleşir; Kuvvet (Atletizm) kontrollerinde dezavantaj alırsın.", 100,
    { effect: { changes: [adv.skill("ste")] }, drawback: { changes: [dis.skill("ath")] } });
};
