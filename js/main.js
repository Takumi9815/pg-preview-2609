/* サイト設定とLINEボタン・計測の共通スクリプト */

// ▼編集ここから（サイト設定：ここを直せば全ページに反映）
var SITE = {
  // LINE公式アカウントの友だち追加URL。LINE管理画面「友だち追加経路」で発行した計測用URLを入れる
  // （生の lin.ee は使わない。経路の作り方は line-official/09-tracking.md）
  // lineUrl は 経路「Webサイト」＝utm無しの訪問者（直接・SNS・自然検索）。ティザーLP・本サイト共通。2026-09-19 発行
  // ※アカウント基本の友だち追加URL（https://lin.ee/uzM1L9C）は経路別に数えられないので使わない
  lineUrl: 'https://lin.ee/qUmVn6e',

  // 広告経由の出し分け：広告のリンク先に ?utm_source=Facebook（または google）を付けると、該当URLに差し替わる
  // → LINE側の 分析 › 友だち › 追加経路 で「Meta広告」「Google広告」別に追加数が分かる（utm 自体は LINE に渡らない）
  lineUrlBySource: {
    meta: 'https://lin.ee/9OYcKWJ',    // 経路「Meta広告」（utm_source=meta / facebook / fb / instagram / ig）
    google: 'https://lin.ee/VdWmz37'   // 経路「Google広告」（utm_source=google / adwords）
  },

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

// 流入元の判定：URLの utm_source から 'meta' / 'google' / 'other' を返す（計測とLINE URLの出し分けで共用）
function getTrafficSource() {
  var src = '';
  try {
    src = (new URLSearchParams(window.location.search).get('utm_source') || '').toLowerCase();
  } catch (e) { /* 古いブラウザは other 扱い */ }
  if (/^(meta|facebook|fb|instagram|ig)$/.test(src)) return 'meta';
  if (/^(google|adwords)$/.test(src)) return 'google';
  return 'other';
}

// LINEボタンのリンク先を一括設定：<a data-line> の href を流入元に応じた友だち追加URLに置換
(function () {
  var source = getTrafficSource();
  var bySource = SITE.lineUrlBySource || {};
  var url = ((source !== 'other' && bySource[source]) || SITE.lineUrl || '').trim();
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

  var source = getTrafficSource();

  function track(label) {
    window.dataLayer.push({ event: 'cta_click', cta_label: label, cta_type: 'line', cta_source: source });
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
