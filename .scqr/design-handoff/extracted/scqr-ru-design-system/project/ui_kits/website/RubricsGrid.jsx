// Rubrics 3x2 grid + Podcast card
function RubricsGrid() {
  const rubrics = [
    { icon: "boxes",         name: "Модели",        sub: "новости о нейросетях и моделях" },
    { icon: "wrench",        name: "Инструменты",   sub: "сервисы и платформы на базе ИИ" },
    { icon: "briefcase",     name: "Бизнес",        sub: "ИИ в компаниях и стартапах" },
    { icon: "flask-conical", name: "Исследования",  sub: "научные достижения и эксперименты" },
    { icon: "book-open",     name: "Обучение",      sub: "курсы, гайды и материалы" },
    { icon: "message-square",name: "Мнение",        sub: "колонки экспертов и аналитика" },
  ];
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ attrs: { width: 22, height: 22, "stroke-width": 2 } }); });
  return (
    <div className="rubrics-grid">
      {rubrics.map((r, i) => (
        <div className="rubric-tile" key={i}>
          <div className="chip"><i data-lucide={r.icon}></i></div>
          <div>
            <div className="name">{r.name}</div>
            <div className="sub">{r.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PodcastCard() {
  return (
    <aside className="podcast">
      <div className="hdr"><h4>Подкаст SCQR Talk</h4><a>Все выпуски →</a></div>
      <div className="body">
        <div>
          <span className="pill">Новый выпуск</span>
          <div className="title">Будущее рядом: стоит ли бояться сильного ИИ?</div>
          <div className="desc">Говорим про развитие, риски и границы технологий.</div>
          <div className="dur">48:21</div>
        </div>
        <button className="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
      </div>
    </aside>
  );
}
window.RubricsGrid = RubricsGrid;
window.PodcastCard = PodcastCard;
