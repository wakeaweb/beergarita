# The Beergarita Pub — Backend + Admin Build Prompt

Bu, araçtan bağımsız bir teknik şartnamedir (Claude Code, Antigravity vb.
herhangi bir agentic kodlama aracında kullanılabilir). AMAÇ: mevcut GitHub
Pages sitesini bozmadan, ona dinamik içerik ve bir admin paneli sağlayan bir
backend kurmak.

> MİMARİ KARARI: HİBRİT YAKLAŞIM
> - Public site (client) ZATEN VAR ve GitHub Pages'te yayında kalır
>   (wakeaweb/Beergarita, CDN-React prototip). Bunu container'a ALMIYORUZ.
> - Sadece VPS'te bir BACKEND + ADMIN PANELİ kuruyoruz.
> - Public site, şu an `data.js` içindeki sabit veriyi okuyor; bunu backend
>   API'sinden (GET /api/v1/...) okuyacak şekilde güncelleyeceğiz.
> - Backend yapısı, mevcut "TradeOps" projesinin kalıbını izler (Docker
>   Compose, postgres:16-alpine + healthcheck, /api/v1 versiyonlama,
>   reverse-proxy nginx + certbot iki-fazlı SSL, adminer).

---

## 0. ÖN KOŞUL / ÇALIŞMA YÖNTEMİ (önce bunu oku)

**Workspace'e şu referans dosyalarını ekle** (bu şartname bunlara atıf yapar):
- TradeOps projesinin `docker-compose.yml` ve nginx config dosyaları
  (`nginx-init.conf`, `nginx.conf`, host-level nginx) — backend kalıbı bunları izler.
- Mevcut Beergarita sitesinin `data.js` dosyası — seed verisi ve içerik
  modeli buradan gelir (repo: wakeaweb/Beergarita).

**Çalışma yöntemi:**
- Bölüm 10'daki YAPIM SIRASINI izle; her aşamayı çalışır halde bitirip sonraki
  aşamaya geç. Tek seferde her şeyi yazmaya çalışma.
- GİZLİ BİLGİLERİ (DB şifresi, JWT_SECRET, API anahtarı) prompt'a YAZMA.
  Yalnızca `.env.example` placeholder'ları kullan; gerçek değerler sunucudaki
  `.env` dosyasına elle girilir.

---

## 1. MEKÂN BİLGİLERİ (başlangıç verisi / seed)
- İsim: The Beergarita Pub  ·  Konsept: "London Pub Eatery — Semt Kültürü Kazanacak"
- Adres: Gayrettepe, Yıldız Posta Cd. Yıldız Residence, 34349 Beşiktaş/İstanbul
- Telefon: 0212 213 40 46  (tel:+902122134046, WhatsApp: wa.me/902122134046)
- Koordinatlar: 41.0662006, 29.0063928
- Çalışma saatleri: Pzt–Cmt 12:00–02:00 · Pazar 15:00–02:00
- Marka vurgu rengi: #c99b4e

Mevcut sitedeki `data.js` içeriği (menü kalemleri, etkinlikler, yorumlar,
galeri görselleri) seed verisi olarak kullanılabilir — yapı zaten uyumlu.

---

