// Newsletter subscribe banner with mascot
function NewsletterBanner() {
  return (
    <section className="newsletter">
      <div className="mascot"><img src="../../assets/mascot/mascot-hero.png" alt="" /></div>
      <div>
        <div className="pitch">Будь в курсе будущего вместе с <span className="ru">SCQR.RU</span></div>
        <div className="feats">
          <span className="feat"><span className="dot"></span>Только проверенные новости</span>
          <span className="feat"><span className="dot"></span>Экспертные мнения и аналитика</span>
          <span className="feat"><span className="dot"></span>Удобно, быстро и без воды</span>
        </div>
      </div>
      <button className="cta">Подписаться на рассылку</button>
    </section>
  );
}
window.NewsletterBanner = NewsletterBanner;
