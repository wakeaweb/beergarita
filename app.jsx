// app.jsx — Tweaks, tema uygulaması, scroll-reveal ve render
const { useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "yon": "Klasik",
  "accent": "#c99b4e",
  "isikHissi": 0.17,
  "basligFont": "Otomatik (yöne göre)",
  "overlay": 0.5,
  "mekanDokusu": true
} /*EDITMODE-END*/;

const HF_MAP = {
  "Otomatik (yöne göre)": "",
  "Playfair": "hf-playfair",
  "Cormorant": "hf-cormorant",
  "Bodoni": "hf-bodoni"
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pubVer, setPubVer] = React.useState(0);

  useEffectA(() => {
    const onReady = () => setPubVer((prev) => prev + 1);
    window.addEventListener("pubDataReady", onReady);
    return () => window.removeEventListener("pubDataReady", onReady);
  }, []);

  // Tema değişkenlerini <body>'ye uygula (zemin de güncellensin diye)
  useEffectA(() => {
    const b = document.body;
    b.classList.toggle("dir-a", t.yon === "Klasik");
    b.classList.toggle("dir-b", t.yon === "Modern");
    Object.values(HF_MAP).forEach((c) => c && b.classList.remove(c));
    const hf = HF_MAP[t.basligFont];
    if (hf) b.classList.add(hf);
    b.style.setProperty("--accent", t.accent);
    b.style.setProperty("--bg-l", String(t.isikHissi));
    b.style.setProperty("--hero-overlay", String(t.overlay));
    b.classList.toggle("gizle-doku", !t.mekanDokusu);
  }, [t.yon, t.accent, t.isikHissi, t.basligFont, t.overlay, t.mekanDokusu]);

  // Sayfa yüklendiğinde URL'de #menu vb. varsa doğru pozisyona (header payı bırakarak) kaydır
  useEffectA(() => {
    if (window.location.hash && window.scrollToId) {
      const id = window.location.hash.substring(1);
      setTimeout(() => window.scrollToId(id), 100);
    }
  }, []);

  // Scroll-reveal
  useEffectA(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {els.forEach((e) => e.classList.add("in"));return;}
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {en.target.classList.add("in");io.unobserve(en.target);}
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <React.Fragment>
      <Header onBurger={() => setMenuOpen(true)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <About />
        <Menu />
        <NeonBand />
        <Events data-comment-anchor="216d437bbc-div-15-11" />
        <Gallery />
        <Reviews />
        <Contact />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Yön" />
        <TweakRadio label="Tasarım yönü" value={t.yon}
        options={["Klasik", "Modern"]}
        onChange={(v) => setTweak("yon", v)} />
        <TweakSection label="Atmosfer" />
        <TweakColor label="Vurgu rengi" value={t.accent}
        options={["#c99b4e", "#d8a83f", "#2fae6b", "#c4382c", "#3a6fd0"]}
        onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Mekân dokusu (bayrak + neon)" value={t.mekanDokusu}
        onChange={(v) => setTweak("mekanDokusu", v)} />
        <TweakSlider label="Işık hissi (zemin)" value={t.isikHissi}
        min={0.11} max={0.27} step={0.005}
        onChange={(v) => setTweak("isikHissi", v)} />
        <TweakSlider label="Hero overlay koyuluğu" value={t.overlay}
        min={0.2} max={0.85} step={0.05}
        onChange={(v) => setTweak("overlay", v)} />
        <TweakSection label="Tipografi" />
        <TweakSelect label="Başlık fontu" value={t.basligFont}
        options={["Otomatik (yöne göre)", "Playfair", "Cormorant", "Bodoni"]}
        onChange={(v) => setTweak("basligFont", v)} />
      </TweaksPanel>
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);