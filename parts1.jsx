// parts1.jsx — Header, Hero, About, Menu
// Punto değerleri styles.css içindeki TİPOGRAFİ KÜTÜPHANESİ'nden (--fs-*) gelir.
const { useState, useEffect, useRef } = React;

const NAV = [
{ id: "hakkimizda", label: "Hakkımızda" },
{ id: "menu", label: "Menü" },
{ id: "etkinlikler", label: "Etkinlikler" },
{ id: "galeri", label: "Galeri" },
{ id: "yorumlar", label: "Yorumlar" },
{ id: "iletisim", label: "İletişim" }];


function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (-20), behavior: "smooth" });
}

function Brand({ light }) {
  return (
    <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <div className="mark" style={{ padding: "0px 0px 3px", margin: "-3px 0px 0px" }}>B</div>
      <div>
        <span className="bname">The Beergarita Pub</span>
        <span className="btag" style={{ letterSpacing: "0px", textAlign: "left" }}>London Pub Eatery</span>
      </div>
    </div>);

}

function Bunting() {
  return (
    <div className="bunting-band" aria-hidden="true" style={{ textAlign: "center" }}>
      <picture>
        <source media="(max-width: 640px)" srcSet="assets/header-flags-mobile-new.png" />
        <img className="hdr-flag-img" src="assets/header-flags-desktop-new.png" alt="Flags" style={{ display: "inline-block", maxWidth: "100%", height: "auto" }} />
      </picture>
    </div>
  );
}

function Header({ onBurger }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={"hdr" + (solid ? " solid" : "")}>
      <div className="hdr-bar-css">
        <button className="hdr-burger-btn" onClick={onBurger} aria-label="Menü">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <a href="#" className="hdr-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          THE BEERGARITA PUB & EATERY
        </a>
        <nav className="hdr-nav">
          {NAV.map((n) => <a key={n.id} onClick={() => scrollToId(n.id)}>{n.label}</a>)}
        </nav>
        <a className="hdr-wa" href="https://wa.me/902122134046" target="_blank" rel="noopener" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>
      </div>
      <Bunting />
    </header>);
}

function MobileNav({ open, onClose }) {
  return (
    <div className={"mnav" + (open ? " open" : "")}>
      <button className="close" aria-label="Kapat" onClick={onClose}>×</button>
      {NAV.map((n) =>
      <a key={n.id} onClick={() => {onClose();setTimeout(() => scrollToId(n.id), 380);}}>{n.label}</a>
      )}
    </div>);

}

function Hero() {
  const vidRef = useRef(null);
  useEffect(() => {if (vidRef.current) vidRef.current.play().catch(() => {});}, []);
  return (
    <section className="hero" id="top">
      <img className="poster" src={PUB.poster} alt="" />
      <video ref={vidRef} className="poster" autoPlay muted loop playsInline preload="auto" poster={PUB.poster}>
        <source src={PUB.video} type="video/mp4" />
      </video>
      <div className="scrim"></div>
      <div className="hero-inner wrap" data-comment-anchor="bff7d7464b-div-75-7">
        <p className="kicker hero-kicker">Gayrettepe · Beşiktaş · İstanbul</p>
        <h1>THE BEERGARITA PUB</h1>
        <div className="hero-counter" data-comment-anchor="4d49f6aaa0-p-80-9">
          <div className="hero-counter-inner">
            <p className="hero-sub">Semt kültürü kazanacak. Soğuk fıçı bira, sıcak bir köşe ve gerçek bir Londra public house havası — mahallenin tam ortasında.</p>
          </div>
        </div>
        <div className="hero-cta">
          <button className="pill" onClick={() => scrollToId("menu")}>İçeri Buyur</button>
          <button className="pill ghost" onClick={() => scrollToId("iletisim")}>Bizi Bul</button>
        </div>
      </div>
      <div className="scroll-cue" onClick={() => scrollToId("hakkimizda")} style={{ cursor: "pointer" }}>
        <span>Kaydır</span>
        <span className="arrow"></span>
      </div>
    </section>);}
