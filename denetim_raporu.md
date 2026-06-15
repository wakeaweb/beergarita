# Beergarita Backend — Denetim Raporu

Şartname: [beergarita-kodlama-prompt.md](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/project/referans/beergarita-kodlama-prompt.md)
Denetim talimatları: [beergarita-denetim-prompt.md](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/project/referans/beergarita-denetim-prompt.md)

---

## EKSİKLER / SAPMALAR LİSTESİ

| # | Bölüm | Şartnamede İstenen | Kodda Durum | Önem |
|---|-------|--------------------|-------------|------|
| 1 | Public site — Menü Opsiyonları Render | Çok opsiyonlu ürün = opsiyonlar, ürün açıklamasının **ALTINA alt alta fiyatlarıyla** gösterilir | [parts1.jsx:167-176](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/project/parts1.jsx#L167-L176): Sadece `it.p` (tek fiyat stringi) render ediliyor. API `options` dizisini dönüyor ama frontend bu diziyi tamamen **yok sayıyor**. | **KRİTİK** |
| 2 | Public site — Yorumlar Özeti + Google Linki | Üstte elle girilen ortalama puan + toplam sayı; listenin **ALTINA** "Google Yorumlar" linki | [parts2.jsx:91-111](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/project/parts2.jsx#L91-L111): Reviews bileşeni **ne** ortalama puan/sayı gösteriyor **ne de** Google linki. `PUB.reviewsSummary` hiç kullanılmıyor. | **KRİTİK** |
| 3 | Güvenlik — Schema Validation | Tüm POST/PUT'larda girdi doğrulama (schema validation) olmalı | [admin.js](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/admin.js): Hiçbir route'ta Fastify JSON schema tanımı yok. `request.body` doğrudan kullanılıyor, tip/zorunluluk kontrolü yok. | **ORTA** |
| 4 | Admin Panel — Galeri CRUD bozuk | Admin panelden galeri görseli ekleyip silebilmeli | [App.jsx:114-117](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L114-L117): Gallery tab'ı verileri **public** route'tan (`/api/v1/gallery`) çekiyor → sadece URL string dizisi dönüyor, DB `id`'leri yok. [App.jsx:425-430](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L425-L430): `deleteGalleryImage` fonksiyonu **no-op** — gerçek silme yapmıyor. Admin'de ayrı GET `/admin/gallery` route'u da yok. | **ORTA** |
| 5 | Admin Panel — Yorumlar veri eşleme bozuk | Admin panelde yorum düzenleyip silebilmeli | [App.jsx:118-129](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L118-L129): Reviews tab'ı da **public** route'tan çekiyor → `n`, `s`, `t` key'leri alıyor. Ama edit/delete `rev.id` kullanıyor ve public API'de `id` alanı **dönmüyor**. Sonuç: düzenleme ve silme çalışmaz. | **ORTA** |
| 6 | Admin Panel — Galeri title/description alanları | Gallery form'da title (opsiyonel) ve description (opsiyonel) alanları olmalı | [App.jsx:1452-1494](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L1452-L1494): `GalleryForm` sadece photo ve sort_order içeriyor. Title ve description input'ları **eksik**. | **KÜÇÜK** |
| 7 | .env.example — DOMAIN değişkeni | `.env.example`'da `DOMAIN` placeholder'ı olmalı | [.env.example](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/.env.example): `DOMAIN` satırı yok. | **KÜÇÜK** |
| 8 | Güvenlik — JWT_SECRET fallback | JWT_SECRET yalnızca .env'den gelmeli | [admin.js:19](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/admin.js#L19) ve [admin.js:49](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/admin.js#L49): Hardcoded fallback `'supersecretjwtkeybeergaritapub2026'` var. `.env` yoksa bu sabit anahtar kullanılır — güvenlik riski. | **KÜÇÜK** |
| 9 | CORS — www alt alanı | `https://www.beergarita.com.tr` de izinli origin olmalı | [.env.example:18](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/.env.example#L18): `www.beergarita.com.tr` CORS listesinde **yok**. | **KÜÇÜK** |

---

## DOĞRULANAN (SORUNSUZ) NOKTALAR

| Kontrol | Durum |
|---------|-------|
| **1. API Host Ayrımı** — nginx `server_name`, certbot, `data.js` API_HOST, CORS origins tutarlı | ✅ Tümü `api.beergarita.com.tr` |
| **3. Etkinlik ertesi gün otomatik pasif** — Public events sorgusu | ✅ `is_active = true AND event_datetime::date >= CURRENT_DATE` ([public.js:144-147](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/public.js#L144-L147)) |
| **5. Görsel URL'leri tam adres** — Upload ve API yanıtları | ✅ `formatPhotoUrl` API_HOST'u prepend ediyor ([public.js:4-13](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/public.js#L4-L13)) |
| **6. Admin SPA Vite base yolu** | ✅ `base: '/admin/'` ([vite.config.js:7](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/vite.config.js#L7)) |
| **8. Veri modeli tamlığı** — Tüm 11 tablo mevcut | ✅ venue, venue_hours, venue_social, menu_categories, menu_products, menu_options, events, gallery_images, reviews, reviews_summary, admin_users ([init.js](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/db/init.js)) |
| **Menü DB yapısı** — Fiyat opsiyonda, ürünün doğrudan fiyatı yok | ✅ DB ve seed doğru |
| **bcrypt şifre hash** | ✅ Seed ve login'de kullanılıyor |
| **.env .gitignore'da** | ✅ |
| **JWT middleware** — Tüm admin route'ları korumalı | ✅ `authorizedRoutes.addHook('preHandler', authMiddleware)` |
| **Admin panel — Etkinlik datetime picker** | ✅ `type="datetime-local"` kullanılıyor ([App.jsx:1411](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L1411)) |
| **Admin panel — Yorum Özeti (ELLE) form** | ✅ Ortalama puan, toplam sayı, Google link label/url alanları mevcut ve `saveReviewsSummary` fonksiyonu çalışıyor ([App.jsx:432-448](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/src/App.jsx#L432-L448)) |
| **Nginx 3 config dosyası** | ✅ nginx-init.conf, nginx.conf, beergarita-nginx.conf — tümü tutarlı |
| **Docker Compose** — db + server + adminer, volume, healthcheck | ✅ |
| **data.js API entegrasyonu + fallback** | ✅ API erişilemezse statik veri kullanılıyor |

---

> [!IMPORTANT]
> Bu rapordaki 9 maddeyi inceleyip onaylayınız. Onay verdikten sonra, onaylanan maddeleri mevcut çalışan kodu bozmadan, minimum değişiklikle düzelteceğim.
