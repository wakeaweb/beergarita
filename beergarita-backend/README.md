# Beergarita Pub Backend & Admin Panel Deployment Guide

Bu rehber, Beergarita Pub projesinin backend (Fastify API) ve Admin panelini (React SPA) VPS sunucunuza Docker Compose kullanarak nasıl dağıtacağınızı (deploy) adım adım açıklamaktadır.

---

## MİMARİ YENİLEME ÖZETİ
* **Public Web Sitesi (GitHub Pages):** `https://beergarita.com.tr` adresinde yayında kalacaktır.
* **Backend API & Admin Paneli (VPS):** `https://api.beergarita.com.tr` adresinde çalışacaktır.
  * API endpoints: `https://api.beergarita.com.tr/api/v1/`
  * Admin Paneli: `https://api.beergarita.com.tr/admin/`

---

## 1. Domain (DNS) Hazırlığı
Dağıtıma başlamadan önce, domain sağlayıcınızın DNS yönetim panelinden aşağıdaki kaydı ekleyin:
* **Tip:** `A`
* **İsim (Host):** `api`
* **Hedef (Value):** VPS Sunucunuzun IP Adresi

---

## 2. Sunucu Kurulumu & Dosya Aktarımı

### Adım 2.1: Sunucuda Docker Kurulumu
VPS sunucunuzda Docker ve Docker Compose yüklü değilse kurun:
```bash
# Ubuntu için:
sudo apt update
sudo apt install -y docker.io docker-compose
```

### Adım 2.2: Dosyaları Sunucuya Yükleme
`beergarita-backend` klasöründeki dosyaları sunucunuzda `/var/www/beergarita-backend` gibi bir dizine yükleyin (Git, SCP veya SFTP ile).

---

## 3. Ortam Değişkenleri (.env) Ayarı
Sunucudaki proje kök dizininde `.env` dosyasını oluşturun (varsayılan şablon `.env.example` dosyasından kopyalanabilir):
```bash
cp .env.example .env
nano .env
```

Aşağıdaki değerleri kendi şifreleriniz ve etki alanınızla düzenleyin:
```env
# Veritabanı Ayarları
POSTGRES_USER=beergarita
POSTGRES_PASSWORD=GuvonliBirSifre123!
POSTGRES_DB=beergarita

# Sunucu Ayarları
NODE_ENV=production
PORT_INTERNAL=3000
PORT_EXTERNAL=3001
API_HOST=https://api.beergarita.com.tr

# JWT Güvenlik Anahtarı
JWT_SECRET=RastgeleUzunBirKarakterDizisiSecin98765

# İlk Admin Giriş Bilgileri
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminPanelSifresi987!

# CORS Ayarları (Public sitenizin origin'leri)
CORS_ORIGINS=https://beergarita.com.tr,https://www.beergarita.com.tr
```

---

## 4. Docker Compose ile Başlatma

### Adım 4.1: Başlangıç (HTTP Modu & SSL Sertifikası Alma)
İlk deploy aşamasında SSL sertifikanız henüz mevcut olmadığı için Nginx'i HTTP modunda başlatıp sertifikayı Certbot ile almamız gerekir.

1. Projedeki `docker-compose.yml` dosyasını Nginx'i dahil etmeden veya host-level Nginx kullanarak çalıştırın. Nginx'i Docker içinde reverse-proxy olarak kullanıyorsanız:
   ```bash
   # Docker Compose container'larını arka planda ayağa kaldırın:
   docker-compose up --build -d
   ```
2. Sunucuda kurulu Certbot veya Docker certbot imajı üzerinden `api.beergarita.com.tr` için SSL sertifikası oluşturun:
   ```bash
   sudo certbot certonly --webroot -w /var/www/certbot -d api.beergarita.com.tr
   ```
   *(Sertifikalar `/etc/letsencrypt/live/api.beergarita.com.tr/` dizinine yerleştirilecektir).*

3. SSL sertifikası oluşturulduktan sonra, Nginx konfigürasyonunu `nginx.conf` (HTTPS uyumlu sürüm) dosyasına geçirin ve Nginx'i yeniden yükleyin/başlatın.

---

## 5. Veritabanı Tablolarının Oluşturulması ve Seed Verileri
Uygulama ayağa kalktıktan sonra, veritabanındaki tabloları oluşturmak ve `data.js` dosyasındaki mevcut menü/mekân/yorum içeriklerini veritabanına otomatik yüklemek için server container'ı içinde yer alan seed betiğini çalıştırın:

```bash
# Server container'ı içinde db init scriptini tetikleyin:
docker-compose exec server npm run init-db
```
Bu komut veritabanı tablolarını sıfırdan oluşturacak, varsayılan admin kullanıcısını ve başlangıç verilerini sisteme ekleyecektir.

---

## 6. Admin Panel Kullanımı
Tüm adımlar başarıyla tamamlandıktan sonra:
* `https://api.beergarita.com.tr/admin` adresine gidin.
* `.env` dosyasında belirlediğiniz `ADMIN_USERNAME` ve `ADMIN_PASSWORD` ile giriş yapın.
* Mekân bilgilerini, çalışma saatlerini, menüyü, etkinlikleri, galeri görsellerini ve Google Yorum özetini buradan dinamik olarak güncelleyebilirsiniz.