function About() {
  return (
    <section className="block" id="hakkimizda">
      <div className="wrap about-grid">
        <div className="about-copy reveal" data-comment-anchor="263d738655-div-96-9">
          <p className="kicker" style={{ color: "rgb(201, 155, 78)", fontSize: "17px" }}>Hikâyemiz</p>
          <h2 className="section-title">Mahallenin Londra köşesi</h2>
          <p>Gayrettepe'nin göbeğinde, bir Londra public house'unun samimiyetini ve sıcaklığını getirdik. Koyu ahşap, loş akşam ışığı ve dolu masaların neşesi — burada herkes tanıdık.</p>
          <p>Lüks değil, içten. Uygun fiyata kaliteli bira, doyurucu burgerler ve kendini evinde hissettiren bir ortam. Akşam başlar, sohbet uzar.</p>
          <div className="hours" data-comment-anchor="3811404615-div-108-11">
            <p className="kicker" style={{ marginBottom: 8 }}>Çalışma Saatleri</p>
            {PUB.hours.map((r, i) =>
            <div className="row" key={i}>
                <span className="d">{r.d}</span>
                <span className="h">{r.h}</span>
              </div>
            )}
            <div className="badge"><span className="dot"></span> Mutfak, 22:00'ye kadar açıktır</div>
          </div>
        </div>
        <div className="reveal">
          <div className="about-img">
            <img src={PUB.images.barLights} alt="The Beergarita Pub iç mekânı" data-comment-anchor="deb69d7269-img-113-13" />
            <div className="frame"></div>
          </div>
        </div>
      </div>
    </section>);

}

function Menu() {
  const [active, setActive] = useState(0);
  const [modalItem, setModalItem] = useState(null);
  const cat = PUB.menu[active];
  return (
    <section className="block bg-surface" id="menu">
      <div className="wrap">
        <div className="menu-head reveal">
          <div>
            <p className="kicker">Menü</p>
            <h2 className="section-title">Menü</h2>
            <p className="lead">Şeffaf fiyat, dürüst lezzet. Ağırlık fıçı bira, burger ve imza kokteyllerde — gerisi de iddialı.</p>
          </div>
        </div>
        <div className="tabs reveal">
          {PUB.menu.map((m, i) =>
          <button key={m.id} className={"tab" + (i === active ? " active" : "")} onClick={() => setActive(i)}>{m.name}</button>
          )}
        </div>
        <div className="menu-body">
          <div className="menu-photo reveal">
            <img src={cat.img && (cat.img.startsWith('http') || cat.img.startsWith('/') || cat.img.includes('.')) ? cat.img : (PUB.images[cat.img] || cat.img)} alt={cat.name} />
            <div className="cap">
              <div className="ttl">{cat.name}</div>
              <div className="sub">{cat.kicker}</div>
            </div>
          </div>
          <div className="items">
            {cat.items.map((it, i) =>
            <div className="item" key={i} 
                 style={it.popupImg ? { cursor: "pointer" } : {}}
                 onClick={() => it.popupImg && setModalItem({ src: it.popupImg, name: it.n })}>
                <span className="n" style={it.popupImg ? { textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "4px" } : {}}>{it.n}</span>
                {/* Tek opsiyon veya fallback: tek fiyat göster */}
                {(!it.options || it.options.length <= 1) && <span className="p">{it.p}</span>}
                <span className="d">{it.d}</span>
                {/* Çoklu opsiyon: açıklamanın altında size+price alt alta */}
                {it.options && it.options.length > 1 && (
                  <div className="item-options">
                    {it.options.map((opt, oi) =>
                      <div className="item-opt" key={oi}>
                        <span className="opt-size">{opt.size || ''}</span>
                        <span className="opt-price">₺{Math.round(opt.price)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="menu-note">Öne çıkan kalemler gösterilmektedir. Tam menü için mekânımıza bekleriz · Fiyatlara KDV dahildir.</p>
          </div>
        </div>
      </div>
      {modalItem && <ImageModal src={modalItem.src} alt={modalItem.name} onClose={() => setModalItem(null)} />}
    </section>);

}

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="mnav open" style={{ zIndex: 100, alignItems: "center", backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: "15px" }} onClick={onClose}>
      <button onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "none", color: "#fff", border: "none", fontSize: "45px", cursor: "pointer", lineHeight: 1, zIndex: 101 }}>&times;</button>
      <div style={{ position: "relative", width: "100%", textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", objectFit: "contain", margin: "0 auto", display: "block" }} />
        <h3 style={{ color: "var(--accent, #c99b4e)", textAlign: "center", marginTop: "15px", fontFamily: "var(--font-head)", fontSize: "28px" }}>{alt}</h3>
      </div>
    </div>
  );
}

Object.assign(window, { NAV, scrollToId, Header, MobileNav, Hero, About, Menu, Bunting });