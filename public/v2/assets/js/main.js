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

// お問い合わせフォーム（仮置き）
// 送信先（Formspree などのURL）は form の data-endpoint に設定する。未設定のあいだは送信しない。
const form = document.getElementById('contact-form');
if (form) {
  const err = document.getElementById('form-error');
  const status = document.getElementById('form-status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.hidden = true; status.hidden = true;
    const missing = [...form.querySelectorAll('[required]')].filter(el => el.type === 'checkbox' ? !el.checked : !el.value.trim());
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    if (missing.length) {
      missing.forEach(el => el.setAttribute('aria-invalid', 'true'));
      err.textContent = '必須の項目を入力してください。';
      err.hidden = false; missing[0].focus();
      return;
    }
    const email = form.querySelector('[type="email"]');
    if (!email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      err.textContent = 'メールアドレスの形式を確認してください。';
      err.hidden = false; email.focus();
      return;
    }
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      status.textContent = 'このフォームは準備中のため、まだ送信できません。';
      status.hidden = false;
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = '送信しました。ご返信まで3営業日ほどお待ちください。';
      status.hidden = false;
    } catch {
      err.textContent = '送信できませんでした。時間をおいて、もう一度お試しください。';
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
}
