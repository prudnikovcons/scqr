// SCQR.RU — Top navigation
function TopNav() {
  return (
    <header className="nav-wrap">
      <div className="container">
        <div className="nav-row1">
          <span className="nav-logo">SCQ<span className="ru">R.RU</span></span>
          <span className="nav-tagline">новости искусственного интеллекта</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <button className="nav-search-icon" aria-label="Поиск">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="nav-cta">Подписаться</button>
            <div className="nav-avatar"><img src="../../assets/mascot/mascot-face.png" alt=""/></div>
          </span>
        </div>
        <nav className="nav-row2">
          <a className="active">Новости</a>
          <a>Статьи</a>
          <a>Обзоры</a>
          <a>Инструменты</a>
          <a>Конкурсы</a>
          <a>События</a>
          <a>Видео</a>
          <a>Подкасты</a>
          <a>Словарь</a>
        </nav>
      </div>
    </header>
  );
}
window.TopNav = TopNav;
