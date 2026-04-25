// Sidebar События list
function EventsCard() {
  const events = [
    { day: "27", mon: "мая", title: "Конференция AI Journey 2024", loc: "Москва, офлайн", tag: "Конференция" },
    { day: "03", mon: "июн", title: "Митап AI Makers Saint Petersburg", loc: "Санкт-Петербург", tag: "Митап" },
    { day: "10", mon: "июн", title: "Вебинар: Как внедрить ИИ в бизнес без боли", loc: "Онлайн", tag: "Вебинар" },
  ];
  return (
    <aside className="events">
      <div className="hdr"><h4>События</h4><a>Все события →</a></div>
      {events.map((e, i) => (
        <div className="event-row" key={i}>
          <div className="date"><div className="day">{e.day}</div><div className="mon">{e.mon}</div></div>
          <div>
            <div className="title">{e.title}</div>
            <div className="loc">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {e.loc}
            </div>
          </div>
          <span className="pill">{e.tag}</span>
        </div>
      ))}
      <div className="all">Календарь событий</div>
    </aside>
  );
}
window.EventsCard = EventsCard;
