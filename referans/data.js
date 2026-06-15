// data.js — The Beergarita Pub içerik + görseller (Türkçe)
// Görseller: doğrulanmış Unsplash kimlikleri. Sonradan kolayca değiştirilebilir.
(function () {
  var U = function (id, w) {
    return "https://images.unsplash.com/photo-" + id +
      "?auto=format&fit=crop&w=" + (w || 1400) + "&q=80";
  };

  window.PUB = {
    video: "https://res.cloudinary.com/delwdsblr/video/upload/v1781050715/pikaso-beergarita-2026-06-10_sqibbp.mp4",
    poster: "https://res.cloudinary.com/delwdsblr/video/upload/so_0/v1781050715/pikaso-beergarita-2026-06-10_sqibbp.jpg",

    images: {
      beerPour:   U("1535958636474-b021ee887b13"),
      barWide:    U("1514933651103-005eec06c04b"),
      beerFoam:   U("1571613316887-6f8d5cbf7ef7"),
      burger:     U("1568901346375-23c9450c58cd"),
      cocktails:  U("1551024709-8f23befc6f87"),
      whiskey:    U("1569529465841-dfecdab7503b"),
      wineCheers: U("1510812431401-41d2bd2722f3"),
      barLights:  U("1543007630-9710e4a00a20"),
      bottlesSun: U("1436076863939-06870fe779c2"),
      barString:  U("1538488881038-e252a119ace7"),
      barEdison:  U("1572116469696-31de0f17cc34"),
      feast:      U("1547573854-74d2a71d0826"),
      wineCheese: U("1452251889946-8ff5ea7b27ab"),
      fineDining: U("1414235077428-338989a2e8c0"),
      facade:     U("1559925393-8be0ec4767c8"),
      people:     U("1592861956120-e524fc739696"),
      steakFries: U("1600891964092-4316c288032e"),
      cubaLibre:  U("1556679343-c7306c1976bc")
    },

    hours: [
      { d: "Pazartesi – Cumartesi", h: "12:00 – 02:00" },
      { d: "Pazar", h: "15:00 – 02:00" }
    ],

    contact: {
      address: "Gayrettepe, Yıldız Posta Cd. Yıldız Residence,\n34349 Beşiktaş / İstanbul",
      phone: "0212 213 40 46",
      phoneHref: "tel:+902122134046",
      maps: "https://www.google.com/maps?q=Y%C4%B1ld%C4%B1z+Posta+Caddesi+Gayrettepe+Be%C5%9Fikta%C5%9F+%C4%B0stanbul&output=embed",
      mapsLink: "https://maps.google.com/?q=Yıldız+Posta+Caddesi+Gayrettepe+Beşiktaş+İstanbul",
      social: [
        { label: "Instagram", handle: "@beergaritapub", href: "#" },
        { label: "Facebook", handle: "The Beergarita Pub", href: "#" },
        { label: "X", handle: "@beergarita", href: "#" }
      ]
    },

    // Menü kategorileri + öne çıkan kalemler (fiyatlı)
    menu: [
      {
        id: "ficibira", name: "Fıçı Biralar", kicker: "Taze, soğuk, bol köpüklü",
        img: "beerPour",
        items: [
          { n: "Beergarita Pale Ale", d: "Ev usulü, narenci notalı amber ale", p: "₺145", popupImg: "assets/menu_beer.png" },
          { n: "London Porter", d: "Kavrulmuş malt, kahve & kakao", p: "₺160" },
          { n: "Klasik Pilsner", d: "Çek tarzı, berrak ve ferah", p: "₺130" },
          { n: "Mevsim Fıçısı", d: "Haftanın değişen seçkisi — barmene sor", p: "₺150" }
        ]
      },
      {
        id: "sisebira", name: "Şişe Biralar", kicker: "Yerli & ithal seçki",
        img: "bottlesSun",
        items: [
          { n: "IPA — Double Dry Hopped", d: "Yoğun şerbetçiotu, tropik aroma", p: "₺170" },
          { n: "Belçika Witbier", d: "Kişniş & portakal kabuğu", p: "₺165" },
          { n: "Stout 0.0", d: "Alkolsüz, kremamsı gövde", p: "₺120" }
        ]
      },
      {
        id: "burger", name: "Burgerler", kicker: "Pub'ın imzası",
        img: "burger",
        items: [
          { n: "The Beergarita Burger", d: "180gr dana, cheddar, karamelize soğan, ev sosu", p: "₺285", popupImg: "assets/menu_burger.png" },
          { n: "Smash & Bacon", d: "Çift smash köfte, dana bacon, turşu", p: "₺310" },
          { n: "Mantarlı Truffle", d: "İzgara mantar, gruyère, trüf mayonez", p: "₺295" },
          { n: "Sebze Burger", d: "Nohut & pancar köftesi, avokado", p: "₺255" }
        ]
      },
      {
        id: "baslangic", name: "Başlangıçlar", kicker: "Paylaşmak için",
        img: "feast",
        items: [
          { n: "Tavuk Kanat (8 adet)", d: "Buffalo ya da bal-hardal", p: "₺195" },
          { n: "Nachos Supreme", d: "Cheddar sos, jalapeño, guacamole", p: "₺175" },
          { n: "Soğan Halkası & Dip", d: "Çıtır panko, sarımsaklı sos", p: "₺135" }
        ]
      },
      {
        id: "anayemek", name: "Ana Yemekler", kicker: "Doyurucu klasikler",
        img: "steakFries",
        items: [
          { n: "Fish & Chips", d: "Bira hamurunda mezgit, ev patatesi, ezme bezelye", p: "₺320", popupImg: "assets/menu_fish.png" },
          { n: "Bonfile & Frites", d: "200gr ızgara bonfile, kekikli tereyağı", p: "₺520" },
          { n: "Bangers & Mash", d: "Izgara sosis, patates püresi, soğan sosu", p: "₺265" }
        ]
      },
      {
        id: "kokteyl", name: "Kokteyller", kicker: "Barmen seçkisi",
        img: "cocktails",
        items: [
          { n: "Beergarita", d: "İmza kokteyl — tekila, lime, fıçı bira tacı", p: "₺230" },
          { n: "Old Fashioned", d: "Bourbon, akçaağaç, portakal", p: "₺240" },
          { n: "Espresso Martini", d: "Votka, taze espresso, kahve likörü", p: "₺225" },
          { n: "Cuba Libre", d: "Esmer rom, kola, taze lime", p: "₺195" }
        ]
      },
      {
        id: "sarap", name: "Şaraplar", kicker: "Kadeh & şişe",
        img: "wineCheese",
        items: [
          { n: "Ev Şarabı (kadeh)", d: "Kırmızı / beyaz / roze", p: "₺120" },
          { n: "Öküzgözü – Boğazkere", d: "Yerli, orta gövdeli kırmızı", p: "₺680 / şişe" },
          { n: "Sauvignon Blanc", d: "Ferah, narenci ve çimen notaları", p: "₺720 / şişe" }
        ]
      },
      {
        id: "viski", name: "Viski / İçkiler",
        kicker: "Tek & duble",
        img: "whiskey",
        items: [
          { n: "Single Malt 12y", d: "İskoç, hafif islı, balsı bitiş", p: "₺280" },
          { n: "Bourbon", d: "Vanilya & meşe", p: "₺210" },
          { n: "Gin & Tonic", d: "Botanik gin, premium tonik, biberiye", p: "₺200" }
        ]
      }
    ],

    events: [
      { day: "PER", date: "12 Haz", time: "21:00", title: "Canlı Müzik: The Camden Trio",
        desc: "Akustik blues & soul. Giriş ücretsiz, masa için rezervasyon önerilir." },
      { day: "CUM", date: "13 Haz", time: "22:30", title: "Premier Lig Finali — Dev Ekran",
        desc: "Maç yayını, fıçı bira kampanyası ve taraftar atmosferi." },
      { day: "SAL", date: "17 Haz", time: "20:00", title: "Trivia Gecesi (Bilgi Yarışması)",
        desc: "Takımını kur, kazanan masaya fıçı ikramı. 5 kişiye kadar masalar." },
      { day: "CMT", date: "21 Haz", time: "23:00", title: "DJ Set: Vinyl Night",
        desc: "70'ler–90'lar plak seçkisi. Gece geç saatlere kadar." }
    ],

    reviews: [
      { n: "Deniz A.", s: 5, t: "Gayrettepe'nin gerçek bir Londra köşesi. Fıçı bira taptaze, burgerler bambaşka. Akşamları atmosfer harika." },
      { n: "Mert K.", s: 5, t: "Maç akşamları buradayız. Fiyatlar gayet uygun, ekip çok samimi. Kendini evinde hissediyorsun." },
      { n: "Selin Y.", s: 4, t: "Beergarita kokteyli denenmeli. Müzik geceleri biraz kalabalık ama o da ayrı keyif." },
      { n: "Can T.", s: 5, t: "Trivia gecesine taktık kendimizi. Mahallenin en sıcak mekânı oldu bizim için." }
    ],

    gallery: ["barLights", "people", "beerPour", "steakFries", "barEdison",
              "cocktails", "barWide", "burger", "facade"]
  };
})();
