// caalm web - Background service worker
// Provides right-click "Block this element" context menu

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'caalm-block-element',
    title: 'Block this element with caalm',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'caalm-view-blocklist',
    title: 'View my caalm blocklist',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'caalm-block-element') {
    // Inject the element picker into the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: startElementPicker
    });
  }

  if (info.menuItemId === 'caalm-view-blocklist') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showBlocklist
    });
  }
});

// Element picker - injected into the page when user right-clicks "Block this element"
function startElementPicker() {
  // Prevent double-activation
  if (document.getElementById('caalm-picker-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'caalm-picker-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483646;cursor:crosshair;';

  const highlight = document.createElement('div');
  highlight.id = 'caalm-picker-highlight';
  highlight.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #99B59A;background:rgba(153,181,154,0.2);transition:all 0.1s ease;';
  document.body.appendChild(highlight);

  const tooltip = document.createElement('div');
  tooltip.id = 'caalm-picker-tooltip';
  tooltip.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#556455;color:white;padding:10px 20px;border-radius:8px;font-family:system-ui;font-size:14px;pointer-events:none;';
  tooltip.textContent = 'Click an element to block it. Press Esc to cancel.';
  document.body.appendChild(tooltip);

  let hoveredElement = null;

  overlay.addEventListener('mousemove', (e) => {
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';

    if (el && el !== overlay && el !== highlight && el !== tooltip) {
      hoveredElement = el;
      const rect = el.getBoundingClientRect();
      highlight.style.top = rect.top + 'px';
      highlight.style.left = rect.left + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';

      const selector = generateSelector(el);
      tooltip.textContent = `Click to block: ${selector.substring(0, 80)}${selector.length > 80 ? '...' : ''}`;
    }
  });

  overlay.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hoveredElement) return;

    const selector = generateSelector(hoveredElement);
    const domain = window.location.hostname;

    // Confirm with the user
    const confirmDiv = document.createElement('div');
    confirmDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483647;background:white;padding:24px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:system-ui;max-width:500px;width:90%;';
    confirmDiv.innerHTML = `
      <h3 style="margin:0 0 12px;color:#556455;font-size:16px;">Block this element?</h3>
      <p style="margin:0 0 8px;font-size:13px;color:#666;">Selector:</p>
      <code style="display:block;background:#f5f5f5;padding:8px;border-radius:4px;font-size:12px;word-break:break-all;margin:0 0 12px;">${selector}</code>
      <p style="margin:0 0 16px;font-size:13px;color:#666;">Domain: ${domain}</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="caalm-cancel" style="padding:8px 16px;border:1px solid #ccc;border-radius:6px;background:white;cursor:pointer;font-size:13px;">Cancel</button>
        <button id="caalm-block-this" style="padding:8px 16px;border:none;border-radius:6px;background:#99B59A;color:white;cursor:pointer;font-size:13px;">Block on this site</button>
        <button id="caalm-block-all" style="padding:8px 16px;border:none;border-radius:6px;background:#556455;color:white;cursor:pointer;font-size:13px;">Block everywhere</button>
      </div>
    `;

    // Clean up picker
    overlay.remove();
    highlight.remove();
    tooltip.remove();

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483646;background:rgba(0,0,0,0.3);';
    document.body.appendChild(backdrop);
    document.body.appendChild(confirmDiv);

    function cleanup() {
      confirmDiv.remove();
      backdrop.remove();
    }

    confirmDiv.querySelector('#caalm-cancel').addEventListener('click', cleanup);
    backdrop.addEventListener('click', cleanup);

    confirmDiv.querySelector('#caalm-block-this').addEventListener('click', () => {
      saveBlockRule(selector, domain);
      hoveredElement.style.display = 'none';
      cleanup();
      showToast('Element blocked on ' + domain);
    });

    confirmDiv.querySelector('#caalm-block-all').addEventListener('click', () => {
      saveBlockRule(selector, '*');
      hoveredElement.style.display = 'none';
      cleanup();
      showToast('Element blocked on all sites');
    });
  });

  function handleEsc(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      highlight.remove();
      tooltip.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  }
  document.addEventListener('keydown', handleEsc);
  document.body.appendChild(overlay);

  function generateSelector(el) {
    // Try ID first
    if (el.id) return '#' + CSS.escape(el.id);

    // Try unique class combination
    if (el.classList.length > 0) {
      const classes = Array.from(el.classList).map(c => '.' + CSS.escape(c)).join('');
      if (document.querySelectorAll(classes).length === 1) return classes;
    }

    // Try data attributes (common in modern SPAs)
    for (const attr of el.attributes) {
      if (attr.name.startsWith('data-') && attr.value) {
        const sel = `[${attr.name}="${CSS.escape(attr.value)}"]`;
        if (document.querySelectorAll(sel).length <= 3) return sel;
      }
    }

    // Build a path: tag.class or tag[attr]
    const parts = [];
    let current = el;
    while (current && current !== document.body && parts.length < 4) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part = '#' + CSS.escape(current.id);
        parts.unshift(part);
        break;
      } else if (current.classList.length > 0) {
        part += Array.from(current.classList).slice(0, 2).map(c => '.' + CSS.escape(c)).join('');
      }
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function saveBlockRule(selector, domain) {
    chrome.storage.local.get({ caalmBlocklist: [] }, (data) => {
      const list = data.caalmBlocklist;
      // Avoid duplicates
      if (!list.some(r => r.selector === selector && r.domain === domain)) {
        list.push({
          selector,
          domain,
          addedAt: new Date().toISOString(),
          url: window.location.href
        });
        chrome.storage.local.set({ caalmBlocklist: list });
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#556455;color:white;padding:12px 24px;border-radius:8px;font-family:system-ui;font-size:14px;animation:caalm-fade 2s forwards;';
    toast.textContent = message;
    const style = document.createElement('style');
    style.textContent = '@keyframes caalm-fade{0%,70%{opacity:1}100%{opacity:0}}';
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); style.remove(); }, 2000);
  }
}

