// LinkedIn - caalm web
// Remove promoted/sponsored posts and LinkedIn News from the feed
// Optional filter: hide posts about AI

const AI_KEYWORDS = [
  // Core terms
  'artificial intelligence', 'machine learning', 'deep learning',
  'large language model', 'generative ai', 'gen ai', 'genai',
  'neural network', 'natural language processing',
  'prompt engineering', 'computer vision', 'reinforcement learning',
  'foundation model', 'frontier model', 'diffusion model',
  'reasoning model', 'multimodal', 'transformer model',
  // Agent/agentic terms (catches "Notion agents", "AI agents", etc.)
  'ai agent', 'ai agents', 'agentic', 'autonomous agent',
  // Compound AI phrases
  'ai-powered', 'ai powered', 'ai-driven', 'ai driven',
  'ai-enabled', 'ai enabled', 'ai-first', 'ai first',
  'ai-native', 'ai native', 'ai-generated', 'ai generated',
  'ai transformation', 'ai revolution', 'ai disruption',
  'ai automation', 'ai workflow', 'ai assistant', 'ai chatbot',
  'ai startup', 'ai ethics', 'ai safety', 'ai alignment',
  'ai governance', 'ai regulation', 'ai adoption', 'ai strategy',
  'ai literacy', 'ai infrastructure', 'ai landscape', 'ai ecosystem',
  'ai integration', 'ai tool', 'ai tools', 'ai model',
  'replaced by ai', 'ai will', 'future of ai', 'age of ai',
  'powered by ai', 'built with ai', 'leveraging ai', 'embrace ai',
  'democratizing ai', 'scaling ai', 'responsible ai',
  'superintelligence', 'artificial general intelligence', 'agi',
  // Products & companies
  'openai', 'chatgpt', 'copilot', 'github copilot', 'microsoft copilot',
  'claude', 'anthropic', 'gemini', 'deepmind', 'google ai', 'meta ai',
  'midjourney', 'stable diffusion', 'stability ai', 'dall-e', 'dalle',
  'perplexity', 'hugging face', 'huggingface',
  'mistral', 'cohere', 'deepseek', 'llama',
  'runway', 'sora', 'adobe firefly', 'jasper ai', 'notion ai',
  'grammarly ai', 'cursor ai', 'devin ai', 'amazon q', 'aws bedrock',
  'vertex ai', 'grok', 'qwen',
  'gpt-4', 'gpt-5', 'gpt4', 'gpt5',
  // Technical buzzwords
  'llm', 'llms', 'fine-tuning', 'fine tuning', 'finetuning',
  'retrieval augmented', 'vector database', 'embeddings',
  'rlhf', 'chain of thought', 'context window',
  'text-to-image', 'text-to-video', 'text to image', 'text to video',
  'vibe coding', 'synthetic data', 'mixture of experts',
  'small language model',
  // Hashtags
  '#ai ', '#artificialintelligence', '#machinelearning', '#genai',
  '#aiagents', '#agentic', '#agenticai', '#llm', '#llms',
  '#chatgpt', '#openai', '#claude', '#anthropic',
  '#generativeai', '#promptengineering', '#aitools',
  '#aitransformation', '#futureofai', '#aiethics',
  '#responsibleai', '#aiautomation', '#deeplearning',
  '#deepseek', '#aisafety', '#aistrategy',
];

// Match "AI" as a standalone word (not inside longer words like "said", "email")
const AI_STANDALONE_RE = /\bA\.?I\.?\b/;

let hideAIPosts = false;

// --- Smooth hide/show animation helpers ---

