const quizQuestionTranslations = {
  'agile-principles-001': {
    prompt: 'Bir ekibin uzun bir devir teslim dokumani yerine dogrudan konusmayi secmesini en iyi destekleyen Agile Manifesto degeri hangisidir?',
    scenarioContext: '',
    explanation:
      'Bu deger, surecler ve araclar uzerinden bireyler ve etkilesimlerdir. Dokumantasyon yardimci olabilir, ancak Agile insanlar arasindaki etkili is birligine daha fazla agirlik verir.',
    whyItMatters:
      'Teslim rolleri, devir teslim surtunmesini azaltarak ve daha net ortak anlayis yaratarak akisi genellikle en hizli sekilde iyilestirir.',
    choices: {
      a: 'Kapsamli dokumantasyon yerine calisan yazilim',
      b: 'Surecler ve araclar yerine bireyler ve etkilesimler',
      c: 'Sozlesme pazarligi yerine musteri is birligi',
      d: 'Bir plana uymak yerine degisime yanit vermek',
    },
    reference: {
      title: 'Manifesto for Agile Software Development',
      section: 'Values',
    },
  },
  'agile-principles-002': {
    prompt: 'Bir sponsor, Agile teslim gozden gecirmesinde ilerlemenin asil olarak nasil gosterilmesi gerektigini soruyor. En guclu cevap nedir?',
    scenarioContext: '',
    explanation:
      'Bir Agile ilkesi, calisan yazilimin ilerlemenin birincil olcusu oldugunu soyler. Daha genis teslim baglamlarinda ayni fikir, sadece aktivite degil kullanilabilir deger gostermek anlamina gelir.',
    whyItMatters:
      'Ilerleme kaniti, gorusmeleri sonuclara dayandirir ve yalnizca aktivite takibinden gelen sahte guveni azaltir.',
    choices: {
      a: 'Tamamlanmis bir durum raporu',
      b: 'Ayrintili bir kilometre tasi Gantt semasi',
      c: 'Calisan urun veya hizmet kaniti',
      d: 'Yapilan toplantilarin listesi',
    },
    reference: {
      title: 'Principles behind the Agile Manifesto',
      section: 'Working software as progress',
    },
  },
  'agile-principles-003': {
    prompt: 'Teslimatin ortasinda, musteri kaniti planlanan bir ozelligin yeni bir talepten daha az degerli oldugunu gosteriyor. En iyi Agile yanit nedir?',
    scenarioContext: 'Degisiklik gec geliyor, ancak gercek musteri ogrenmesine dayaniyor ve daha dusuk degerli kapsamla takas edilebilir.',
    explanation:
      'Agile, musteri avantaji artiyorsa degisen gereksinimleri memnuniyetle karsilar; ancak bu sinirsiz is eklemek anlamina gelmez. En iyi yanit, degere dayali takastir.',
    whyItMatters:
      'Ceviklik kargasa degildir. Yeni bilgi en iyi ekonomik secimi degistirdiginde disiplinli uyum saglamaktir.',
    choices: {
      a: 'Plan onaylandigi icin degisikligi reddetmek',
      b: 'Her yeni fikri kabul edip mevcut kapsamin tamamini korumak',
      c: 'Ogrenmeyi kullanarak kapsami yeniden muzareke etmek ve degeri maksimize etmek',
      d: 'Tum paydaslar nihai sabit kapsamda anlasana kadar teslimati durdurmak',
    },
    reference: {
      title: 'Principles behind the Agile Manifesto',
      section: 'Welcome changing requirements',
    },
  },
  'agile-principles-004': {
    prompt: 'Bir teslim yoneticisi, kullanici sonucunu dogrulamadan once uc aylik ayrintili plan yapan bir ekip goruyor. En guclu kocluk noktasi hangisidir?',
    scenarioContext: 'Ekipte, erken geri bildirimin cozumu degistirebilecegi kadar belirsizlik var.',
    explanation:
      'Agile ilkeleri daha kisa zaman olceklerinde sik teslimati tercih eder. Daha kucuk dilimler daha erken geri bildirim yaratir ve yanilmanin maliyetini azaltir.',
    whyItMatters:
      'Program planlari, belirsizligi ayrintili takvimlerin arkasina saklamak yerine varsayimlari erken ortaya cikardiginda daha sagliklidir.',
    choices: {
      a: 'Ilk surumden once her bagimliligi planlamak',
      b: 'Daha erken ogrenmek icin daha kucuk dilimleri sik teslim etmek',
      c: 'Planlamayi atlayip bilinen tum ise ayni anda baslamak',
      d: 'Paydaslar hazir olana kadar yalnizca teknik gorevler kullanmak',
    },
    reference: {
      title: 'Principles behind the Agile Manifesto',
      section: 'Deliver working software frequently',
    },
  },
  'agile-principles-005': {
    prompt: 'Bir ekip, ozellik talebi yuksek oldugu icin yapi kalitesini iyilestirmeye cok mesgul oldugunu soyluyor. Hangi Agile ilkesi konusmaya rehberlik etmelidir?',
    scenarioContext: '',
    explanation:
      'Teknik mukemmellige ve iyi tasarima surekli dikkat cevikligi artirir. Kalite kisayollari genellikle gelecekteki uyum kabiliyetini azaltir.',
    whyItMatters:
      'Teknik program ve teslim liderleri kaliteyi korumak zorundadir, cunku gizli kalite borcu teslim riskine donusur.',
    choices: {
      a: 'Teknik mukemmellik ve iyi tasarim cevikligi artirir',
      b: 'Yuz yuze iletisim muhendislik disiplininin yerini alir',
      c: 'Gec degisiklikler her zaman reddedilmelidir',
      d: 'Dokumantasyon surecten kaldirilmalidir',
    },
    reference: {
      title: 'Principles behind the Agile Manifesto',
      section: 'Technical excellence',
    },
  },
  'agile-principles-006': {
    prompt: 'Bir portfoy kurulu, her ekibin sabit yillik kapsama taahhut vermesini istiyor, ancak ekipler belirsiz problem alanlarinda calisiyor. Agile ile en uyumlu yeniden cerceveleme nedir?',
    scenarioContext: 'Yoneticiler hala yonetisim istiyor, ancak sabit kapsam taahhutleri tekrar tekrar yanlis cikiyor.',
    explanation:
      'Agile, degisime yanit vermeye ve degeri sik teslim etmeye deger verir. Yonetisim yine var olabilir, ancak belirsiz kapsamin sabit oldugunu varsaymak yerine sonuclari ve takaslari yonlendirmelidir.',
    whyItMatters:
      'Agile program yonetimi, hesap verebilirligi terk etmeden belirsizligi gorunur kilmalidir.',
    choices: {
      a: 'Ekiplerden ayni kapsama daha guclu taahhut istemek',
      b: 'Yonetisimi ekip otonomisi ve raporsuzlukla degistirmek',
      c: 'Sonuclar, kisa geri bildirim donguleri ve acik takaslarla yonetmek',
      d: 'Projeleri yalnizca tum gereksinimler stabil olduktan sonra fonlamak',
    },
    reference: {
      title: 'Manifesto for Agile Software Development',
      section: 'Responding to change over following a plan',
    },
  },
  'scrum-001': {
    prompt: 'Scrum Guide 2020 icinde bir Scrum Team icin hangi hesap verebilirlikler tanimlanir?',
    scenarioContext: '',
    explanation:
      'Scrum, Scrum Team icinde uc belirli hesap verebilirlik tanimlar: Product Owner, Scrum Master ve Developers.',
    whyItMatters:
      'Guncel Scrum terminolojisini kullanmak, komuta-kontrol rollerini farkinda olmadan framework icine tasimayi onler.',
    choices: {
      a: 'Product Owner, Scrum Master ve Developers',
      b: 'Project Manager, Business Analyst ve Test Lead',
      c: 'Product Manager, Delivery Manager ve Engineers',
      d: 'Sponsor, Scrum Master ve Technical Lead',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Scrum Team',
    },
  },
  'scrum-002': {
    prompt: 'Scrum icinde Product Backlog ogelerini siralamaktan kim hesap verebilirdir?',
    scenarioContext: '',
    explanation:
      'Product Owner, Product Backlog ogelerini siralamak dahil etkili Product Backlog yonetiminden hesap verebilirdir.',
    whyItMatters:
      'Net hesap verebilirlik, oncelik kararlarinin birden fazla gayriresmi sahip arasinda gizli pazarliga donusmesini onler.',
    choices: {
      a: 'Developers',
      b: 'Scrum Master',
      c: 'Product Owner',
      d: 'Paydas komitesi',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Product Owner',
    },
  },
  'scrum-003': {
    prompt: 'Bir Sprint sirasinda yeni bilgi, secilen isin beklenenden daha karmasik oldugunu gosteriyor. Scrum bozulmadan ne olabilir?',
    scenarioContext: '',
    explanation:
      'Scrum Guide, Sprint Goal tehlikeye atilmadigi surece daha fazla ogrenildikce kapsamin Product Owner ile netlestirilip yeniden muzareke edilebilecegini soyler.',
    whyItMatters:
      'Bu ayrim odagi korurken Sprint icinde deneysel uyumu mumkun kilar.',
    choices: {
      a: 'Sprint Goal bir daha asla tartisilamaz',
      b: 'Daha fazla ogrenildikce kapsam Product Owner ile netlestirilip yeniden muzareke edilebilir',
      c: 'Scrum Master, her orijinal ogeyi korumak icin fazla mesai atar',
      d: 'Sprint Review surum onay kapisina donusur',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'The Sprint',
    },
  },
  'scrum-004': {
    prompt: 'Bir Scrum Team, Sprint Review etkinligini paydaslarin sessizce onayladigi veya reddettigi bir slayt sunumu gibi ele aliyor. En iyi duzeltme nedir?',
    scenarioContext: 'Paydaslarin gercek ilerlemeyi incelemesi ve sonraki adimlari etkilemesi gerekiyor.',
    explanation:
      'Sprint Review, Scrum Team ve paydaslarin sonucu inceledigi ve sonra ne yapilacagi konusunda is birligi yaptigi bir calisma oturumudur. Sadece sunuma indirgenmemelidir.',
    whyItMatters:
      'Iyi review etkinlikleri urun yonunu iyilestirir ve gec paydas surprizlerini azaltir.',
    choices: {
      a: 'Yonetisimi korumak icin bunu bir onay kapisi olarak tutmak',
      b: 'Sonuclari incelemek ve Product Backlogu uyarlamak icin calisma oturumuna cevirmek',
      c: 'Increment surume hazir degilse Sprint Review etkinligini iptal etmek',
      d: 'Tum paydas geri bildirimini Sprint Retrospective etkinligine tasimak',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Sprint Review',
    },
  },
  'scrum-005': {
    prompt: 'Daily Scrum bir yonetici icin durum toplantisina donustu. Hangi degisiklik Scrum Guide ile en iyi uyumludur?',
    scenarioContext: '',
    explanation:
      'Daily Scrum, Developers icin Sprint Goal yolundaki ilerlemeyi incelemek ve gerekirse Sprint Backlogu uyarlamak amaciyladir.',
    whyItMatters:
      'Faydali bir Daily Scrum, raporlama kuyrugu yaratmak yerine oz yonetimi guclendirir.',
    choices: {
      a: 'Developers, Sprint Goal yolundaki ilerlemeyi inceler ve ertesi gun icin plani uyarlar',
      b: 'Product Owner her Developerdan tahmin toplar',
      c: 'Scrum Master gorevleri oncelik sirasina gore atar',
      d: 'Paydaslar Sprint Backlog degisikliklerini onaylar',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Daily Scrum',
    },
  },
  'scrum-006': {
    prompt: 'Iki Scrum Team tek bir urun uzerinde calisiyor ve Done anlaminda anlasamiyor. Scrum ile en uyumlu yanit nedir?',
    scenarioContext: 'Iki ekip de ayni urune teslimat yapiyor ve paydaslar yayinlanabilir kalite konusunda seffafliga ihtiyac duyuyor.',
    explanation:
      'Birden fazla Scrum Team bir urun uzerinde birlikte calistiginda ayni Definition of Done tanimini ortak sekilde belirlemeli ve ona uymalidir.',
    whyItMatters:
      'Paylasilan Definition of Done, birden fazla ekip tek urun incrementina katkida bulundugunda seffafligi korur.',
    choices: {
      a: 'Her ekibin ozel bir Definition of Done tutmasina izin vermek',
      b: 'Scrum Masterlardan her Sprint sonrasi istisnalari onaylamalarini istemek',
      c: 'Ayni Definition of Done tanimini ortak belirlemek ve ona uymak',
      d: 'Kalite iyilesene kadar Definition of Done tanimini kaldirmak',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Definition of Done',
    },
  },
  'kanban-flow-001': {
    prompt: 'Kanban Guide May 2025 belgesine gore Kanban neyi optimize etmek icin bir stratejidir?',
    scenarioContext: '',
    explanation:
      'Kanban Guide, Kanbani bir surec boyunca deger akisinin optimize edilmesi icin bir strateji olarak tanimlar.',
    whyItMatters:
      'Akis dili, iyilestirme calismasini yerel aktivite metrikleri yerine degerin hareketine odaklar.',
    choices: {
      a: 'Bir teslim surecindeki seremonilerin sayisi',
      b: 'Bir surec boyunca deger akisi',
      c: 'Bireysel kullanim hedeflerinin dogrulugu',
      d: 'Bastan gereksinimlerin eksiksizligi',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Definition of Kanban',
    },
  },
  'kanban-flow-002': {
    prompt: 'Kanban Guide May 2025 icindeki uc Kanban pratigine en iyi uyan set hangisidir?',
    scenarioContext: '',
    explanation:
      'Uc Kanban pratigi; is akisinin tanimlanip gorsellestirilmesi, is akisindaki ogelerin aktif yonetilmesi ve is akisinin iyilestirilmesidir.',
    whyItMatters:
      'Kanban bir panodan fazlasidir. Pratikler gorsellestirme, aktif yonetim ve iyilestirmeyi birbirine baglar.',
    choices: {
      a: 'Planla, tahmin et ve ata',
      b: 'Is akisini tanimla ve gorsellestir, ogeleri aktif yonet, is akisini iyilestir',
      c: 'Sprint, review ve retrospect',
      d: 'Onceliklendir, onayla ve raporla',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Kanban Practices',
    },
  },
  'kanban-flow-003': {
    prompt: 'Bir ekip tum acil taleplere hemen basliyor ve artik her sey bekliyor. En guclu Kanban kocluk yaniti nedir?',
    scenarioContext: 'Ekipte gorunur kuyruklar, bloke ogeler ve sik baglam degisimi var.',
    explanation:
      'Kanban sistem uyeleri is devam durumunu acik sekilde kontrol etmelidir. WIP kontrolu cekme sistemi, odak ve daha iyi akisi destekler.',
    whyItMatters:
      'Teslim liderleri tahmin edilebilirligi genellikle sisteme daha fazla is iterek degil, baslamis isi sinirlayarak iyilestirir.',
    choices: {
      a: 'Bireysel kullanim hedeflerini artirmak',
      b: 'WIP kontrolunu acikca yapmak ve yeni ise yalnizca kapasite varsa baslamak',
      c: 'Bloke isi bitmeye hazir olana kadar gizlemek',
      d: 'Gunluk durum toplantisi eklemek ama tum isi devam halinde tutmak',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Actively Managing Items in a Workflow',
    },
  },
  'kanban-flow-004': {
    prompt: 'Kanban Guide May 2025 icindeki minimum Definition of Workflow parcalarindan hangileri vardir?',
    scenarioContext: '',
    explanation:
      'Rehber, is ogeleri, baslangic/bitis noktalari, is akisi durumlari, WIP kontrolu, acik politikalar ve hizmet seviyesi beklentisi dahil minimum Definition of Workflow ogelerini listeler.',
    whyItMatters:
      'Definition of Workflow, akis politikalarini kabile bilgisine birakmak yerine incelenebilir hale getirir.',
    choices: {
      a: 'Is ogesi tanimi, is akisi durumlari, WIP kontrolu, acik politikalar ve SLE',
      b: 'Sprint Goal, Product Goal, Increment ve Definition of Done',
      c: 'Butce sahibi, steering committee, RAID log ve change board',
      d: 'Yalnizca takim sozlesmesi, roadmap, OKRlar ve surum takvimi',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Defining and Visualizing the Workflow',
    },
  },
  'kanban-flow-005': {
    prompt: 'Bir paydas teslim tahmini istiyor. Ekipte tarihsel cycle-time verisi var. Kanban bilgili en guclu yanit nedir?',
    scenarioContext: '',
    explanation:
      'Kanban, belirsizlik icinde tahmin edilebilirlik hakkinda dusunmek icin akis metrikleri ve hizmet seviyesi beklentilerini kullanir. Tahminler kanita dayanmalidir, garanti degildir.',
    whyItMatters:
      'Sorumlu teslim tahmini, belirsizlik konusunda seffaf kalirken paydaslarin karar almasina yardim eder.',
    choices: {
      a: 'Aciliyet yaratmak icin mumkun olan en erken tarihi soz vermek',
      b: 'Tarihsel akis verisini kullanmak ve tahmini belirsizlikle iletmek',
      c: 'Yalnizca gecen sprintte tamamlanan story pointleri raporlamak',
      d: 'Agile ekipler asla tahmin yapmaz diye tahminlerden kacinmak',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Flow Metrics',
    },
  },
  'kanban-flow-006': {
    prompt: 'Bir program kurulu tahmin edilebilirligi iyilestirmek istiyor ama yalnizca herkesin tamamen dolu olup olmadigini olcuyor. Bir Agile teslim lideri neyi sorgulamalidir?',
    scenarioContext: 'Kuyruklar buyuyor ve devir teslimler yavas, ancak kullanim yuksek gorunuyor.',
    explanation:
      'Kanban deger akisine ve etkililik, verimlilik ve tahmin edilebilirlik dengesine odaklanir. Yerel kullanim sistem akisina ters calisabilir.',
    whyItMatters:
      'Program sistemleri deger teslimi yavaslarken mesgul gorunebilir; akis metrikleri bu problemi daha erken gosterir.',
    choices: {
      a: 'Yuksek kullanim her zaman en iyi akis metrigidir',
      b: 'Yerel kullanim kuyruklari, yaslanan isi ve zayif deger akislarini gizleyebilir',
      c: 'Akis metrikleri tum paydas gorusmelerinin yerini almalidir',
      d: 'Ekip, throughput artirmak icin WIP kontrollerini kaldirmalidir',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Why Use Kanban?',
    },
  },
  'delivery-programme-001': {
    prompt: 'Bir teslim yoneticisi, cok sayida cikti iceren ama net sonucu olmayan bir roadmap devraliyor. En iyi ilk hamle nedir?',
    scenarioContext: '',
    explanation:
      'En guclu yanit, ciktilarin teslimini optimize etmeden once roadmapin degistirmesi gereken sonuclari ve deger sinyallerini netlestirmektir. Pratik teslim kararlarinin bir hedefe ihtiyaci vardir.',
    whyItMatters:
      'Sonuc netligi; kapsam, zaman ve bagimliliklar yaristiginda ekiplerin takas yapmasina yardim eder.',
    choices: {
      a: 'Ekiplerden her ciktiyi daha ayrintili tahmin etmelerini istemek',
      b: 'Roadmapin degistirmesi gereken sonuclari ve deger sinyallerini netlestirmek',
      c: 'Yeni bir arac secilene kadar planlanan tum isi iptal etmek',
      d: 'Momentum yaratmak icin her ogeyi sonraki sprinte tasimak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'delivery-programme-002': {
    prompt: 'Bir Agile programda riski erken ortaya cikarma olasiligi en yuksek teslim sinyali hangisidir?',
    scenarioContext: '',
    explanation:
      'Gorunur entegre incrementlar veya gosterilebilir dilimler, deger ve entegrasyon varsayimlarinin gercekte calisip calismadigini gosterir.',
    whyItMatters:
      'Program riski genellikle entegrasyon noktalarinda saklanir; gosterilebilir dilimler bunu sadece raporlardan daha erken ortaya cikarir.',
    choices: {
      a: 'Kac toplanti yapildigi',
      b: 'Ekiplerin gorunur entegre incrementlari veya gosterilebilir dilimleri olup olmadigi',
      c: 'Her gorevin isimli bir kisiye atanip atanmadigi',
      d: 'Yonetisim paketinde kac sayfa oldugu',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'delivery-programme-003': {
    prompt: 'Teknik bir programda uc ekip ayni platform bagimliligi yuzunden bloke oluyor. En iyi TPM tarzi yanit nedir?',
    scenarioContext: 'Her ekip ayri ayri eskale ediyor ve tarihler ayrismaya basliyor.',
    explanation:
      'En iyi yanit, ortak bagimliligi acik hale getirmek, sahiplik ve karar yollarini hizalamak ve isi gercek kisitlara gore siralamaktir.',
    whyItMatters:
      'Technical programme management, ekipler arasi belirsizligi azaltarak ve bagimlilik riskini yonetilebilir hale getirerek deger katar.',
    choices: {
      a: 'Her ekipten bagimliligi bagimsiz olarak cozmesini istemek',
      b: 'Sahip, karar yolu, siralama ve risk secenekleri olan tek bir gorunur bagimlilik plani olusturmak',
      c: 'Bir sprint review bunu ortaya cikarana kadar bagimliligi yok saymak',
      d: 'Platform isini en dusuk oncelikli backloga tasimak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'delivery-programme-004': {
    prompt: 'Bir program kilometre tasi riskte, ancak ekipler hala daha kucuk ve degerli bir dilim teslim edebilir. En iyi oneriniz nedir?',
    scenarioContext: '',
    explanation:
      'Tutarligi olan degerli bir dilimi korumak ve takaslari erken konusmak, riski saklamaktan veya degerden bagimsiz sekilde tum kapsami korumaktan daha gucludur.',
    whyItMatters:
      'Agile program liderligi degeri, seffafligi ve surdurulebilir teslimati ayni konusmada tutmalidir.',
    choices: {
      a: 'Riski kilometre tasi tarihine kadar saklamak',
      b: 'Kapsam seceneklerini konusmak ve en degerli tutarli dilimi korumak',
      c: 'Fazla mesai ekleyerek her ekibi orijinal kapsami korumaya zorlamak',
      d: 'Teslimat basladigi icin tum kesfi durdurmak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'delivery-programme-005': {
    prompt: 'Bir Agile Programme Manager, her ekibin yerel olarak iyilestigini ama uctan uca lead timein kotulestigini goruyor. Neyi incelemelidir?',
    scenarioContext: '',
    explanation:
      'Yerel optimizasyon uctan uca sonuclarla celistiginde tum akisi inceleyin: kuyruklar, devir teslimler, bagimliliklar ve entegrasyon gecikmeleri.',
    whyItMatters:
      'Program teslimati, bireysel ekip panolarinin icinde oldugu kadar ekipler arasindaki alanlarda da yasar.',
    choices: {
      a: 'Yalnizca her ekibin bireysel velocity degeri',
      b: 'Ekipler arasi akis, kuyruklar, devir teslimler ve entegrasyon gecikmeleri',
      c: 'Daha fazla durum toplantisi eklenip eklenemeyecegi',
      d: 'Tamamlanan Jira alanlarinin sayisi',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'delivery-programme-006': {
    prompt: 'Bir steering group kirmizi/sari/yesil durum istiyor ama teslimati acmak icin gereken kararleri tartismaktan kaciniyor. Teslim lideri ne yapmalidir?',
    scenarioContext: 'Durum paketi parlak, ancak kilit kararlar tekrar tekrar erteleniyor.',
    explanation:
      'RAG durumu ancak karar urettiginde faydalidir. Daha guclu hamle, toplantiyi sadece renge degil kararlara, takaslara ve sonuclara gore cercevelemektir.',
    whyItMatters:
      'Yonetisim, teslim sistemlerinin sadece etiketlenmesine degil ogrenmesine ve karar vermesine yardim etmelidir.',
    choices: {
      a: 'Catismadan kacinmak icin durumu ust seviyede tutmak',
      b: 'Toplantiyi sadece renk yerine kararlar, takaslar ve sonuclar etrafinda cercevelemek',
      c: 'Riskleri kesinlesene kadar rapordan kaldirmak',
      d: 'Ekiplerden etkiyi sessizce ustlenmelerini istemek',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'stakeholders-risk-001': {
    prompt: 'Bir paydas bir sonucdan etkileniyor ancak isi fonlamiyor. Yine de teslim planlamasinda dikkate alinmali mi?',
    scenarioContext: '',
    explanation:
      'Pratik teslim ve Kanban dilinde paydaslar, yalnizca fonlayanlar degil sonuclarla ilgilenen veya sonuclardan etkilenen varliklari da icerir.',
    whyItMatters:
      'Etkilenen gruplari kacirmak, teslimatin gec asamasinda benimseme, risk ve deger problemleri yaratir.',
    choices: {
      a: 'Hayir, sadece fonlayanlar paydas sayilir',
      b: 'Evet, etkilenen gruplar isi fonlamasalar bile paydas olabilir',
      c: 'Yalnizca her seremoniye katilirsa',
      d: 'Yalnizca surum tamamlandiktan sonra',
    },
    reference: {
      title: 'Kanban Guide May 2025',
      section: 'Conventions Used',
    },
  },
  'stakeholders-risk-002': {
    prompt: 'Bir risk belirsiz ama gerceklesirse teslimata onemli zarar verebilir. En guclu Agile teslim yaniti nedir?',
    scenarioContext: '',
    explanation:
      'Iyi Agile teslim, belirsizligi gorunur kilar ve onu ogrenme veya azaltma aksiyonlarina donusturur. Risk sorun olana kadar beklemek secenekleri azaltir.',
    whyItMatters:
      'Risk konusmalari, kararlar sonucu hala degistirebilecekken en faydalidir.',
    choices: {
      a: 'Sorun olana kadar yok saymak',
      b: 'Gorunur kilmak, secenekleri tartismak ve bir sonraki risk azaltici aksiyona karar vermek',
      c: 'Ozel bir listeye ekleyip paydas endisesinden kacinmak',
      d: 'Ekibin destek olmadan cozecegini varsaymak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'stakeholders-risk-003': {
    prompt: 'Iki ust duzey paydas sonraki increment icin celisen oncelikler istiyor. Teslim lideri neyi tesvik etmelidir?',
    scenarioContext: 'Ekip, duzenleyici bir taahhudu geciktirmeden ikisini birden yapamaz.',
    explanation:
      'En iyi yanit, seffaf takas ve hesap verebilir karar almadir. Gizli oncelik catismasi teslim riskine donusur.',
    whyItMatters:
      'Teslim liderleri, kapasitenin sonsuz oldugunu varsaymadan celisen talebi gorunur kilmalidir.',
    choices: {
      a: 'Toplantida en yuksek sesli paydasin karar vermesine izin vermek',
      b: 'Takasi acik hale getirmek ve oncelik kararini hesap verebilir urun veya yonetisim yoluna tasimak',
      c: 'Ekibi bolmek ve tarihleri degistirmeden ikisini de denemek',
      d: 'Catismadan kacinmak icin Developersin sessizce secmesini istemek',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'stakeholders-risk-004': {
    prompt: 'Bir bagimlilik sahibi soz verdigi tarihleri tekrar tekrar kaciriyor. En iyi sonraki adim nedir?',
    scenarioContext: '',
    explanation:
      'Tekrarlanan bagimlilik kacirmasi, seffaf risk yonetimini, kurtarma seceneklerini ve kanita dayali yeniden planlamayi tetiklemelidir.',
    whyItMatters:
      'Bagimlilik riski, sahiplik, secenekler ve sonuclar acik oldugunda iyilesir.',
    choices: {
      a: 'Guveni korumak icin orijinal plani degistirmeden tutmak',
      b: 'Bagimlilik riskini ortaya cikarmak, kurtarma seceneklerinde anlasmak ve kanita gore planlari ayarlamak',
      c: 'Bagimliligin tum izlerini takim panolarindan kaldirmak',
      d: 'Zayif velocity icin bagimli ekibi suclamak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'stakeholders-risk-005': {
    prompt: 'Bir paydas, yuksek belirsizlik ve az tarihsel veri olan is icin kesin bir teslim tarihi istiyor. En guclu cevap nedir?',
    scenarioContext: '',
    explanation:
      'En iyi yanit, varsayimlar ve ogrenme plani ile birlikte seffaf belirsizliktir. Bu, kesinlik varmis gibi davranmadan karar almayi destekler.',
    whyItMatters:
      'Guven, tahminler durust oldugunda ve tahmin edilebilirligi iyilestiren aksiyonlarla desteklendiginde buyur.',
    choices: {
      a: 'Guven gostermek icin yine de kesin bir tarih vermek',
      b: 'Belirsizligi aciklamak, varsayimlari paylasmak ve belirsizligi hizla azaltacak bir plan onermek',
      c: 'Agileda tarih yok diyerek tarihleri tartismayi reddetmek',
      d: 'Gerekirse hafta sonu calismaya ekibi taahhut ettirmek',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'stakeholders-risk-006': {
    prompt: 'Buyuk bir compliance bagimliligi gec kesfedildi. Product Owner, Sprint Goalu degistirmeden isi sessizce absorbe etmek istiyor. En guclu yanit nedir?',
    scenarioContext: 'Compliance isi, mevcut Sprint icin kapsam ve surum riskini degistirebilir.',
    explanation:
      'En guclu yanit, seffaf inceleme ve kapsam muzakeresidir. Scrum, daha fazla ogrenildikce kapsam netlestirmeye izin verir, ancak kalite dusmemelidir.',
    whyItMatters:
      'Regulatory ve compliance riski, gizli kapsam baskisi degil aciklik ister.',
    choices: {
      a: 'Paydaslar guven kaybetmesin diye sessizce absorbe etmek',
      b: 'Etkisini seffafca incelemek ve Sprint Goal hala korunabiliyorsa Product Owner ile kapsami yeniden muzareke etmek',
      c: 'Compliance isi Agile degil diye Scrumu hemen iptal etmek',
      d: 'Developersdan yeni isi sigdirmak icin kaliteyi dusurmesini istemek',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'The Sprint',
    },
  },
  'facilitation-coaching-001': {
    prompt: 'Bir retrospective cok fazla iyilestirme fikri belirliyor. En iyi fasilitasyon hamlesi nedir?',
    scenarioContext: '',
    explanation:
      'En guclu fasilitasyon hamlesi, ekibin gorunur sahiplikle odakli iyilestirmeler secmesine yardim etmektir. Cok fazla aksiyon genellikle hicbirinin iyilesmemesi anlamina gelir.',
    whyItMatters:
      'Takim sagligi, unutulmus retro fikirleri backlogu ile degil, tamamlanan kucuk degisikliklerle iyilesir.',
    choices: {
      a: 'Kimse gormezden gelinmis hissetmesin diye her fikri secmek',
      b: 'Ekibin az sayida etkili aksiyon secmesine yardim etmek ve sahipligi gorunur kilmak',
      c: 'Aksiyonlari atlayip herkese tesekkur etmek',
      d: 'Yoneticinin sonra ozel olarak secmesine izin vermek',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'facilitation-coaching-002': {
    prompt: 'Bir Scrum Master, ekibin tum gorevleri atamasi icin kendisini bekledigini fark ediyor. Scrum icin en uygun kocluk yonu nedir?',
    scenarioContext: '',
    explanation:
      'Scrum Master, gorev dagiticisi haline gelerek degil, oz yonetim ve capraz fonksiyonellik konusunda ekibe hizmet eder.',
    whyItMatters:
      'Oz yonetim daha hizli yerel kararlar ve Sprint Goal sahipligini guclendirir.',
    choices: {
      a: 'Akisi iyilestirmek icin gorevleri daha hizli atamak',
      b: 'Ekibi oz yonetim ve ortak hesap verebilirlik yonunde koclamak',
      c: 'Product Ownerdan teknik gorevleri atamasini istemek',
      d: 'Gorev atamasini steering groupa tasimak',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Scrum Master',
    },
  },
  'facilitation-coaching-003': {
    prompt: 'Sessiz bir muhendis planlama toplantisindan sonra tahmine itiraz ederken kendini guvende hissetmedigini soyluyor. En iyi koc yaniti nedir?',
    scenarioContext: 'Endise Sprint tahminini ve ekip dinamiklerini etkileyebilir.',
    explanation:
      'En iyi yanit hem teslim riskini hem de ekip sistemini ele alir. Psikolojik guvenlik ve itiraza acik davet, planlama kalitesini iyilestirir.',
    whyItMatters:
      'Gizli endiseler teslim surprizlerine donusur; iyi fasilitasyon faydali fikir ayriligini daha guvenli hale getirir.',
    choices: {
      a: 'Bir dahaki sefere daha cesur olmasini soylemek ve plani degistirmemek',
      b: 'Endiseyi incelemek ve itirazin nasil davet edildigini iyilestirmek icin daha guvenli bir forum yaratmak',
      c: 'Yoneticiden muhendisi ozel olarak duzeltmesini istemek',
      d: 'Planlama tamamlandigi icin konuyu yok saymak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'facilitation-coaching-004': {
    prompt: 'Bir ekip kacirilan her hedefi dis blokere bagliyor ama kendi calisma anlasmalarini hic degistirmiyor. En guclu kocluk durusu nedir?',
    scenarioContext: '',
    explanation:
      'Iyi kocluk, dis engelleri ekibin kontrol edebilecegi deneylerden ayirir. Ikisi de onemli olabilir, ancak ekibin kendi iyilestirmeleri uzerinde ajansa ihtiyaci vardir.',
    whyItMatters:
      'Saglikli bir ekip kisitlari inkar etmez; onlarin icinde ve etrafinda bir sonraki faydali aksiyonu bulur.',
    choices: {
      a: 'Aciklamayi kabul edip retrospectivei erken bitirmek',
      b: 'Dis engelleri ekip kontrollu deneylerden ayirmak ve denenecek bir degisiklik secmek',
      c: 'Ekibe Agileda blokerlere izin olmadigini soylemek',
      d: 'Tum iyilestirme sahipligini program yoneticisine tasimak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
  'facilitation-coaching-005': {
    prompt: 'Bir yonetici bireysel ilerlemeyi kontrol etmek icin her Daily Scrum etkinligine katilmak istiyor. Agile coach ne onermelidir?',
    scenarioContext: '',
    explanation:
      'Daily Scrum, Developersin ilerlemeyi incelemesi ve planlari uyarlamasi icindir. Yonetim seffafligi, amacini durum raporlamasina cevirmeden desteklenebilir.',
    whyItMatters:
      'Etkinlik amacini korumak, liderlere faydali gorunurluk saglarken ekiplerin oz yonetimini destekler.',
    choices: {
      a: 'Daily Scrumu yonetici durum toplantisi yapmak',
      b: 'Developersin Sprint Goal ilerlemesine odagini korumak ve yonetim icin baska bir seffaflik mekanizmasi onermek',
      c: 'Catismadan kacinmak icin Daily Scrumu iptal etmek',
      d: 'Developersdan yalnizca blokerleri raporlamasini ve planlamayi atlamasini istemek',
    },
    reference: {
      title: 'Scrum Guide 2020',
      section: 'Daily Scrum',
    },
  },
  'facilitation-coaching-006': {
    prompt: 'Bir Agile Coacha, cok farkli ekiplere tek bir sureci zorlayarak "Agile kurmasi" isteniyor. En guclu yanit nedir?',
    scenarioContext: 'Bazi ekipler Scrum, digerleri akis tabanli teslim kullaniyor ve kisitlari farkli.',
    explanation:
      'Agile kocluk; ilkeleri, seffafligi ve sonuclari baglama baglamalidir. Pratikler, amaci korudugu ve teslimi saglikli hale getirdigi surece degisebilir.',
    whyItMatters:
      'Surec uyumu duzenli gorunebilir ama cevikligi azaltabilir; kocluk sadece kelime haznesini standartlastirmak degil, sistemi iyilestirmelidir.',
    choices: {
      a: 'Her ekip icin tek bir seremoni setini zorunlu kilmak',
      b: 'Pratiklerin baglama uymasina izin verirken ilkeler, seffaflik ve sonuclar etrafinda kocluk yapmak',
      c: 'Tum surec dilini kaldirip kahramanliga guvenmek',
      d: 'Ekipleri yalnizca secilen sablona uyumla puanlamak',
    },
    reference: {
      title: '',
      section: '',
    },
  },
};

export const TR_TRANSLATIONS = {
  language: {
    code: 'TR',
    label: 'Dil',
    menuLabel: 'Dil sec',
    options: {
      en: 'Ingilizce',
      es: 'Ispanyolca',
      fr: 'Fransizca',
      de: 'Almanca',
      tr: 'Turkce',
    },
  },
  os: {
    topbar: {
      systemName: 'Burak OS',
      languageButtonLabel: 'Dil',
      themeLight: 'Acik temaya gec',
      themeDark: 'Koyu temaya gec',
      lockButton: 'Ekrani kilitle',
    },
    loading: {
      title: 'Burak OS Yukleniyor',
    },
    orientation: {
      title: 'Dikey mod gerekli',
      copy: 'Burak OS kullanmaya devam etmek icin cihazinizi dikey moda cevirin.',
    },
    desktop: {
      label: 'Burak OS masaustu',
      iconArea: 'Masaustu uygulamalari',
      brand: 'Burak OS',
    },
    lock: {
      title: 'Kilitli',
      kicker: 'Burak OS',
      desktop: 'Kilidi acmak icin Enter tusuna basin',
      touch: 'Kilidi acmak icin yukari kaydirin',
    },
    controls: {
      closeHelp: 'Yardim penceresini kapat',
      closeWindow: 'Pencereyi kapat',
      help: 'Yardim',
      openHelp: 'Yardimi ac',
      minimiseUnavailable: 'Simge durumuna kucultme kullanilamiyor',
    },
    launchers: {
      resume: 'Resume.exe',
      blog: 'Blog.exe',
      github: 'GitHub',
      downloads: 'Indirmeler',
      bin: 'Cop Kutusu',
      openResume: 'Resume.exe ac',
      openBlog: 'Blog.exe ac',
      openGithub: 'GitHub ac',
      openDownloads: 'Indirmeleri ac',
      openBin: 'Cop Kutusunu ac',
      openMaze: 'Maze.exe ac',
      openQuiz: 'Quiz.exe ac',
    },
    windows: {
      resume: {
        title: 'Resume.exe',
        helpTitle: 'Resume.exe Yardim',
        helpCopy: "Resume.exe, Burak'in profesyonel gecmisini, deneyimini ve basarilarini anlatan etkilesimli bir zaman cizelgesidir.",
      },
      blog: {
        title: 'Blog.exe',
        helpTitle: 'Blog.exe Yardim',
        helpCopy:
          "Blog.exe, Burak'in blog arsivini icerir. Arsiv girdileri yazilari dahili sekmelerde acar; arsiv sekmesi solda acik kalir, boylece acik yazilari kaybetmeden geri donebilirsiniz.",
      },
      github: {
        title: 'GitHub',
        helpTitle: 'GitHub Yardim',
        helpCopy: "GitHub, Burak'in en son herkese acik GitHub repositorylerini gosterir. Repository baglantilari GitHub'i yeni bir tarayici sekmesinde acar.",
      },
      downloads: {
        title: 'Indirmeler',
        helpTitle: 'Indirmeler Yardim',
        helpCopy: "Indirmeler indirilebilir dosyalari icerir. Su anda Burak'in ozgecmisini/CVsini icerir.",
      },
      bin: {
        title: 'Cop Kutusu',
        helpTitle: 'Cop Kutusu Yardim',
        helpCopy:
          'Cop Kutusu gizli Burak OS easter egglerini icerir. Maze.exe ve Quiz.exe tamamen tarayicida calisir. Ilerleme veya yuksek skorlar uygun yerlerde yerel olarak saklanabilir.',
      },
      maze: {
        title: 'Maze.exe',
        helpTitle: 'Maze.exe Yardim',
        helpCopy:
          'Maze.exe hedefi: dis duvardaki gorunur acikliktan kacmak. Masaustunde ok tuslari veya WASD, dokunmatikte D-pad kullanin. Toplanabilir ogeler ek puan verir. Dinamik gecit kaymalari Level 3te baslar. Ilk canavar Level 6da merkezi baslangic alanindan ayrildiktan sonra, ikinci canavar Level 11de baslar. Canavara temas kosuyu hemen bitirir. Yuksek skorlar uygun yerlerde yerel olarak saklanir. Cop Kutusuna cikmak mevcut kosuyu bitirir. Muzik baslangic ve game-over menulerinden acilip kapatilabilir.',
      },
      quiz: {
        title: 'Quiz.exe',
        helpTitle: 'Quiz.exe Yardim',
        helpCopy:
          'Quiz.exe iki moda sahiptir. Arcade Terminal can, skor, seviye ve seri kullanir. Coach Console 12 soruluk ogrenme oturumlari ve kategori geri bildirimi kullanir. Dort cevaptan birini butonlarla, 1-4 sayi tuslariyla veya A-D harf tuslariyla secin. Her cevaptan sonra aciklamalar gorunur. Ilerleme ve yuksek skorlar uygun yerlerde yerel olarak saklanir. Ilerlemeyi Sifirla yalnizca Quiz.exe uygulamasini etkiler. Cop Kutusuna cikmak aktif oturumu atar ama tamamlanan ilerlemeyi korur.',
      },
    },
  },
  downloads: {
    helper: 'Indirmek icin dosyaya tiklayin',
    aria: 'Indirmeler klasoru icerigi',
    downloadPdf: 'Resume-BURAK-YUKSEL.pdf indir',
    confirmTitle: "Burak'in ozgecmisini indirmeye devam edilsin mi?",
    yes: 'Evet',
    no: 'Hayir',
    cancel: 'Indirmeyi iptal et',
  },
  bin: {
    helper: 'Cop Kutusundaki gizli dosyalari ac',
    aria: 'Cop Kutusu klasoru icerigi',
  },
  resume: {
    aria: 'Resume.exe kariyer dosya gezgini',
    eyebrow: 'Kariyer Dosya Gezgini',
    title: 'Zaman cizelgesi arsivi',
    selected: 'Secili:',
    linkedin: 'LinkedIn',
    filesAria: 'Kariyer dosyalari',
    filesTitle: 'Kariyer Dosyalari',
    itemCount: '{count} oge',
    listAria: 'Bir kariyer dosyasi sec',
    current: 'Guncel',
    previewTitle: 'Dosya Onizleme',
    inspector: 'Inspektor',
    activeFile: 'Aktif dosya',
    archiveFile: 'Arsiv dosyasi',
    currentMarker: 'Guncel zaman cizelgesi isareti',
    marker: 'Zaman cizelgesi isareti',
    entries: {
      born: {
        title: 'Program Baslangici: Human v1.0',
        date: '1996',
        detailHtml:
          '<p><strong><em>Hayat yolculugunun basladigi yer...</em></strong></p><p>Basarili teslim kilometre tasinin ardindan ilk surum 1996da yayina alindi. Ogrenme, dayaniklilik ve surekli optimizasyona odaklanan yinelemeli gelisim fazina girildi. Sonraki surumler artan kabiliyet, olgunluk ve etki gostermeye devam etti.</p>',
      },
      university: {
        title: 'Universite - BSc (Hons) Software Engineering, First-Class Honours',
        date: '2014 - 2018',
        detailHtml:
          '<p><strong><em>Buyume, konforun bittigi anda baslar</em></strong></p><h5>Universite Yillarim:</h5><p>Universite benim reset tusum oldu. Isleri tersine cevirme sansi. Software Engineering sectim, beklemedigim bir kivilcim buldum ve disiplin, sahiplenme ve dayaniklilik ogrendikten sonra First-Class Honours ile mezun oldum.</p><h5>Neyi Baslatti:</h5><p>Universite bana ilerlemenin yapmakla, bahaneler yerine emegi secmekle ve konforun otesinde buyumeye devam etmekle geldigini ogretti.</p>',
      },
      ge: {
        title: 'General Electric Internship',
        date: '2016 - 2017',
        detailHtml:
          '<h5>Tech stack:</h5><ul><li>Full-stack uluslararasi is arac seti: PHP, MySQL, HTML/CSS, JavaScript, AJAX, jQuery, XML, Python</li><li>Uzun vadeli etkiyi dusunerek hata ayiklama, performans iyilestirmeleri ve surdurulebilir kod</li></ul><h5>Agile &amp; SDLC:</h5><ul><li>Backlog grooming, yinelemeli teslim ve peer review iceren Scrum tarzi kadans</li><li>Imza oncesi dogrulama ve validasyonla tam SDLC akisi</li></ul><h5>Is birligi:</h5><ul><li>Bagimliliklari acmak ve son kullanici standartlarina zamaninda teslim etmek icin yerel ve global ekiplerle calistim</li><li>Dagitik ekip calismasi, paydas is birligi ve profesyonel oz farkindalik icin erken temeller attim.</li></ul>',
      },
      barclays: {
        title: 'Barclaycard (Barclays)',
        date: 'Jun 2018 - Mar 2024',
        detailHtml:
          '<p><strong><em>Teoride ogrenmeyi birakip gercekte teslim etmeye basladigim yer burasiydi!</em></strong></p><h5>Scrum Master (Apr 2022 - Mar 2024)</h5><p>Regule banking ortaminda guvenli platformlar teslim eden 2 cross-functional application development ekibine liderlik ettim ve kocluk yaptim.</p><h5>DevOps Engineer / Software Engineer (Jun 2018 - Apr 2022)</h5><p>Terraform, Jenkins, Chef, Packer, Ruby ve OpenShift kullanarak AWS tabanli platformlar kurdum ve destekledim; ekiplerin on-prem altyapidan AWSye ve daha guclu CI/CD calisma bicimlerine gecisine yardim ettim.</p><h5>Sonuclar</h5><ul><li>Tahmin edilebilirligi 80%+ seviyesine cikardim ve backlog waste oranini 33% azalttim.</li><li>Jira adaptasyonu, migration testing, operational readiness ve birden fazla ekip icin platform support yollarini destekledim.</li></ul>',
      },
      discover: {
        title: 'Discover Financial Services / Capital One',
        date: 'Mar 2024 - Apr 2026',
        detailHtml:
          '<p><strong><em>Basarisizlik korkusu ilerlemenin dusmanidir. Yapmamak basarisiz olmaktir. Bu yuzden yapmayi seciyorum. Denemeyi. Ogrenmeyi. Buyumeyi.</em></strong></p><h5>Agile &amp; Technical Programme Manager (Mar 2025 - Apr 2026):</h5><ul><li>7 engineering ekibinde Agile delivery ve program execution liderligi yaptim; Capital One merger aktivitesi ve multi-wave token migration readiness calismalarini destekledim.</li><li>Delivery predictability oranini 65%ten 85%e cikardim, epic cycle time suresini 100+ gunden ~55 gune indirdim; RAID governance, PI planning, readiness ve veriye dayali scalability kararlarini guclendirdim.</li></ul><h5>Scrum Master (Mar 2024 - Mar 2025):</h5><ul><li>UK ve India genelinde dagitik engineering ekiplerine self-organisation, ownership ve delivery discipline konularinda kocluk yaptim.</li><li>Refinement, dashboardlar, capacity planning, Product Owner destegi ve no-blame retrospectives pratiklerini iyilestirdim.</li></ul>',
      },
      careerBreak: {
        title: 'Kariyer Molasi',
        date: 'Apr 2026 - Present',
        detailHtml:
          '<p><strong><em>Seyahat etmek, enerji toplamak ve sirada ne gelecegini secme ozgurlugunun tadini cikarmak icin zaman ayiriyorum.</em></strong></p><h5>Guncel durum</h5><p>Discover Financial Services / Capital One donemimi Nisan 2026da tamamladiktan sonra full-time isten uzaklasip gercek bir kariyer molasi almaya karar verdim.</p><p>Su anda seyahat ediyor, hayatin tadini cikariyor ve sonraki bolumun nasil gorunmesini istedigimi kesfediyorum. Bu dogru bir kalici firsat, kontratli calisma veya kendi isimi kurmak olabilir, ama sadece ise donmek icin aceleyle bir yol secmek istemiyorum.</p><p>Simdilik odak yeni deneyimler, kisisel projeler ve sirada ne gelecegine karar verme ozgurlugunu en iyi sekilde kullanmak.</p>',
      },
      future: {
        title: 'Sonraki Bolum',
        date: '👀',
        detailHtml:
          '<p><strong><em>Gelecek sen olabilir misin...?</em></strong></p><p>kaderle biraz flort etmeye ne dersin? Bana bir mesaj at veya ara.</p><p>📧 beyuksel96@gmail.com</p><p>📞 +44 7450 955663</p>',
      },
    },
  },
  blog: {
    aria: 'Blog.exe dahili tarayici',
    controlsAria: 'Blog.exe pencere kontrolleri',
    close: 'Blog.exe kapat',
    minimise: 'Blog.exe simge durumuna kucultme kullanilamiyor',
    help: 'Blog.exe yardimini ac',
    location: 'Guncel Blog.exe konumu',
    openTabs: 'Blog.exe acik sekmeler',
    tabs: 'Blog sekmeleri',
    archive: 'Arsiv',
    archiveEyebrow: 'Yazi Arsivi',
    archiveTitle: 'Yazi kaydi',
    groupedAria: 'Yil ve aya gore gruplanmis blog arsivi',
    readMinutesShort: '{minutes} dk',
    readMinutesLong: '{minutes} dk okuma',
    tagsFor: '{title} icin etiketler',
    tags: 'Etiketler:',
    tagsByKey: {
      ai: 'Yapay Zeka',
      'vibe-coding': 'Vibe Coding',
      agile: 'Agile',
      'building-in-public': 'Acik sekilde insa etmek',
      codex: 'Codex',
      'product-thinking': 'Urun dusuncesi',
      portfolio: 'Portfolio',
      'software-development': 'Yazilim gelistirme',
      welcome: 'hos geldiniz',
      resume: 'ozgecmis',
      blog: 'blog',
    },
    backToPosts: 'Yazilara Don',
    backToPost: 'Yaziya Don',
    share: 'Paylas',
    copyLink: 'Baglantiyi Kopyala',
    shareLinkedIn: 'LinkedInde paylas',
    backAria: 'Yazilara geri don',
    sharePost: 'Yaziyi paylas',
    postActions: '{title} icin yazi aksiyonlari',
    tagResults: 'Etiket Sonuclari',
    postsTagged: '"{tag}" etiketli yazilar',
    matchingPosts: '{count} eslesen {count, plural, one {yazi} other {yazi}}',
    matchingRows: 'Secili etiketle eslesen yazilar',
    linkCopied: 'Baglanti Kopyalandi',
    closeTab: '"{title}" sekmesini kapat',
    shareCopy: 'Burak Yukselin az once okudugum bu son yazisina bakin! Kesinlikle okumaya deger!',
    posts: {
      'hello-world': {
        title: 'Hello World 👀',
        description: 'Fikirler, deneyler, dusunceler ve devam eden calismalar icin yasayan bir alan.',
        bodyHtml:
          '<h2>Hos Geldiniz</h2><p>Bu blog sesli dusunmek icin bir ev. Cilalanmis sonuclar degil; fikirler, deneyler, dersler ve dusunceler olduklari anda burada.</p><h2>Bu Blog Nedir (ve Ne Degildir)</h2><p>Agile teslim, GenAI, projeler, ogrenme ve dusunceler hakkinda yazilar bulacaksiniz. Bazi yazilar pratik, bazilari teknik, bazilari fikirli ve bazilari sadece herkese acik dusunme olacak.</p><h2>Bunu Neden Yaziyorum</h2><p>En iyi insa ederek ve yazarak ogreniyorum. Bu blog buyumenin, merakin ve insanlar, sistemler, yaraticilik ve teknolojinin kesistigi yerin kaydini tutar.</p><h2>Bu Website Hakkinda</h2><p>Bu site bilerek sade: bir ozgecmis, bir blog ve bir GitHub. Herkese acik dijital bir defter gibi dusunun.</p><h2>Bundan Sonra Ne Beklemeli</h2><p>Kusurlu yazilar, evrilen fikirler, devam eden calismalar ve zamanda durust kareler bekleyin. Benim guzel, cilgin dunyama hos geldiniz!</p>',
      },
      'vibe-coding': {
        title: 'Come Vibe (Code) With Me 🖥️',
        description: 'Doom-scrolldan vibe codinge nasil gectim.',
        bodyHtml:
          '<h2>Vibe Coding Sonuna Kadar 🚀</h2><p>Vibe codinge basladim cunku erteliyordum, insanlarin websiteleri, uygulamalar ve araclar yayina almasini izliyordum ve sonunda kendime neden katilmayayim diye sordum.</p><h2>Kivilcim 🔥</h2><p>PureOrigins.uk ile basladi, sonra bir arkadasimin forefinder.golfu vibe coding ile insa etmesini izledim. Momentum bagimlilik yapti.</p><h2>Kucuk Baslamaya Bak 🤏</h2><p>AI ile insa etmenin gercekte nasil hissettirdigini anlamak istedim. Kucuk araclar, deneyler, arkadas projeleri ve bu website yeniden insa etmeye donus yolum oldu.</p><h2>En Buyuk Ders: AI Tek Atislik Bir Makine Degil 🧠</h2><p>AI en iyi adim adim yonlendirildiginde calisir. Disiplinli bir Agile ekip gibi kucuk insa et, hizli yayinla, davranisi test et ve yinele.</p><h2>AI Sadece Bir Arac Degil. Bir Uzanti 🤖</h2><p>AI insa eder, ama direksiyonda sen varsindir. Urun dusuncesi, net sonuclar ve dikkatli promptlar onemlidir.</p><h2>Gercek</h2><p>Vibe coding fikirleri hayata gecirmekle ilgilidir: daginik, artimli, kusurlu ama canli.</p>',
      },
      'burak-os-revamp': {
        title: 'Portfolyomu yeniden yapmak icimdeki builderi yeniden bulmami sagladi',
        description:
          'Portfolyomu Burak OS haline getirmenin AI destekli gelistirme, teslim disiplini ve yeniden insa etme keyfiyle nasil yaratici bir deneye donustugu.',
        bodyHtml:
          '<h2>TL;DR</h2><p>Portfolyomu Codex ile yaratici bir deney olarak Burak OS seklinde yeniden yaptim ve teslim/program liderligine daha fazla kaydiktan sonra yeniden insa etmeyle bag kurmami sagladi.</p><h2>Neden Burak OS?</h2><p>Eski portfolio kotu degildi, ama daha etkilesimli, kesfedilebilir ve kisisel bir sey istedim: duz bir CV sayfasi yerine gezilebilen kucuk bir calisma alani.</p><h2>Ne insa ettik</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, tema kontrolleri, kilit ekrani, dil destegi ve bolca responsive polish siteyi oyuncu bir statik isletim sistemine cevirdi.</p><h2>Codex bana ne ogretti</h2><p>AI destekli gelistirme guclu, ama tek promptluk sihir degil. AI insa eder, ama zevk, yapi, test ve teslim disipliniyle direksiyonda hala sen varsindir.</p><h2>Gercek</h2><p>Bu proje bana icimdeki builderin kaybolmadigini hatirlatti. Sadece dogru bahaneyi bekliyordu.</p>',
      },
    },
  },
  github: {
    aria: 'GitHub repository gezgini',
    eyebrow: 'Repo Gezgini',
    title: 'En son herkese acik repositoryler',
    waiting: 'GitHub.exe acilmasi bekleniyor',
    count: '{count} repo',
    connectionAria: 'GitHub baglanti detaylari',
    connection: 'Baglanti',
    publicApi: 'Public API',
    source: 'Kaynak',
    profileCopy: 'En son guncellenen alti herkese acik repository.',
    sort: 'Sirala',
    updated: 'Guncellendi',
    limit: 'Limit',
    limitValue: '6 repo',
    mode: 'Mod',
    browserFetch: 'Tarayici fetch',
    resultsAria: 'Repository sonuclari',
    repositories: 'Repositoryler',
    livePublicData: 'Canli public data',
    loadingTitle: 'GitHuba baglaniliyor...',
    loadingCopy: 'En son herkese acik repositoryler aliniyor.',
    errorTitle: 'GitHuba ulasilamadi',
    errorCopy: 'GitHub repositoryleri yuklenemedi.',
    retry: 'Yeniden dene',
    emptyTitle: 'Repository donmedi',
    emptyCopy: 'Public API bu profil icin herhangi bir repository dondurmedi.',
    unable: 'GitHuba ulasilamiyor',
    noneReturned: 'Herkese acik repository donmedi',
    loaded: 'En son repositoryler yuklendi',
    unknownDate: 'Bilinmiyor',
    commitsUnavailable: 'Commitler kullanilamiyor',
    commitCount: '{count} {count, plural, one {commit} other {commit}}',
    untitledRepo: 'Basliksiz repository',
    noDescription: 'Aciklama saglanmadi.',
    unknownLanguage: 'Bilinmiyor',
    updatedPrefix: 'Guncellendi',
    openOnGithub: 'GitHubda ac',
    openRepo: '{name} GitHubda ac',
    metadata: 'Repository metadatasi',
  },
  maze: {
    aria: 'Maze.exe 8-bit labirent oyunu',
    statusAria: 'Labirent oyunu durumu',
    level: 'Level',
    score: 'Skor',
    high: 'Yuksek',
    playfield: 'Labirent oyun alani',
    recovered: 'Cop Kutusu dosyasi kurtarildi',
    title: 'Maze.exe',
    howToPlay: 'NASIL OYNANIR',
    objective: 'Her labirentten kacmak icin dis duvardaki acikligi bul.',
    controls: 'Ok tuslari, WASD veya dokunmatik D-pad ile hareket et.',
    rules:
      'Bonus puanlar icin ogeleri topla. Her levelda yeni rastgele bir labirent gelir. Level 3ten itibaren gecitler yakindaki rotalari degistirir. Level 6dan itibaren baslangictan ayrildiktan sonra canavarlar gorunur. Level 11den itibaren ikinci canavar katilir - tek temas kosuyu bitirir.',
    countdown: 'Her level 3, 2, 1 geri sayimindan sonra baslar.',
    play: 'Oyna',
    musicOn: 'MUSIC: ON',
    musicOff: 'MUSIC: OFF',
    paused: 'Duraklatildi',
    pausedCopy: 'Maze.exe aktif pencerenin geri donmesini bekliyor.',
    runEnded: 'Kosu bitti',
    gameOver: 'Game Over',
    finalScore: 'Final skor',
    highestLevel: 'En yuksek level',
    highScore: 'Yuksek skor',
    newHighScore: 'Yeni yuksek skor elde edildi',
    playAgain: 'Tekrar oyna',
    exitToBin: 'Cop Kutusuna cik',
    controlsAria: 'Maze dokunmatik kontrolleri',
    moveUp: 'Yukari hareket et',
    moveLeft: 'Sola hareket et',
    moveDown: 'Asagi hareket et',
    moveRight: 'Saga hareket et',
  },
  quiz: {
    aria: 'Quiz.exe Agile teslim quiz oyunu',
    recovered: 'Kurtarilmis egitim programi',
    title: 'Quiz.exe',
    intro:
      'Bozulmus teslim simulatoru geri yuklendi. Bir mod sec, dikkatli cevapla ve Agile sisteminin hangi parcalarinin baski altinda hala dayandigini gor.',
    modesAria: 'Quiz oyunu modlari',
    arcadeTerminal: 'Arcade Terminal',
    arcadeSummary: 'Canlar + seriler',
    arcadeCopy: 'Hizli tempolu teslim meydan okumasi. Canlarini koru, seri yap ve yuksek skor pesine dus.',
    coachConsole: 'Coach Console',
    coachSummary: '12 soruluk oturum',
    coachCopy: 'Gercekci durumlari calis, aciklamalari incele ve zayif bilgi alanlarini iyilestir.',
    progressLoading: 'Yerel ilerleme yukleniyor...',
    resetProgress: 'Ilerlemeyi Sifirla',
    exitToBin: 'Cop Kutusuna cik',
    resetConfirm: 'Quiz.exe yuksek skorlari ve ogrenme ilerlemesi temizlensin mi?',
    yesReset: 'Evet, sifirla',
    no: 'Hayir',
    statusAria: 'Quiz durumu',
    mode: 'Mod',
    lives: 'Can',
    level: 'Level',
    score: 'Skor',
    streak: 'Seri',
    question: 'Soru',
    answerChoices: 'Cevap secenekleri',
    correct: 'Dogru',
    incorrect: 'Yanlis',
    source: 'Kaynak',
    next: 'Sonraki',
    gameOver: 'Game Over',
    viewSummary: 'Ozeti Gor',
    modeSelect: 'Mod Secimi',
    playAgain: 'Tekrar Oyna',
    returnModeSelect: 'Mod Secimine Don',
    runEnded: 'Kosu bitti',
    finalScore: 'Final skor',
    highestLevel: 'En yuksek level',
    longestStreak: 'En uzun seri',
    highScore: 'Yuksek skor',
    newHighScore: 'YENI YUKSEK SKOR',
    learningSummary: 'Ogrenme oturumu ozeti',
    correctOutOf: '{total} icinden {correct} dogru ({percentage}%)',
    startAnother: 'Baska Oturum Baslat',
    arcadeHighScore: 'Arcade yuksek skor',
    coachProgress: 'Coach ilerlemesi',
    revisitSignal: 'Tekrar bakma sinyali',
    stillGathering: 'Hala veri toplaniyor',
    coachAttempts: '{count} coach denemesi',
    needsMoreAttempts: 'Daha fazla deneme gerekiyor',
    noWeakArea: 'Kalici zayif alan yok',
    whyThisMatters: 'Bu neden onemli: {text}',
    correctAnnounce: 'Dogru cevap. Aciklama hazir.',
    incorrectAnnounce: 'Yanlis cevap. Dogru cevap ve aciklama hazir.',
    resetAnnounce: 'Quiz ilerlemesi sifirlandi.',
    arcadeEndedAnnounce: 'Arcade kosusu bitti.',
    coachReadyAnnounce: 'Coach oturumu ozeti hazir.',
    strongestCategory: 'En guclu kategori',
    suggestedRevisit: 'Onerilen tekrar',
    revisitArea: 'Bu alana tekrar bak',
    earlyIndication: 'Erken isaret',
    categories: {
      'agile-principles': 'Agile ilkeleri',
      scrum: 'Scrum',
      'kanban-flow': 'Kanban ve akis',
      'delivery-programme': 'Teslim ve program yonetimi',
      'stakeholders-risk': 'Paydaslar, bagimliliklar ve risk',
      'facilitation-coaching': 'Fasilitasyon, kocluk ve ekip sagligi',
    },
    difficulties: {
      foundation: 'Temel',
      intermediate: 'Orta',
      advanced: 'Ileri',
    },
    questions: quizQuestionTranslations,
  },
};
