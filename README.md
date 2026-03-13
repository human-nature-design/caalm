# caalm web

A browser extension that removes ads, dark patterns, and manipulative UI from major websites — making the internet calm and safe for humans.

> For the full motivation and vision behind this project, see [VISION.md](VISION.md).

## What It Does

- **Removes sponsored/promoted content** from Amazon and Facebook
- **Strips tracking elements**, cookie banners, and pop-ups across all sites
- **Applies a calm visual theme** — softer colors, cleaner layouts, custom typography
- **Blocks ads universally** via a curated CSS blocklist (based on EasyList/uBlock Origin filters)

## Supported Sites

| Site | Ads Removed | Visual Reskin | Browser |
|------|:-----------:|:-------------:|---------|
| Amazon | Yes | Yes | Chrome, Firefox |
| Facebook | Yes (multilingual) | Yes | Chrome |
| Kayak | Yes | Partial | — |
| All sites | Yes (CSS blocklist) | — | Chrome |

## Install

1. Clone this repo
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `chrome_extension/` folder


## Project Structure

```
chrome_extension/       # Chrome extension (load from here)
  manifest.json         # Content script injection rules
  amazon.js/css         # Amazon ad removal + calm theme
  facebook.js/css       # Facebook sponsored post hiding + reskin
  nolist.css            # Universal ad-blocking CSS
  fonts/                # Bundled Baloo Bhaina 2 font family

firefox-ext/            # Firefox extension (Amazon only)
```

## How It Works

The extension uses [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) — JavaScript and CSS injected into web pages based on URL matching rules defined in `manifest.json`.

- **CSS**: Hides ad containers, overrides site colors/fonts with a calm palette
- **JavaScript**: Traverses the DOM to find and remove sponsored elements; listens for scroll events to catch dynamically loaded ads

## Tech Stack

- Vanilla JavaScript + CSS (no dependencies, no build step)
- Chrome/Firefox Extension APIs (Manifest V2)

## Contributing

1. Fork the repo
2. Make changes in `chrome_extension/`
3. Load the unpacked extension and test on target sites
4. Open a PR

## License

[MIT](LICENSE) — Copyright 2019 human-nature-design
