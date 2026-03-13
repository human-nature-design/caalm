// LinkedIn - caalm web
// Remove promoted/sponsored posts and LinkedIn News from the feed

const PROMOTED_KEYWORDS = [
  'Promoted', 'Sponsored',
  'Gesponsert', 'Patrocinado', 'Sponsorisé',
  'Promosso', 'Gesponsord', 'Promovido',
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

function hidePromotedPosts() {
  // Only target the actual feed update containers
  const feedItems = document.querySelectorAll('.feed-shared-update-v2');

  for (const item of feedItems) {
    if (item.dataset.caalmChecked) continue;
    item.dataset.caalmChecked = 'true';

    if (isPromotedPost(item)) {
      item.style.display = 'none';
      console.log('[caalm] Hid promoted LinkedIn post');
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
setTimeout(() => { hidePromotedPosts(); hideNewsAndTrending(); }, 2000);
setTimeout(() => { hidePromotedPosts(); hideNewsAndTrending(); }, 5000);

// Re-check on scroll for lazy-loaded feed items
let scrollTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(hidePromotedPosts, 300);
});
