/* ============================================================
   プチゴル つくば店 ティザーLP — スクリプト（最小限・ビルド不要）

   ★編集するのは下の SITE だけ。
   - [data-line]  … 全LINEボタンの href を SITE.lineUrl に置換（未設定なら #cta のまま）
   - [data-text]  … <span data-text="openDate"> 等を SITE の同名キーで上書き（空なら非表示）
   - [data-cta]   … クリックを dataLayer（GTM）へ送信。gtag / fbq があれば直接も発火
   ============================================================ */

// ▼編集ここから（サイト設定：ここを直せば全ページに反映）
var SITE = {
  // LINE公式アカウントの友だち追加URL（例: 'https://lin.ee/xxxxxxx'）。未発行の間は空のままでOK
  lineUrl: '',

  // グランドオープン時期の表記（FVバッジ・流れ・FAQ・アクセスに反映）
  openDate: '2026年12月1日',

  // 入会金0円キャンペーンの注記（FV・特典・料金・FAQ・最終CTAの5箇所に同文で表示）
  campaignNote: '※入会金0円は6ヶ月間のご継続が条件です（6ヶ月未満のご退会は違約金22,000円）。表示価格はすべて税込。',

  // 先着表記（例: '先着50名様限定'）。実数が確定するまで空＝非表示
  campaignLimit: ''
};
// ▲編集ここまで

// 年号
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// 文言の一括反映：<span data-text="キー"> を SITE[キー] で上書き（空文字なら要素ごと非表示）
(function () {
  document.querySelectorAll('[data-text]').forEach(function (el) {
    var key = el.getAttribute('data-text');
    if (!Object.prototype.hasOwnProperty.call(SITE, key)) return;
    var value = SITE[key];
    if (typeof value !== 'string') return;
    if (value.trim() === '') {
      el.hidden = true;
      return;
    }
    el.textContent = value;
    el.hidden = false;
  });
})();

// LINEボタンのリンク先を一括設定：<a data-line> の href を SITE.lineUrl に置換
(function () {
  var url = (SITE.lineUrl || '').trim();
  if (!url) return; // 未設定のときは href="#cta"（最終CTAのQR枠へスクロール）のまま
  document.querySelectorAll('[data-line]').forEach(function (a) {
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });
})();

// CTAクリック計測：data-cta="..." のクリックを dataLayer（GTM）へ送る
// GTM側：カスタムイベント cta_click → GA4イベント line_click（キーイベント）／Google広告CV／Meta Pixel Lead
(function () {
  window.dataLayer = window.dataLayer || [];

  function track(label) {
    window.dataLayer.push({ event: 'cta_click', cta_label: label, cta_type: 'line' });
    // GTMを使わず直接タグを貼った場合のフォールバック
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', { cta_label: label });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'CTAClick', { label: label });
    }
  }

  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-cta'));
    });
  });
})();
