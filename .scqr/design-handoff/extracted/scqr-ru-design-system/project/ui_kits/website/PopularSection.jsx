// "Популярное" section: feature card + 3 video rows
function PopularSection() {
  const rows = [
    { thumb: "t1", title: "Sora от OpenAI вышла для всех — создаём видео по тексту", date: "15 мая 2024", views: "5 431" },
    { thumb: "t2", title: "5 нейросетей для работы и жизни, которые стоит попробовать прямо сейчас", date: "14 мая 2024", views: "4 120" },
    { thumb: "t3", title: "ИИ в медицине: новые открытия и реальные кейсы", date: "14 мая 2024", views: "3 204" },
  ];
  return (
    <div className="popular-grid">
      <article className="popular-feat">
        <div className="thumb"></div>
        <div className="body">
          <h3>Как ИИ-агенты изменят интернет в ближайшие 2 года</h3>
          <p>Разбираемся, почему агенты — это не модели, а автономные системы, которые действуют вместо нас.</p>
          <div className="meta">
            <span>15 мая 2024</span>
            <span className="dot"></span>
            <span>8 932 просмотра</span>
          </div>
        </div>
      </article>
      <div className="popular-list">
        {rows.map((r, i) => (
          <div className="pop-row" key={i}>
            <div className={"thumb " + r.thumb}>
              <span className="play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </span>
            </div>
            <div>
              <div className="title">{r.title}</div>
              <div className="meta"><span>{r.date}</span><span>{r.views} просмотров</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.PopularSection = PopularSection;
