// Hero feature + sub grid
function HeroFeature() {
  return (
    <article className="hero-feature">
      <div>
        <span className="pill">ГЛАВНОЕ</span>
        <h1>OpenAI представила GPT-4o — новую эру естественного общения с ИИ</h1>
        <p>Модель понимает текст, изображения и звук одновременно. Общение стало быстрее, естественнее и контекстнее.</p>
        <div className="meta">
          <span>16 мая 2024</span>
          <span className="dot"></span>
          <span>12 684 просмотра</span>
        </div>
      </div>
      <div style={{ alignSelf: "end" }}>
        <img src="../../assets/mascot/mascot-hero.png" alt="" />
      </div>
    </article>
  );
}

function HeroSubgrid() {
  const items = [
    { mark: "G", title: "Google представила Gemini 1.5 Pro", bg: "linear-gradient(135deg,#fff,#f7f7fb)" },
    { mark: "</>", title: "Как ИИ меняет разработку ПО", bg: "linear-gradient(135deg,#0d1117,#333a45)", fg: "#fff" },
    { mark: "M", title: "Midjourney v6 уже доступен", bg: "linear-gradient(135deg,#475569,#1e293b)", fg: "#fff" },
    { mark: "C", title: "Microsoft Copilot получит память", bg: "linear-gradient(135deg,#6C4DFF,#3AA0FF)", fg: "#fff" },
  ];
  return (
    <div className="hero-sub-grid">
      {items.map((it, i) => (
        <div className="sub-card" key={i}>
          <div className="thumb" style={{ background: it.bg, color: it.fg || "var(--ink-700)" }}>{it.mark}</div>
          <h4>{it.title}</h4>
        </div>
      ))}
    </div>
  );
}

window.HeroFeature = HeroFeature;
window.HeroSubgrid = HeroSubgrid;
