// Sidebar mini news feed
function MiniFeed() {
  const items = [
    { ts: "12:42", rubric: "МОДЕЛИ", title: "Anthropic выпустила Claude 3.5 Sonnet — лидер в бенчмарках", logo: "A", logoBg: "#f4f4f5", logoFg: "#0D1117" },
    { ts: "11:31", rubric: "ИНСТРУМЕНТЫ", title: "Runway представила Gen-3 Alpha для генерации видео", logo: "R", logoBg: "#000", logoFg: "#fff" },
    { ts: "10:15", rubric: "БИЗНЕС", title: "NVIDIA вложит $2 млрд в стартапы в сфере ИИ", logo: "N", logoBg: "#76b900", logoFg: "#fff" },
    { ts: "09:47", rubric: "ИССЛЕДОВАНИЯ", title: "ИИ научился предсказывать погоду точнее традиционных моделей", logo: "W", logoBg: "linear-gradient(135deg,#3AA0FF,#6C4DFF)", logoFg: "#fff" },
    { ts: "Вчера, 23:12", rubric: "ОБНОВЛЕНИЯ", title: "ChatGPT теперь помнит всё: представлена новая функция памяти", logo: "C", logoBg: "linear-gradient(135deg,#6C4DFF,#3AA0FF)", logoFg: "#fff" },
  ];
  return (
    <aside className="feed">
      <div className="feed-hdr"><h4>Лента новостей</h4><a>Все новости →</a></div>
      {items.map((it, i) => (
        <div className="feed-item" key={i}>
          <div>
            <span className="ts">{it.ts}</span>
            <span className="eb">{it.rubric}</span>
            <div className="title">{it.title}</div>
          </div>
          <div className="logo" style={{ background: it.logoBg, color: it.logoFg }}>{it.logo}</div>
        </div>
      ))}
      <div className="feed-more">Больше новостей</div>
    </aside>
  );
}
window.MiniFeed = MiniFeed;