// Show blocklist panel - injected when user clicks "View my caalm blocklist"
function showBlocklist() {
  // Remove existing panel
  const existing = document.getElementById('caalm-blocklist-panel');
  if (existing) { existing.remove(); return; }

  chrome.storage.local.get({ caalmBlocklist: [] }, (data) => {
    const list = data.caalmBlocklist;
    const domain = window.location.hostname;

    const panel = document.createElement('div');
    panel.id = 'caalm-blocklist-panel';
    panel.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2147483647;background:white;padding:20px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:system-ui;max-width:450px;width:90%;max-height:80vh;overflow-y:auto;';

    let html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:#556455;font-size:16px;">caalm blocklist</h3>
        <button id="caalm-close-panel" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999;">&times;</button>
      </div>
    `;

    if (list.length === 0) {
      html += '<p style="color:#999;font-size:13px;">No blocked elements yet. Right-click any element and choose "Block this element with caalm" to get started.</p>';
    } else {
      // Group by domain
      const byDomain = {};
      list.forEach((rule, i) => {
        const key = rule.domain === '*' ? 'All sites' : rule.domain;
        if (!byDomain[key]) byDomain[key] = [];
        byDomain[key].push({ ...rule, index: i });
      });

      for (const [dom, rules] of Object.entries(byDomain)) {
        html += `<h4 style="margin:12px 0 6px;color:#93805E;font-size:13px;text-transform:uppercase;">${dom}</h4>`;
        for (const rule of rules) {
          html += `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
              <code style="flex:1;font-size:11px;color:#333;word-break:break-all;">${rule.selector}</code>
              <button class="caalm-remove-rule" data-index="${rule.index}" style="background:none;border:none;color:#e55;cursor:pointer;font-size:16px;" title="Remove">&times;</button>
            </div>
          `;
        }
      }

      html += `
        <div style="margin-top:16px;display:flex;gap:8px;">
          <button id="caalm-export" style="flex:1;padding:8px;border:1px solid #99B59A;border-radius:6px;background:white;color:#556455;cursor:pointer;font-size:12px;">Copy for contributing</button>
          <button id="caalm-clear-all" style="padding:8px 12px;border:1px solid #e55;border-radius:6px;background:white;color:#e55;cursor:pointer;font-size:12px;">Clear all</button>
        </div>
      `;
    }

    panel.innerHTML = html;
    document.body.appendChild(panel);

    panel.querySelector('#caalm-close-panel').addEventListener('click', () => panel.remove());

    // Remove individual rules
    panel.querySelectorAll('.caalm-remove-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        list.splice(idx, 1);
        chrome.storage.local.set({ caalmBlocklist: list }, () => {
          panel.remove();
          showBlocklist(); // Re-render
        });
      });
    });

    // Export for contributing
    const exportBtn = panel.querySelector('#caalm-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        // Format as CSS for nolist.css contribution
        const cssRules = list.map(r => {
          const comment = r.domain === '*' ? '/* universal */' : `/* ${r.domain} */`;
          return `${comment}\n${r.selector}`;
        }).join(',\n');
        const output = `/* caalm user-contributed block rules */\n${cssRules}\n{display: none !important;}`;
        navigator.clipboard.writeText(output).then(() => {
          exportBtn.textContent = 'Copied!';
          setTimeout(() => { exportBtn.textContent = 'Copy for contributing'; }, 1500);
        });
      });
    }

    // Clear all
    const clearBtn = panel.querySelector('#caalm-clear-all');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Remove all blocked elements?')) {
          chrome.storage.local.set({ caalmBlocklist: [] }, () => {
            panel.remove();
            showBlocklist();
          });
        }
      });
    }
  });
}
