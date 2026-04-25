// Footer with link columns + waving mascot
function Footer() {
  const cols = [
    { h: "Разделы", links: ["Новости", "Статьи", "Обзоры", "Инструменты"] },
    { h: "О сайте", links: ["О проекте", "Команда", "Контакты", "Реклама"] },
    { h: "Помощь", links: ["Подписка", "Добавить новость", "Правила сайта", "Политика конфиденциальности"] },
  ];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">SCQ<span className="ru">R.RU</span></div>
            <p>Самая актуальная новости мира искусственного интеллекта</p>
            <div className="socials">
              <button aria-label="Telegram"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.4 8.7 20.1c.5 0 .7-.2 1-.5l2.4-2.3 5 3.6c.9.5 1.6.2 1.8-.8l3.3-15.5c.3-1.3-.5-1.8-1.4-1.5L1.6 9.5c-1.3.5-1.3 1.2-.2 1.5l5.1 1.6 11.8-7.4c.6-.4 1.1-.2.7.2"/></svg></button>
              <button aria-label="VK"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6h2c0 4 3 7 5 7V6h2v3.5C13 8 14.5 6 16 6h2c-1 2-2 3-3 4 1 1 3 3 4 5h-2.5c-.5-1-2-3-3-4-.5 0-1 0-1 1V15h-2c-3 0-7-3-8-9z"/></svg></button>
              <button aria-label="Twitter"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4h3l-7 8 8 10h-6l-5-6-5 6H3l8-9-8-9h6l4 5z"/></svg></button>
              <button aria-label="RSS"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 11v3c4 0 7 3 7 7h3c0-5.5-4.5-10-10-10zM3 4v3c8 0 14 6 14 14h3C20 11.5 12.5 4 3 4z"/></svg></button>
            </div>
          </div>
          {cols.map((c, i) => (
            <div className="footer-col" key={i}>
              <h5>{c.h}</h5>
              <ul>{c.links.map((l, j) => <li key={j}><a>{l}</a></li>)}</ul>
            </div>
          ))}
          <div className="footer-mascot">
            <div className="text">Увидимся<br/>в будущем!</div>
            <img src="../../assets/mascot/sticker-6.png" alt=""/>
          </div>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
