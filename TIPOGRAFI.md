# Tipografi Kütüphanesi — The Beergarita Pub

Tüm punto (font-size) değerleri tek kaynaktan yönetilir: `styles.css` içindeki
`:root` bloğundaki **TİPOGRAFİ KÜTÜPHANESİ** (`--fs-*` token'ları).
Bir puntoyu değiştirmek için ilgili token'ın değerini orada güncelle — tüm site
otomatik güncellenir. Artık öğelerin üzerinde tek tek inline punto yok.

## Token'lar (senin belirlediğin değerler)

| Token             | Değer                              | Nerede kullanılır                          |
|-------------------|------------------------------------|--------------------------------------------|
| `--fs-display`    | 73px (kısa ekranda küçülür)        | Hero başlığı (THE BEERGARITA PUB)          |
| `--fs-h2`         | 52px (responsive)                  | Bölüm başlıkları (Menü, Etkinlikler…)      |
| `--fs-motto`      | 33px (responsive)                  | Footer mottosu                             |
| `--fs-quote`      | 20px                               | Müşteri yorumu metni                       |
| `--fs-item`       | 19px                               | Menü kalem adı                             |
| `--fs-brand-mark` | 25px                               | Logo amblemi (B)                           |
| `--fs-brand-name` | 21px                               | Marka adı (The Beergarita Pub)             |
| `--fs-lg`         | 18px                               | Menü/nav bağlantıları, büyük gövde (1. paragraf) |
| `--fs-body`       | 17px                               | Paragraf, lead, hero alt metni             |
| `--fs-label`      | 16px                               | Etiketler (kicker), marka alt etiketi      |
| `--fs-tab`        | 15px                               | Menü sekmeleri                             |
| `--fs-sm`         | 14px                               | Küçük açıklama, rozet, menü kalem açıklaması |

## Nasıl değiştirilir?

`styles.css` → `:root` → ilgili satır. Örnek:

```css
--fs-h2: clamp(34px, 6vw, 52px);   /* tüm bölüm başlıkları */
```

`52px` yerine istediğin değeri yaz; bütün bölüm başlıkları aynı anda değişir.

> Not: "Responsive" işaretli token'lar küçük ekranlarda otomatik küçülür
> (büyük punto, dar telefonda taşmaz). Sabit istiyorsan `clamp(...)` yerine
> tek bir px değeri yazabilirsin.