function injectAnimationStyles() {
  if (document.getElementById('caalm-anim-styles')) return;
  const style = document.createElement('style');
  style.id = 'caalm-anim-styles';
  style.textContent = `
    .caalm-hiding {
      overflow: hidden !important;
      opacity: 0 !important;
      max-height: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      transition: opacity 0.3s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease;
    }
    .caalm-hidden {
      display: none !important;
    }
    .caalm-showing {
      overflow: hidden !important;
      transition: opacity 0.3s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

function caalmHide(el) {
  if (!el || el.classList.contains('caalm-hidden') || el.classList.contains('caalm-hiding')) return;

  // Capture current height so we can animate from it
  const height = el.scrollHeight;
  el.style.maxHeight = height + 'px';
  el.style.overflow = 'hidden';

  // Force reflow so the browser registers the starting max-height
  el.offsetHeight;

  el.classList.add('caalm-hiding');

  function onDone() {
    el.removeEventListener('transitionend', onTransEnd);
    clearTimeout(safety);
    el.classList.remove('caalm-hiding');
    el.classList.add('caalm-hidden');
    el.style.maxHeight = '';
    el.style.overflow = '';
  }

  function onTransEnd(e) {
    if (e.target === el) onDone();
  }

  el.addEventListener('transitionend', onTransEnd);
  const safety = setTimeout(onDone, 400);
}

function caalmShow(el) {
  if (!el || !el.classList.contains('caalm-hidden')) return;

  // Clear any hiding state
  el.classList.remove('caalm-hiding', 'caalm-hidden');

  // Start collapsed
  el.style.maxHeight = '0';
  el.style.opacity = '0';
  el.style.overflow = 'hidden';
  el.classList.add('caalm-showing');

  // Force reflow
  el.offsetHeight;

  // Animate to full height
  const height = el.scrollHeight;
  el.style.maxHeight = height + 'px';
  el.style.opacity = '1';

  function onDone() {
    el.removeEventListener('transitionend', onTransEnd);
    clearTimeout(safety);
    el.classList.remove('caalm-showing');
    el.style.maxHeight = '';
    el.style.opacity = '';
    el.style.overflow = '';
  }

  function onTransEnd(e) {
    if (e.target === el) onDone();
  }

  el.addEventListener('transitionend', onTransEnd);
  const safety = setTimeout(onDone, 400);
}

function isAIPost(element) {
  const text = element.textContent.toLowerCase();
  // Check keyword phrases
  if (AI_KEYWORDS.some(kw => text.includes(kw))) return true;
  // Check standalone "AI" on original (case-sensitive) text
  if (AI_STANDALONE_RE.test(element.textContent)) return true;
  return false;
}

function injectFilterToggle() {
  if (document.getElementById('caalm-ai-filter')) return;

  // Find the share box ("Start a post") and insert right after it in the feed
  const shareBox = document.querySelector('.share-box-feed-entry__closed-share-box') ||
                   document.querySelector('.share-box-feed-entry__top-bar') ||
                   document.querySelector('div.share-box-feed-entry');
  const shareCard = shareBox ? shareBox.closest('.artdeco-card') || shareBox.closest('[class*="share-box"]') : null;

  // Fallback: find the feed container's first card or the sort bar
  const sortBar = document.querySelector('.feed-shared-update-v2') ||
                  document.querySelector('[class*="sort-dropdown"]');

  let insertTarget = shareCard || (sortBar ? sortBar.parentElement : null);
  if (!insertTarget) return;

  const toggle = document.createElement('div');
  toggle.id = 'caalm-ai-filter';
  toggle.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin: 8px 0;
    cursor: pointer;
    font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
    font-size: 14px;
    color: #333;
    user-select: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  `;

  // Build toggle switch (custom styled)
  toggle.innerHTML = `
    <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
      <input type="checkbox" id="caalm-ai-toggle" style="
        position: absolute; opacity: 0; width: 100%; height: 100%;
        cursor: pointer; z-index: 1; margin: 0;
      ">
      <div id="caalm-ai-track" style="
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: #ccc; border-radius: 10px; transition: background 0.2s;
      "></div>
      <div id="caalm-ai-thumb" style="
        position: absolute; top: 2px; left: 2px;
        width: 16px; height: 16px;
        background: #fff; border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      "></div>
    </div>
    <span style="flex: 1;">Hide AI posts</span>
    <span style="font-size: 11px; color: #999;">caalm</span>
  `;

  // Insert after the share box card
  if (shareCard && shareCard.parentElement) {
    shareCard.parentElement.insertBefore(toggle, shareCard.nextSibling);
  } else if (sortBar) {
    sortBar.parentElement.insertBefore(toggle, sortBar);
  }

  const checkbox = document.getElementById('caalm-ai-toggle');
  const track = document.getElementById('caalm-ai-track');
  const thumb = document.getElementById('caalm-ai-thumb');

  function updateToggleVisual(checked) {
    track.style.background = checked ? '#556455' : '#ccc';
    thumb.style.transform = checked ? 'translateX(16px)' : 'translateX(0)';
  }

  checkbox.checked = hideAIPosts;
  updateToggleVisual(hideAIPosts);

  // Handle clicks on the entire toggle container — the hidden checkbox
  // doesn't reliably capture clicks because LinkedIn intercepts pointer events
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideAIPosts = !hideAIPosts;
    checkbox.checked = hideAIPosts;
    updateToggleVisual(hideAIPosts);
    if (isContextValid()) chrome.storage.local.set({ caalmHideAI: hideAIPosts });
    applyAIFilter();
  });
}

function applyAIFilter() {
  const feedItems = document.querySelectorAll('.feed-shared-update-v2');
  for (const item of feedItems) {
    // Don't touch posts already hidden by promoted/job filters
    const hiddenByOther = item.dataset.caalmChecked === 'true' &&
      (item.classList.contains('caalm-hidden') || item.classList.contains('caalm-hiding')) &&
      !item.dataset.caalmAIHidden;
    if (hiddenByOther) continue;

    if (isAIPost(item)) {
      if (hideAIPosts) {
        item.dataset.caalmAIHidden = 'true';
        caalmHide(item);
      } else if (item.dataset.caalmAIHidden) {
        delete item.dataset.caalmAIHidden;
        caalmShow(item);
      }
    }
  }
}

// Load saved preference then start
function isContextValid() {
  try { return !!chrome.runtime.id; } catch (e) { return false; }
}

if (isContextValid()) {
  chrome.storage.local.get('caalmHideAI', (result) => {
    hideAIPosts = result.caalmHideAI || false;
    init();
  });
}

function init() {
  injectAnimationStyles();
  injectFilterToggle();
  hidePromotedPosts();
  hideNewsAndTrending();
  hideJobPromos();
  if (hideAIPosts) applyAIFilter();

  setTimeout(() => {
    injectFilterToggle();
    hidePromotedPosts();
    hideNewsAndTrending();
    hideJobPromos();
    if (hideAIPosts) applyAIFilter();
  }, 2000);

  setTimeout(() => {
    injectFilterToggle();
    hidePromotedPosts();
    hideNewsAndTrending();
    hideJobPromos();
    if (hideAIPosts) applyAIFilter();
  }, 5000);

  // Re-check on scroll for lazy-loaded feed items
  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      hidePromotedPosts();
      hideJobPromos();
      if (hideAIPosts) applyAIFilter();
    }, 300);
  });
}

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
      caalmHide(item);
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
      caalmHide(card);
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
        card.dataset.caalmHidden = 'true';
        caalmHide(card);
        console.log('[caalm] Hid ' + text);
      }
    }
  }
}

// Init is called after loading stored preferences (see top of file)
