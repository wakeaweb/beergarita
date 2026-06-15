const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://beergarita:beergaritapass@localhost:5432/beergarita'
};

const createTablesQuery = `
  -- Admin Users
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Venue Info
  CREATE TABLE IF NOT EXISTS venue (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    phone_href VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    maps_embed TEXT NOT NULL,
    maps_link TEXT NOT NULL,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Venue Working Hours
  CREATE TABLE IF NOT EXISTS venue_hours (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    hours VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  );

  -- Venue Social Media Links
  CREATE TABLE IF NOT EXISTS venue_social (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  );

  -- Menu Categories
  CREATE TABLE IF NOT EXISTS menu_categories (
    id VARCHAR(100) PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE,
    title VARCHAR(255) NOT NULL,
    kicker VARCHAR(255),
    photo_url TEXT,
    sort_order INT NOT NULL DEFAULT 0
  );

  -- Menu Products
  CREATE TABLE IF NOT EXISTS menu_products (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) REFERENCES menu_categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    title VARCHAR(255) NOT NULL,
    photo_url TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0
  );

  -- Menu Options (Fiyat her zaman buradadır)
  CREATE TABLE IF NOT EXISTS menu_options (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES menu_products(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    size VARCHAR(100) DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  );

  -- Events
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE,
    event_datetime TIMESTAMP NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Gallery Images
  CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    photo_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Review Records (Yorumlar)
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Reviews Summary (Elle girilen Google puan özeti)
  CREATE TABLE IF NOT EXISTS reviews_summary (
    id SERIAL PRIMARY KEY,
    average_rating DECIMAL(3,2) NOT NULL,
    total_count INT NOT NULL,
    google_link_label VARCHAR(100) DEFAULT 'Google Yorumlar',
    google_link_url TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedData = async (client) => {
  console.log('Seeding data...');

  // 1. Seed Admin User
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'adminpass';
  const passwordHash = await bcrypt.hash(adminPass, 10);
  await client.query(
    'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
    [adminUser, passwordHash]
  );

  // 2. Seed Venue
  await client.query('DELETE FROM venue');
  await client.query(`
    INSERT INTO venue (title, address, phone, phone_href, whatsapp, maps_embed, maps_link, lat, lng)
    VALUES (
      'The Beergarita Pub',
      'Gayrettepe, Yıldız Posta Cd. Yıldız Residence,\n34349 Beşiktaş / İstanbul',
      '0212 213 40 46',
      'tel:+902122134046',
      'wa.me/902122134046',
      'https://www.google.com/maps?q=Y%C4%B1ld%C4%B1z+Posta+Caddesi+Gayrettepe+Be%C5%9Fikta%C5%9F+%C4%B0stanbul&output=embed',
      'https://maps.google.com/?q=Yıldız+Posta+Caddesi+Gayrettepe+Beşiktaş+İstanbul',
      41.0662006,
      29.0063928
    )
  `);

  // 3. Seed Venue Hours
  await client.query('DELETE FROM venue_hours');
  await client.query(`
    INSERT INTO venue_hours (label, hours, sort_order) VALUES
    ('Pazartesi – Cumartesi', '12:00 – 02:00', 0),
    ('Pazar', '15:00 – 02:00', 1)
  `);

  // 4. Seed Venue Socials
  await client.query('DELETE FROM venue_social');
  await client.query(`
    INSERT INTO venue_social (title, url, sort_order) VALUES
    ('Instagram', '#', 0),
    ('Facebook', '#', 1),
    ('X', '#', 2)
  `);

  // Helpers for Unsplash images
  const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;
  const images = {
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
  };

  // 5. Seed Menu
  await client.query('DELETE FROM menu_options');
  await client.query('DELETE FROM menu_products');
  await client.query('DELETE FROM menu_categories');

  const menuData = [
    {
      id: "ficibira", name: "Fıçı Biralar", kicker: "Taze, soğuk, bol köpüklü",
      img: images.beerPour,
      items: [
        { n: "Beergarita Pale Ale", d: "Ev usulü, narenci notalı amber ale", p: 145, popupImg: "assets/menu_beer.png" },
        { n: "London Porter", d: "Kavrulmuş malt, kahve & kakao", p: 160 },
        { n: "Klasik Pilsner", d: "Çek tarzı, berrak ve ferah", p: 130 },
        { n: "Mevsim Fıçısı", d: "Haftanın değişen seçkisi — barmene sor", p: 150 }
      ]
    },
    {
      id: "sisebira", name: "Şişe Biralar", kicker: "Yerli & ithal seçki",
      img: images.bottlesSun,
      items: [
        { n: "IPA — Double Dry Hopped", d: "Yoğun şerbetçiotu, tropik aroma", p: 170 },
        { n: "Belçika Witbier", d: "Kişniş & portakal kabuğu", p: 165 },
        { n: "Stout 0.0", d: "Alkolsüz, kremamsı gövde", p: 120 }
      ]
    },
    {
      id: "burger", name: "Burgerler", kicker: "Pub'ın imzası",
      img: images.burger,
      items: [
        { n: "The Beergarita Burger", d: "180gr dana, cheddar, karamelize soğan, ev sosu", p: 285, popupImg: "assets/menu_burger.png" },
        { n: "Smash & Bacon", d: "Çift smash köfte, dana bacon, turşu", p: 310 },
        { n: "Mantarlı Truffle", d: "İzgara mantar, gruyère, trüf mayonez", p: 295 },
        { n: "Sebze Burger", d: "Nohut & pancar köftesi, avokado", p: 255 }
      ]
    },
    {
      id: "baslangic", name: "Başlangıçlar", kicker: "Paylaşmak için",
      img: images.feast,
      items: [
        { n: "Tavuk Kanat (8 adet)", d: "Buffalo ya da bal-hardal", p: 195 },
        { n: "Nachos Supreme", d: "Cheddar sos, jalapeño, guacamole", p: 175 },
        { n: "Soğan Halkası & Dip", d: "Çıtır panko, sarımsaklı sos", p: 135 }
      ]
    },
    {
      id: "anayemek", name: "Ana Yemekler", kicker: "Doyurucu klasikler",
      img: images.steakFries,
      items: [
        { n: "Fish & Chips", d: "Bira hamurunda mezgit, ev patatesi, ezme bezelye", p: 320, popupImg: "assets/menu_fish.png" },
        { n: "Bonfile & Frites", d: "200gr ızgara bonfile, kekikli tereyağı", p: 520 },
        { n: "Bangers & Mash", d: "Izgara sosis, patates püresi, soğan sosu", p: 265 }
      ]
    },
    {
      id: "kokteyl", name: "Kokteyller", kicker: "Barmen seçkisi",
      img: images.cocktails,
      items: [
        { n: "Beergarita", d: "İmza kokteyl — tekila, lime, fıçı bira tacı", p: 230 },
        { n: "Old Fashioned", d: "Bourbon, akçaağaç, portakal", p: 240 },
        { n: "Espresso Martini", d: "Votka, taze espresso, kahve likörü", p: 225 },
        { n: "Cuba Libre", d: "Esmer rom, kola, taze lime", p: 195 }
      ]
    },
    {
      id: "sarap", name: "Şaraplar", kicker: "Kadeh & şişe",
      img: images.wineCheese,
      items: [
        { n: "Ev Şarabı (kadeh)", d: "Kırmızı / beyaz / roze", p: 120 },
        { n: "Öküzgözü – Boğazkere", d: "Yerli, orta gövdeli kırmızı", p: 680, sz: "Şişe" },
        { n: "Sauvignon Blanc", d: "Ferah, narenci ve çimen notaları", p: 720, sz: "Şişe" }
      ]
    },
    {
      id: "viski", name: "Viski / İçkiler", kicker: "Tek & duble",
      img: images.whiskey,
      items: [
        { n: "Single Malt 12y", d: "İskoç, hafif islı, balsı bitiş", p: 280 },
        { n: "Bourbon", d: "Vanilya & meşe", p: 210 },
        { n: "Gin & Tonic", d: "Botanik gin, premium tonik, biberiye", p: 200 }
      ]
    }
  ];

  for (let cIdx = 0; cIdx < menuData.length; cIdx++) {
    const cat = menuData[cIdx];
    await client.query(
      'INSERT INTO menu_categories (id, title, kicker, photo_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
      [cat.id, cat.name, cat.kicker, cat.img, cIdx]
    );

    for (let pIdx = 0; pIdx < cat.items.length; pIdx++) {
      const prod = cat.items[pIdx];
      const result = await client.query(
        'INSERT INTO menu_products (category_id, title, photo_url, description, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [cat.id, prod.n, prod.popupImg || null, prod.d, pIdx]
      );
      const productId = result.rows[0].id;

      await client.query(
        'INSERT INTO menu_options (product_id, size, price, sort_order) VALUES ($1, $2, $3, $4)',
        [productId, prod.sz || '', prod.p, 0]
      );
    }
  }

  // 6. Seed Events
  await client.query('DELETE FROM events');
  const eventsData = [
    { dt: '2026-06-12 21:00:00', t: 'Canlı Müzik: The Camden Trio', d: 'Akustik blues & soul. Giriş ücretsiz, masa için rezervasyon önerilir.' },
    { dt: '2026-06-13 22:30:00', t: 'Premier Lig Finali — Dev Ekran', d: 'Maç yayını, fıçı bira kampanyası ve taraftar atmosferi.' },
    { dt: '2026-06-17 20:00:00', t: 'Trivia Gecesi (Bilgi Yarışması)', d: 'Takımını kur, kazanan masaya fıçı ikramı. 5 kişiye kadar masalar.' },
    { dt: '2026-06-21 23:00:00', t: 'DJ Set: Vinyl Night', d: '70\'ler–90\'ler plak seçkisi. Gece geç saatlere kadar.' }
  ];

  for (let e of eventsData) {
    await client.query(
      'INSERT INTO events (event_datetime, title, description) VALUES ($1, $2, $3)',
      [e.dt, e.t, e.d]
    );
  }

  // 7. Seed Gallery
  await client.query('DELETE FROM gallery_images');
  const galleryList = ["barLights", "people", "beerPour", "steakFries", "barEdison", "cocktails", "barWide", "burger", "facade"];
  for (let gIdx = 0; gIdx < galleryList.length; gIdx++) {
    const key = galleryList[gIdx];
    await client.query(
      'INSERT INTO gallery_images (photo_url, sort_order) VALUES ($1, $2)',
      [images[key], gIdx]
    );
  }

  // 8. Seed Reviews
  await client.query('DELETE FROM reviews');
  const reviewsData = [
    { n: "Deniz A.", s: 5, t: "Gayrettepe'nin gerçek bir Londra köşesi. Fıçı bira taptaze, burgerler bambaşka. Akşamları atmosfer harika." },
    { n: "Mert K.", s: 5, t: "Maç akşamları buradayız. Fiyatlar gayet uygun, ekip çok samimi. Kendini evinde hissediyorsun." },
    { n: "Selin Y.", s: 4, t: "Beergarita kokteyli denenmeli. Müzik geceleri biraz kalabalık ama o da ayrı keyif." },
    { n: "Can T.", s: 5, t: "Trivia gecesine taktık kendimizi. Mahallenin en sıcak mekânı oldu bizim için." }
  ];

  for (let rIdx = 0; rIdx < reviewsData.length; rIdx++) {
    const r = reviewsData[rIdx];
    await client.query(
      'INSERT INTO reviews (author, rating, text, sort_order) VALUES ($1, $2, $3, $4)',
      [r.n, r.s, r.t, rIdx]
    );
  }

  // 9. Seed Reviews Summary
  await client.query('DELETE FROM reviews_summary');
  await client.query(`
    INSERT INTO reviews_summary (average_rating, total_count, google_link_label, google_link_url)
    VALUES (4.8, 124, 'Google Yorumlar', 'https://tinyurl.com/yktn4hy4')
  `);

  console.log('Seeding complete!');
};

const runInit = async () => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to database successfully. Initializing tables...');
    await client.query(createTablesQuery);
    console.log('Tables created successfully.');
    await seedData(client);
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await client.end();
  }
};

if (require.main === module) {
  runInit();
}

module.exports = { runInit };
