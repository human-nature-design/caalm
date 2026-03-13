// caalm web - User Blocklist
// Applies user-added block rules from chrome.storage.local on every page

(function () {
  function applyBlockRules() {
    chrome.storage.local.get({ caalmBlocklist: [] }, (data) => {
      const domain = window.location.hostname;
      const rules = data.caalmBlocklist.filter(
        r => r.domain === '*' || domain.includes(r.domain)
      );

      if (rules.length === 0) return;

      // Build a single stylesheet for all user rules
      let styleEl = document.getElementById('caalm-user-blocklist-style');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'caalm-user-blocklist-style';
        document.head.appendChild(styleEl);
      }

      const css = rules
        .map(r => `${r.selector} { display: none !important; }`)
        .join('\n');
      styleEl.textContent = css;
    });
  }

  // Apply immediately and re-apply periodically for dynamically loaded content
  applyBlockRules();
  setTimeout(applyBlockRules, 1000);
  setTimeout(applyBlockRules, 3000);

  // Re-apply on scroll (catches lazy-loaded elements)
  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(applyBlockRules, 300);
  });

  // Listen for storage changes (when user adds new rules from context menu)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.caalmBlocklist) {
      applyBlockRules();
    }
  });
})();
