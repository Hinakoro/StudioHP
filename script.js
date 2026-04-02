/* ============================
   HKM Studio — script.js
   ============================ */

/* ---------- キャンペーン：偶数月のみ表示 ---------- */
(() => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month % 2 !== 0) return; // 奇数月は非表示

  // セクション表示
  const section = document.getElementById('campaign');
  if (section) section.hidden = false;

  // ナビリンク表示
  const navLink = document.getElementById('nav-campaign');
  if (navLink) navLink.hidden = false;

  // 期間テキスト
  const year = new Date().getFullYear();
  const end = new Date(year, month, 0); // 月末日
  const endStr = `${month}月${end.getDate()}日`;
  const el = document.getElementById('campaign-period');
  if (el) el.textContent = `開催期間：${year}年${month}月1日 〜 ${endStr}`;
})();

/* ---------- キャンペーン応募モーダル ---------- */
const campaignModal     = document.getElementById('campaign-modal');
const campaignModalTitle = document.getElementById('campaign-modal-title');
const campaignTypeInput = document.getElementById('campaign-type-input');
const campaignForm      = document.getElementById('campaign-form');
const campaignSuccess   = document.getElementById('campaign-success');
const campaignSubmitBtn = document.getElementById('campaign-submit-btn');

document.querySelectorAll('.campaign-apply-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.campaign;
    campaignModalTitle.textContent = type;
    campaignTypeInput.value = type;
    campaignForm.hidden = false;
    campaignSuccess.hidden = true;
    campaignModal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});

document.getElementById('campaign-modal-close').addEventListener('click', () => {
  campaignModal.hidden = true;
  document.body.style.overflow = '';
});
campaignModal.addEventListener('click', e => {
  if (e.target === campaignModal) {
    campaignModal.hidden = true;
    document.body.style.overflow = '';
  }
});

campaignForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nameVal  = document.getElementById('c-name').value.trim();
  const emailVal = document.getElementById('c-email').value.trim();
  if (!nameVal || !emailVal) return;

  const btnText    = campaignSubmitBtn.querySelector('.btn-text');
  const btnLoading = campaignSubmitBtn.querySelector('.btn-loading');
  btnText.hidden = true;
  btnLoading.hidden = false;
  campaignSubmitBtn.disabled = true;

  const data = new FormData(campaignForm);
  const res = await fetch('https://formspree.io/f/mykbdznl', {
    method: 'POST', body: data, headers: { 'Accept': 'application/json' }
  });

  if (res.ok) {
    campaignForm.hidden = true;
    campaignSuccess.hidden = false;
  } else {
    btnText.hidden = false;
    btnLoading.hidden = true;
    campaignSubmitBtn.disabled = false;
    alert('送信に失敗しました。時間をおいて再度お試しください。');
  }
});

/* ---------- クーポンコード ---------- */
// コードはbase64エンコードして管理（平文回避）
// 実際のコードはFormspreeからのメールで発行
const COUPONS = {
  'HKM-FIRST20': { label: '初回限定 20% OFF', discount: 0.20 },
  'HKM-PERIOD10': { label: '期間限定 10% OFF', discount: 0.10 },
  'HKM-MONITOR': { label: 'モニター無料MIX', discount: 1.00 },
};

const couponInput     = document.getElementById('coupon');
const couponApplyBtn  = document.getElementById('coupon-apply-btn');
const couponResult    = document.getElementById('coupon-result');

couponApplyBtn.addEventListener('click', () => {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) return;

  const coupon = COUPONS[code];
  if (coupon) {
    couponResult.textContent = `✓ 適用：${coupon.label}`;
    couponResult.className = 'coupon-result valid';
    // hidden fieldにコードを埋め込む
    let hidden = document.getElementById('coupon-code-hidden');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'coupon_code';
      hidden.id = 'coupon-code-hidden';
      document.getElementById('contact-form').appendChild(hidden);
    }
    hidden.value = `${code}（${coupon.label}）`;
  } else {
    couponResult.textContent = '✗ 無効なコードです';
    couponResult.className = 'coupon-result invalid';
  }
});

/* ---------- YouTube タイトル・チャンネル名 自動取得 ---------- */
document.querySelectorAll('.work-card').forEach(card => {
  const iframe = card.querySelector('iframe');
  if (!iframe) return;

  const videoId = new URL(iframe.src).pathname.replace('/embed/', '');
  const ytUrl   = `https://www.youtube.com/watch?v=${videoId}`;

  fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(ytUrl)}&format=json`)
    .then(r => r.json())
    .then(data => {
      const titleEl  = card.querySelector('.work-title');
      const artistEl = card.querySelector('.work-artist');
      if (titleEl)  titleEl.textContent  = data.title;
      if (artistEl) artistEl.textContent = data.author_name;
    })
    .catch(() => {}); // 取得失敗時はプレースホルダーのまま
});

/* ---------- ナビゲーション スクロール ---------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- ハンバーガーメニュー ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// メニュー内リンクをタップしたら閉じる
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

/* ---------- スクロールアニメーション ---------- */
const aosItems = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // カード類は少しずつ遅延させる
        const delay = entry.target.closest('.works-grid, .services-grid, .pricing-grid')
          ? [...entry.target.parentElement.children].indexOf(entry.target) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

aosItems.forEach(el => observer.observe(el));

/* ---------- 料金プランボタン → フォームのサービス自動選択 ---------- */
document.querySelectorAll('.plan-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const plan = btn.dataset.plan;
    const select = document.getElementById('service');
    if (plan && select) select.value = plan;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('name').focus(), 600);
  });
});

/* ---------- コンタクトフォームのバリデーション ---------- */
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('submit-btn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const formSuccess = document.getElementById('form-success');

function validateField(id, errId, check, message) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  if (!check(el.value)) {
    el.classList.add('error');
    err.textContent = message;
    return false;
  }
  el.classList.remove('error');
  err.textContent = '';
  return true;
}

function validateAll() {
  const nameOk = validateField('name', 'name-error',
    v => v.trim().length >= 1, 'お名前を入力してください。');
  const emailOk = validateField('email', 'email-error',
    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), '正しいメールアドレスを入力してください。');
  const msgOk = validateField('message', 'message-error',
    v => v.trim().length >= 10, 'メッセージは10文字以上入力してください。');
  return nameOk && emailOk && msgOk;
}

// リアルタイムバリデーション（一度送信しようとした後）
let submitted = false;
['name', 'email', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    if (submitted) validateAll();
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitted = true;

  if (!validateAll()) return;

  // ローディング表示
  btnText.hidden = true;
  btnLoading.hidden = false;
  submitBtn.disabled = true;

  const data = new FormData(form);
  const res = await fetch('https://formspree.io/f/mykbdznl', {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  });

  if (res.ok) {
    form.hidden = true;
    formSuccess.hidden = false;
  } else {
    btnText.hidden = false;
    btnLoading.hidden = true;
    submitBtn.disabled = false;
    alert('送信に失敗しました。時間をおいて再度お試しください。');
  }
});
