// メニュー（スマホ）
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });
}

// 別ページへ移動したときは、ページの一番上から表示する。
// ページ内リンク（#〜 付き）、再読み込み、戻る・進むのときは、ブラウザの動きのままにする。
(function () {
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const type = nav ? nav.type : 'navigate';
  if (type !== 'navigate' || location.hash) return;
  let touched = false;
  const mark = () => { touched = true; };
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => window.addEventListener(ev, mark, { once: true, passive: true }));
  const toTop = () => { if (!touched) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
  toTop();
  window.addEventListener('load', () => { toTop(); setTimeout(toTop, 150); setTimeout(toTop, 400); }, { once: true });
  window.addEventListener('pageshow', e => { if (!e.persisted) toTop(); });
})();
