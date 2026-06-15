
## Talimat

Bu repodaki kodu, ekteki şartnameye (`beergarita-kodlama-prompt.md`) göre
denetlemeni istiyorum. Kodu başka bir vibe-coding platformunda ürettirdim;
senden onu **sıfırdan yazmanı değil, DENETLEMENİ** istiyorum.

Şu sırayla ilerle:

1. **ÖNCE DENETLE, KOD YAZMA.** Şartnamenin her bölümünü (DB şeması, public
   API, admin API, admin paneli alanları, nginx, güvenlik) repodaki gerçek
   kodla karşılaştır.

2. **BİR "EKSİKLER / SAPMALAR" LİSTESİ çıkar.** Her madde için:
   - Şartnamede ne isteniyordu,
   - Kodda ne var (ya da yok),
   - Önem derecesi (kritik / orta / küçük).

3. **Listeyi bana göster ve ONAYIMI BEKLE.** Onaylamadan kodu değiştirme.

4. Onayladığım maddeleri, **mevcut çalışan kodu bozmadan, minimum değişiklikle**
   düzelt. Çalışan kısımları gereksiz yere yeniden yazma.

---

## Özellikle kontrol edilecek kritik noktalar

Aşağıdakiler şartnamenin can alıcı detayları; üst düzey planlarda kolayca
atlanırlar. Her birini repo kodunda tek tek doğrula:

### 1. API HOST AYRIMI (en kritik)
- Public site `beergarita.com.tr` → **GitHub Pages**. API ORAYA KONULAMAZ.
- Backend/API + `/admin` ayrı bir hostta olmalı: **`api.beergarita.com.tr`** → VPS.
- Şu dördünün birbirini tuttuğunu doğrula:
  - nginx `server_name` = `api.beergarita.com.tr`
  - certbot sertifikası `api.beergarita.com.tr` için
  - `data.js` API çağrıları `https://api.beergarita.com.tr/api/v1/...`'e gidiyor
  - CORS izinli origin'ler: `https://beergarita.com.tr` + `https://wakeaweb.github.io`
- (DNS'te `api` alt alanı VPS IP'sine A kaydı — bu sunucu tarafı, kodda değil;
  ama README'de belirtilmiş olmalı.)

### 2. MENÜ: FİYAT OPSİYONDA
- `menu_options` tablosunda `size` + `price` var mı?
- Ürünün doğrudan fiyat alanı YOK; fiyat her zaman opsiyonda.
- Tek fiyatlı ürün = tek opsiyon (size boş). Public render'da opsiyonlar
  ürün açıklamasının ALTINA alt alta, fiyatlarıyla geliyor mu?

### 3. ETKİNLİK: ERTESİ GÜN OTOMATİK PASİF
- Public events sorgusunda filtre var mı:
  `is_active = true AND event_datetime::date >= CURRENT_DATE`
- Yani etkinlik kendi günü görünür, ertesi gün otomatik gizlenir.

### 4. YORUMLAR: ELLE ÖZET + GOOGLE LİNKİ
- Ortalama puan ve toplam sayı OTOMATİK HESAPLANMIYOR; elle girilen alanlar
  (`reviews_summary`).
- "Google Yorumlar" linki var mı? (etiket + URL, seed: https://tinyurl.com/yktn4hy4)
- Public yorumlar bölümünde bu link, listenin altında görünüyor mu?

### 5. GÖRSEL URL'LERİ TAM ADRES
- Yükleme endpoint'i ve API yanıtları görselleri TAM URL ile döndürüyor mu:
  `https://api.beergarita.com.tr/uploads/...`
- (Public site farklı origin'de; göreli URL dönerse görseller kırılır.)

### 6. ADMIN SPA — VITE BASE YOLU
- Admin paneli `/admin` altında servis ediliyor → Vite config'inde
  `base: '/admin/'` ayarlı mı? (Değilse derlenen JS/CSS yolları 404 verir.)
- Build çıktısı doğru yola kopyalanıyor ve nginx/Fastify `/admin`'i serve ediyor mu?

### 7. GÜVENLİK
- Tüm `/api/v1/admin/*` route'ları JWT middleware ile korunuyor mu?
- Şifreler bcrypt ile hash'leniyor mu (düz metin yok)?
- `.env` `.gitignore`'da mı; gizli değerler repoya commit'lenmemiş mi?
- Tüm POST/PUT'larda girdi doğrulama (schema validation) var mı?

### 8. VERİ MODELİ TAMLIĞI
- Şema şartnamedeki tüm tabloları içeriyor mu: venue, venue_hours,
  venue_social, menu_categories, menu_products, menu_options, events,
  gallery_images, reviews, reviews_summary, admin_users?
- Seed verisi mevcut `data.js` içeriğinden geliyor mu (menü, etkinlik,
  yorum, galeri, saatler, iletişim)?

---

## Çıktı formatı (senden beklediğim)

Önce şöyle bir tablo/liste ver, sonra dur:

| # | Bölüm | Şartnamede | Kodda | Önem |
|---|-------|-----------|-------|------|
| 1 | API host | api. alt alan ayrımı | ... | kritik/orta/küçük |
| ... | | | | |

Bu listeyi onayladıktan sonra düzeltmelere geçeriz.
