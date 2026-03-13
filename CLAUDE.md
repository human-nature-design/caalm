# CLAUDE.md

## Project Overview

**caalm web** is a browser extension that modifies websites' HTML and CSS to remove ads, dark patterns, tracking elements, and manipulative UI — making sites "calm and safe" for humans.

Currently targets: Amazon, Facebook, Kayak (with universal ad-blocking on all sites).
Browsers: Chrome (primary), Firefox (partial).

## Architecture

This is a **zero-dependency, no-build** browser extension. Plain vanilla JavaScript and CSS injected as content scripts via Manifest V3.

### Directory Structure

```
chrome_extension/       # Main Chrome extension (load unpacked from here)
  manifest.json         # Manifest V3 — defines content script injection rules
  amazon.js / amazon.css    # Amazon: removes sponsored products, applies calm theme
  facebook.js / facebook.css # Facebook: hides sponsored posts (multilingual), reskins
  nolist.css            # Universal ad-blocking CSS (applied to all URLs)
  fonts/                # Baloo Bhaina 2 font family (bundled TTFs)
  source_domains/
    facebook_source.css # Raw Facebook CSS tokens (reference/source material)

firefox-ext/            # Firefox extension (Amazon-only, incomplete)
  manifest.json
  amazon-mod.js / amazon.css
```

### How Content Scripts Work

1. `manifest.json` maps URL patterns to JS/CSS files
2. On page load, the browser injects the matched files into the page
3. **CSS files**: Override site styles, hide elements via `display: none`
4. **JS files**: Traverse DOM to find and remove ad elements (e.g., sponsored products); use scroll listeners to catch dynamically loaded content

### Design System

Color palette (CSS variables in amazon.css):
- `--green: #99B59A`, `--green-dark: #556455`
- `--yellow: #E6C893`, `--yellow-dark: #93805E`
- Font: Baloo Bhaina 2 (bundled)

## Development

### Running Locally

**Chrome:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `chrome_extension/` directory

**Firefox:**
1. Go to `about:debugging`
2. Click "Load Temporary Add-on" → select `firefox-ext/manifest.json`

### No build step required — edit files and reload the extension.

### Testing

No automated tests. Test manually by:
1. Loading the extension
2. Visiting target sites (amazon.com, facebook.com)
3. Verifying ads/sponsored content are removed and calm theme is applied

## Known Issues / Tech Debt

- Firefox extension only covers Amazon
- DOM selectors are brittle — site redesigns break them