## 2. TEKNOLOJİ YIĞINI (TradeOps kalıbı, ücretsiz)
- Backend (server): Node.js + Fastify, REST API, iç port 3000.
- Veritabanı (db): PostgreSQL 16-alpine, healthcheck, named volume.
- Admin paneli: VPS'te backend tarafından serve edilen küçük bir SPA
  (React + Vite), `/admin` altında. (Public site Pages'te olduğu için admin
  YERİNE VPS'te durur — yazma işlemleri ve auth burada.)
- DB yönetim arayüzü: adminer (port 8083).
- Reverse proxy: nginx — SSL (Let's Encrypt/certbot) + routing.
- Auth: JWT; şifreler bcrypt ile hash'lenir.
- Çalıştırma: Docker Compose (db + server + adminer). Client container YOK.

### Servis / port haritası
- db: postgres:16-alpine, volume postgres_data, healthcheck (pg_isready)
- server: ./server build, env_file .env, NODE_ENV=production, iç 3000 → dış 3001,
  uploads volume `/app/uploads`, db healthy bekler
- adminer: dış 8083

### Repo yapısı
```
beergarita-backend/
├── docker-compose.yml
├── .env.example
├── README.md
├── nginx/
│   ├── nginx-init.conf       # HTTP-only, ilk deploy + certbot challenge
│   ├── nginx.conf            # tam HTTPS + redirect + güvenlik başlıkları
│   └── beergarita-nginx.conf # host-level varyant (127.0.0.1:3001)
└── server/
    ├── src/
    │   ├── routes/           # public (/api/v1) + admin (/api/v1/admin)
    │   ├── db/               # şema + migration + seed
    │   ├── admin-ui/         # küçük React+Vite admin SPA (build -> static)
    │   └── server.js
    ├── uploads/              # yüklenen görseller (volume)
    └── Dockerfile
```

---

## 3. VERİTABANI ŞEMASI (PostgreSQL)

### Mekân bilgisi
- `venue` (tek satır): id, title, address, phone, phone_href, whatsapp,
  maps_embed, maps_link, lat, lng, updated_at
- `venue_hours` (tekrarlanabilir): id, label, hours, sort_order
  (örn. label="Pazartesi – Cumartesi", hours="12:00 – 02:00")
- `venue_social` (tekrarlanabilir): id, title, url, sort_order

### Menü (üç katman: Kategori → Ürün → Opsiyon)
- `menu_categories`: id, is_active, title, photo_url, sort_order
- `menu_products`: id, category_id FK, is_active, title, photo_url,
  description, sort_order
- `menu_options`: id, product_id FK, is_active, size, price, sort_order
  > Fiyat HER ZAMAN opsiyonda durur. Ürünün doğrudan fiyatı yoktur.
  > Tek fiyatlı ürün = tek opsiyon (size boş, sadece price).
  > Çok opsiyonlu ürün = opsiyonlar açıklamanın ALTINA alt alta, fiyatlarıyla.

### Etkinlikler
- `events`: id, is_active, event_datetime (timestamp: tarih & saat),
  title, description, created_at
  > GÖRÜNÜRLÜK KURALI: etkinlik kendi günü boyunca görünür, ERTESİ GÜN
  > otomatik pasif olur. Public sorgu: is_active = true AND
  > event_datetime::date >= CURRENT_DATE. (Manuel on/off de mevcut.)

### Galeri
- `gallery_images`: id, photo_url (ZORUNLU), title (ops.), description (ops.),
  sort_order, created_at
  > Title/description tanımlıysa, görselin detay (lightbox) görünümünde gösterilir.

### Yorumlar (1. aşamada ELLE girilir)
- `reviews`: id, author, rating (1-5 yıldız), text (description), sort_order,
  created_at
- `reviews_summary` (tek satır, ELLE girilir): id, average_rating, total_count,
  google_link_label (vars. "Google Yorumlar"), google_link_url, updated_at
  > Ortalama puan ve toplam sayı OTOMATİK HESAPLANMAZ — Google Maps'teki
  > değerler admin'den ELLE girilir.
  > google_link_url seed değeri: https://tinyurl.com/yktn4hy4
  > (İleride Google API senkronu eklenmek istenirse faz 2; şimdilik kapsam dışı.)

### Admin
- `admin_users`: id, username, password_hash, created_at

Migration + seed scriptleri olsun. Seed, mevcut `data.js` içeriğini kullanır.
Bir admin kullanıcı .env'den (ADMIN_USERNAME / ADMIN_PASSWORD).

---

## 4. PUBLIC API (auth yok, salt okuma) — /api/v1
- `GET /api/v1/venue`   → venue + hours + social
- `GET /api/v1/menu`    → aktif kategoriler → aktif ürünler → aktif opsiyonlar (iç içe)
- `GET /api/v1/events`  → is_active AND tarihi >= bugün, zamana göre sıralı
- `GET /api/v1/gallery` → görseller (sort_order)
- `GET /api/v1/reviews` → yorum listesi + ELLE girilen özet
  { average, count, google_link_label, google_link_url }

Tüm görsel URL'leri TAM ADRES döner (https://API_HOST/uploads/...), çünkü
public site farklı origin'de (GitHub Pages).

## 5. ADMIN API (JWT korumalı) — /api/v1/admin
- `POST /api/v1/admin/login` → JWT
- Mekân:   `GET/PUT /admin/venue`, `POST/PUT/DELETE /admin/venue/hours`,
           `POST/PUT/DELETE /admin/venue/social`
- Menü:    kategori / ürün / opsiyon için `POST/PUT/DELETE`
           (`/admin/menu/categories`, `/menu/products`, `/menu/options`)
- Etkinlik:`POST/PUT/DELETE /admin/events`
- Galeri:  `POST/PUT/DELETE /admin/gallery` (görsel yükleme dahil)
- Yorum:   `POST/PUT/DELETE /admin/reviews`
- Görsel yükleme endpoint'i tam URL döner. Tüm admin route'ları JWT middleware.

---

## 6. ADMIN PANELİ (VPS'te, /admin)
Korumalı küçük SPA. `/admin/login` ile giriş, JWT (httpOnly cookie tercih).
Yönetim ekranları, alanlar BİREBİR şöyle:

- **Mekân Info:** Title, Adres, Telefon, Çalışma Saatleri (tekrarlanabilir
  satırlar: etiket + saat), Social (tekrarlanabilir: Title + URL).
- **Menü:**
  - Kategori: on/off, title, photo
  - Ürün: on/off, title, photo, description
  - Ürün Opsiyon: on/off, Size, Price
- **Etkinlikler:** on/off, date & time, title, description
  (tarih & saat AYRI/birleşik seçici — serbest metin değil).
- **Galeri:** Title, Description, Photo (Photo zorunlu).
- **Yorumlar:**
  - Yorum kayıtları: Rating (yıldız), Description, Author.
  - Özet (elle): Ortalama Puan, Toplam Yorum Sayısı (Google Maps'ten girilir).
  - Google linki: Etiket ("Google Yorumlar") + URL (vars. https://tinyurl.com/yktn4hy4).

Basit, işlevsel; sürükle-sırala (sort_order) iyi olur ama şart değil.

---

## 7. NGINX & DEPLOYMENT (TradeOps kalıbı)
- nginx üç config (TradeOps'taki gibi):
  - `nginx-init.conf`: sadece HTTP (80). Certbot challenge + proxy:
    `/api/v1/` → server:3000, `/uploads/` → server:3000, `/admin` → server:3000.
  - `nginx.conf`: 80→443 redirect; 443 SSL; güvenlik başlıkları (HSTS,
    X-Frame-Options, X-Content-Type-Options); aynı proxy.
  - `beergarita-nginx.conf`: host-level varyant (127.0.0.1:3001).
- `client_max_body_size 20M;` (görsel yükleme).
- CORS: GET API'leri public site origin'lerine açık olmalı:
  https://wakeaweb.github.io VE bağlı özel domain (örn. beergarita.com.tr).
- `docker-compose.yml`: db + server + adminer (client YOK). postgres_data +
  uploads named volume'lar kalıcı. server, db healthy bekler.
- `.env.example`: POSTGRES_USER/PASSWORD/DB, DATABASE_URL, JWT_SECRET,
  ADMIN_USERNAME/PASSWORD, CORS_ORIGINS, API_HOST (görsel tam URL'i için),
  DOMAIN.
- README: yerel kurulum, docker compose up, migration/seed, certbot
  (init→full geçiş), public siteyi API'ye bağlama notu.

---

## 8. PUBLIC SİTE ENTEGRASYONU (mevcut GitHub Pages prototipi)
Mevcut `data.js` global `window.PUB` nesnesini dolduruyor. Bunu, sayfa
açılışında backend'den çekecek şekilde değiştir:
- `data.js` → açılışta `GET /api/v1/{venue,menu,events,gallery,reviews}`
  çağırır, gelen veriyi `window.PUB` formatına eşler, sonra render eder.
- API erişilemezse mevcut sabit veri (fallback) ile render et — site asla boş kalmasın.
- Menü render'ı yeni yapıya uyacak: ürün açıklamasının altında opsiyonlar
  (size + price) alt alta.
- Yorumlar bölümü: üstte elle girilen ortalama puan + toplam sayı; yorum
  listesinin ALTINA "Google Yorumlar" linki (reviews API'sinden gelen
  google_link_url'e yönlenir).
- Mevcut bileşenler (Header, Hero, Menu, Events, Gallery, Reviews, Contact)
  korunur; yalnızca veri kaynağı değişir.

---

## 9. GÜVENLİK & SAĞLIK
- bcrypt ile şifre hash; düz metin yok. JWT_SECRET .env'den; .env .gitignore'da.
- Admin route'ları auth middleware olmadan açık kalmaz.
- Tüm POST/PUT'larda schema validation.
- adminer prod'da IP-kısıtlı ya da kapalı olabilir.

## 10. YAPIM SIRASI
1. Repo iskeleti + docker-compose (db + server + adminer) ayağa kalksın.
2. DB şeması + migration + seed (data.js içeriğiyle).
3. Public API (/api/v1: venue/menu/events/gallery/reviews) + test.
4. Admin auth + admin paneli (yukarıdaki alanlarla) + görsel yükleme.
5. nginx (init+full+host) + certbot SSL + README.
6. Public siteyi (GitHub Pages) API'ye bağla (data.js güncellemesi).

Her aşamada çalışır halde tut.
