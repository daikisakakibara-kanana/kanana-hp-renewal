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

// ヒーロー：ホームページ ⇄ 業務システム
const mock = document.getElementById('mock');
if (mock) {
  const url = mock.querySelector('.browser__url');
  const buttons = document.querySelectorAll('.switch button');
  buttons.forEach(b => {
    b.addEventListener('click', () => {
      mock.dataset.view = b.dataset.view;
      url.textContent = b.dataset.url;
      buttons.forEach(x => x.setAttribute('aria-pressed', x === b));
    });
  });
}
