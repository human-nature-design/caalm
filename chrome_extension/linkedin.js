// LinkedIn - caalm web
// Remove promoted/sponsored posts and LinkedIn News from the feed

const PROMOTED_KEYWORDS = [
  'Promoted', 'Sponsored',
  'Gesponsert', 'Patrocinado', 'Sponsorisé',
  'Promosso', 'Gesponsord', 'Promovido',
];

const JOB_PROMO_KEYWORDS = [
  'Jobs recommended for you',
  'Job search smarter',
  'Grow your network',
  'Claim offer now',
];

function isPromotedPost(element) {
  // LinkedIn marks promoted posts with a small "Promoted" text label
  // Look specifically for the promotion indicator spans
  const spans = element.querySelectorAll('span');
  for (const span of spans) {
    // Only check small text nodes that are exactly a promoted keyword
    // (not partial matches inside longer text)
    const text = span.textContent.trim();
    if (PROMOTED_KEYWORDS.includes(text)) {
      return true;
    }
  }
  return false;
}

function isJobPromo(element) {
  const text = element.textContent;
  return JOB_PROMO_KEYWORDS.some(keyword => text.includes(keyword));
}

function hidePromotedPosts() {
  // Only target the actual feed update containers
  const feedItems = document.querySelectorAll('.feed-shared-update-v2');

  for (const item of feedItems) {
    if (item.dataset.caalmChecked) continue;
    item.dataset.caalmChecked = 'true';

    if (isPromotedPost(item) || isJobPromo(item)) {
      item.style.display = 'none';
      console.log('[caalm] Hid promoted/promo LinkedIn post');
    }
  }
}

function hideJobPromos() {
  // Hide job upsell cards outside the feed (sidebar, standalone sections)
  const cards = document.querySelectorAll('.artdeco-card, section, div[class*="feed"]');
  for (const card of cards) {
    if (card.dataset.caalmJobChecked) continue;
    // Skip feed items — those are handled by hidePromotedPosts()
    if (card.closest('.feed-shared-update-v2')) continue;
    card.dataset.caalmJobChecked = 'true';
    if (isJobPromo(card)) {
      card.style.display = 'none';
      console.log('[caalm] Hid job promo card');
    }
  }
}

function hideNewsAndTrending() {
  // Hide LinkedIn News module
  const newsHeaders = document.querySelectorAll('h2');
  for (const h of newsHeaders) {
    const text = h.textContent.trim();
    if (text.includes('LinkedIn News') || text.includes('Trending')) {
      const card = h.closest('.artdeco-card') || h.closest('section');
      if (card && !card.dataset.caalmHidden) {
        card.style.display = 'none';
        card.dataset.caalmHidden = 'true';
        console.log('[caalm] Hid ' + text);
      }
    }
  }
}

// Run on load with delays for LinkedIn's client-side rendering
hidePromotedPosts();
hideNewsAndTrending();
hideJobPromos();
setTimeout(() => { hidePromotedPosts(); hideNewsAndTrending(); hideJobPromos(); }, 2000);
setTimeout(() => { hidePromotedPosts(); hideNewsAndTrending(); hideJobPromos(); }, 5000);

// Re-check on scroll for lazy-loaded feed items
let scrollTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { hidePromotedPosts(); hideJobPromos(); }, 300);
});
