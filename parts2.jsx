// parts2.jsx — Events, Gallery + Lightbox, Reviews, Contact, Footer
const { useState: useState2, useEffect: useEffect2 } = React;

function Events() {
  return (
    <section className="block" id="etkinlikler">
      <div className="neon-sign" aria-hidden="true">
        <div className="neon-img"></div>
      </div>
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 36 }}>
          <p className="kicker">Bu Hafta</p>
          <h2 className="section-title">Etkinlikler</h2>
          <p className="lead">Canlı müzik, dev ekran maç yayını ve trivia geceleri. Masan hazır olsun.</p>
        </div>
        <div className="events" style={{ color: "rgb(255, 255, 255)" }}>
          {PUB.events.map((e, i) =>
          <div className="event reveal" key={i} style={{ transitionDelay: i * 60 + "ms", backgroundColor: "rgba(15, 33, 30, 0.82)" }}>
              <div className="date">
                <div className="day">{e.day}</div>
                <div className="num">{e.date.split(" ")[0]}</div>
                <div className="day" style={{ marginTop: 4, color: "var(--faint)" }}>{e.date.split(" ")[1]}</div>
              </div>
              <div className="body">
                <div className="meta">{e.time}</div>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Gallery() {
  const [idx, setIdx] = useState2(-1);
  const imgs = PUB.gallery.map((k) => PUB.images[k]);
  const close = () => setIdx(-1);
  const go = (d) => setIdx((p) => (p + d + imgs.length) % imgs.length);

  useEffect2(() => {
    if (idx < 0) return;
    const onKey = (ev) => {
      if (ev.key === "Escape") close();
      if (ev.key === "ArrowRight") go(1);
      if (ev.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx]);

  return (
    <section className="block bg-surface" id="galeri">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 34 }}>
          <p className="kicker">Galeri</p>
          <h2 className="section-title">Mekândan kareler</h2>
        </div>
        <div className="gal">
          {imgs.map((src, i) =>
          <button key={i} className="reveal" style={{ transitionDelay: i * 40 + "ms" }} onClick={() => setIdx(i)}>
              <img src={src} alt={"Galeri görseli " + (i + 1)} loading="lazy" />
            </button>
          )}
        </div>
      </div>
      {idx >= 0 &&
      <div className="lb" onClick={close}>
          <button className="x" aria-label="Kapat" onClick={close}>×</button>
          <button className="nav-btn prev" aria-label="Önceki" onClick={(e) => {e.stopPropagation();go(-1);}}>‹</button>
          <img src={imgs[idx]} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="nav-btn next" aria-label="Sonraki" onClick={(e) => {e.stopPropagation();go(1);}}>›</button>
        </div>
      }
    </section>);

}

function Stars({ n }) {
  return (
    <div className="stars" aria-label={n + " / 5"}>
      {[1, 2, 3, 4, 5].map((i) =>
      <span key={i} className={i <= n ? "" : "off"}>★</span>
      )}
    </div>);

}

function Reviews() {
  return (
    <section className="block" id="yorumlar">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 36 }}>
          <p className="kicker">Misafirlerimiz</p>
          <h2 className="section-title">Ne diyorlar?</h2>
        </div>
        <div className="reviews">
          {PUB.reviews.map((r, i) =>
          <div className="review reveal" key={i} style={{ transitionDelay: i % 2 * 80 + "ms", backgroundColor: "rgba(15, 33, 30, 0.85)" }}>
              <Stars n={r.s} />
              <p>“{r.t}”</p>
              <div className="who">{r.n}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Contact() {
  const c = PUB.contact;
  return (
    <section className="block bg-surface" id="iletisim">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 40 }}>
          <p className="kicker">İletişim</p>
          <h2 className="section-title">Bize uğra</h2>
          <p className="lead">Gayrettepe'deyiz. Rezervasyon, etkinlik ve grup masaları için bir telefon kadar yakınız.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info reveal">
            <div className="line">
              <span className="lbl">Adres</span>
              <span className="val">{c.address}<br /><a href={c.mapsLink} target="_blank" rel="noopener">Haritada aç →</a></span>
            </div>
            <div className="line">
              <span className="lbl">Telefon</span>
              <span className="val"><a href={c.phoneHref}>{c.phone}</a></span>
            </div>
            <div className="line">
              <span className="lbl">Saatler</span>
              <span className="val">{PUB.hours.map((h, i) => <span key={i}>{h.d}: {h.h}{i < PUB.hours.length - 1 ? "\n" : ""}</span>)}</span>
            </div>
            <div className="socials">
              {c.social.map((s, i) =>
              <a key={i} href={s.href} target="_blank" rel="noopener"><strong>{s.label}</strong> · {s.handle}</a>
              )}
            </div>
          </div>
          <div className="map reveal">
            <div className="map-fallback">
              <div className="pin">📍</div>
              <div className="map-addr">Gayrettepe, Yıldız Posta Cd.<br />Beşiktaş / İstanbul</div>
              <a className="pill" style={{ padding: "11px 22px" }} href={c.mapsLink} target="_blank" rel="noopener">Yol Tarifi Al</a>
            </div>
            <iframe title="Harita" src={c.maps} referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div className="hdr-logo" style={{ paddingLeft: 0, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          THE BEERGARITA PUB & EATERY
        </div>
        <div className="ornament"><span>✦</span></div>
        <p className="motto" style={{ fontSize: "24px" }}>Semt kültürü kazanacak.</p>
        <p className="small">
          Gayrettepe, Yıldız Posta Cd. · Beşiktaş / İstanbul · <a href={PUB.contact.phoneHref}>{PUB.contact.phone}</a><br />
          © {new Date().getFullYear()} The Beergarita Pub · London Pub Eatery
        </p>
      </div>
    </footer>);

}


// Neon slogan bandı — mekânın gerçek duvar yazıları, zümrüt fayans üzerinde
const SLOGANS = [
"No Beer Racists", "#FeelReal", "Lady Diana Was Right Mr Charles",
"Melancholy Is For The Richest Mind", "Beer Time", "Pub & Eatery"];

function NeonBand() {
  const seq = SLOGANS.concat(SLOGANS); // kesintisiz akış için iki tur
  return (
    <div className="neon-band" aria-hidden="true">
      <div className="neon-track">
        {seq.map((s, i) =>
        <React.Fragment key={i}>
            <span className="slogan">{s}</span>
            <span className="sep">✦</span>
          </React.Fragment>
        )}
      </div>
    </div>);

}

Object.assign(window, { Events, Gallery, Reviews, Contact, Footer, Stars, NeonBand });