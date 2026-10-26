# ctsite.cc

Apps for Mac, iPhone and Apple Watch, and free, open-source Homebridge plugins that bring the devices you already own into Apple Home, plus tools for QNAP NAS and Gmail. All products: **[www.ctsite.cc](https://www.ctsite.cc/)**

| Product | What it does |
| --- | --- |
| [Turnout](https://turnout.ctsite.cc/) | A VPN client for macOS that connects to WireGuard servers the way wg-quick does |
| [Peaberry](https://peaberry.ctsite.cc/) | A macOS menu bar app that lets AI agents keep the Mac awake while they work |
| [Wata](https://wata.ctsite.cc/) | Water reminders for iPhone and Apple Watch that log a glass when you hold your iPhone to your bottle |
| [homebridge-roborock-vacuum](https://github.com/tasict/homebridge-roborock-vacuum) | Roborock robot vacuums in Apple Home over HomeKit or Matter, with local control |
| [homebridge-daikin-local-platform](https://github.com/tasict/homebridge-daikin-local-platform) | Daikin air conditioners in Apple Home over HomeKit or Matter, local network only |
| [homebridge-jci-hitachi-platform](https://github.com/tasict/homebridge-jci-hitachi-platform) | Hitachi air conditioners from AirCloud Home (Hitachi Taiwan) in Apple Home |
| [homebridge-panasonic-smart-app](https://github.com/tasict/homebridge-panasonic-smart-app) | Appliances from Panasonic Smart App (Taiwan) in Apple Home |
| [homebridge-mqttthing-ex](https://github.com/tasict/homebridge-mqttthing-ex) | MQTT topics as HomeKit accessories; the maintained successor to homebridge-mqttthing |
| [DownloadCenter](https://github.com/tasict/DownloadCenter) | Download manager for QNAP NAS |
| [pigeon-post-for-gmail](https://github.com/tasict/pigeon-post-for-gmail) | Gmail unread counts and notifications in Chrome |

## This repository

This repository is also the source of [www.ctsite.cc](https://www.ctsite.cc/), served by GitHub Pages from the root of the `master` branch. There is no build step.

| File | Purpose |
| --- | --- |
| `index.html` | The page |
| `site.css` | Styles; color tokens in `:root`, dark mode under `prefers-color-scheme: dark` |
| `site.js` | The floor plan: pointing at or scrolling to a product lights its room. The filters: picking a feature narrows the Homebridge plugins and highlights those devices on the plan. The app cards: launch state, price, "New" badge and line, and the directory's status lines, from the products' own published data |
| `404.html` | Page for unknown addresses |
| `about.html` | Who makes the products, what they are for, the blog article for each, and how to get help |
| `privacy.html` | Privacy policy, with the disclosures AdSense requires |
| `icons/` | Product icons, copied from each product's site |
| `fonts/archivo-latin.woff2` | Archivo variable font (Latin), self-hosted |
| `CNAME` | Custom domain for GitHub Pages |
| `ads.txt` | Authorizes the site's AdSense account to sell ads on ctsite.cc |
| `robots.txt` | Allows crawling and names the sitemap |
| `sitemap.xml` | The pages for search engines, with the date each last changed |

### How the home page is organized

The page opens with a directory of four categories, each a tile linking to its section: Mac (`#desktop`), iPhone & Apple Watch (`#iphone`), Smart home (`#smart-home`) and NAS & Chrome (`#tools`). The Homebridge plugins and the tools sit beside the floor plan, where each is a device in the home; the feature filters apply to the plugins only.

The app cards carry their state as data, so a launch or a price change needs no edit:

- `data-status` is `soon` or `live`. A `soon` card with `data-store` (`mac` or `ios`), `data-bundle-id` and `data-store-label` is looked up in Apple's lookup service (US store); once the store has the app, `site.js` adds the store link and price and switches the card to `live`.
- `data-released` (YYYY-MM-DD) and `data-new-line`: a `live` app released within `data-new-days` (on `<main>`, 60) days gets a "New" badge, and the newest one is named, linked to `data-site`, above the heading.
- `data-pricing` points at a price file on the product's site (Turnout's `pricing.json`). Its price replaces the text in `[data-price]`, and a sale that hasn't ended shows in `.sale`.
- The directory's status lines for `#desktop` and `#iphone` are counted from those cards. The text in the markup is what visitors without JavaScript see, so update it, and the cards' static state, when convenient after a launch.

Any new origin that `site.js` reads from must be added to `connect-src` in the CSP of `index.html` and described in `privacy.html`.

### Adding a product

1. Put the product icon in `icons/` as `.svg` or `.png`, named in lowercase letters, digits and `-`. Copy it from the product's own site instead of linking to it. An icon drawn as a full square (as App Store icons are) gets `class="icon-square"`, which rounds it.
2. In `site.css`, add the brand color to the product colors (one for light, one for dark) and a line `.c-<name> { --c: var(--<name>); }`.
3. In `index.html`, copy a `<li class="project">` into the section for where it runs and change the `id`, the `c-` class, the icon, name, description, facts and links. For an app, set the data attributes above. Add its icon to that category's tile in the directory, and update the tile's line and the counts in its status line.
4. For a Homebridge plugin, set `data-tags` on that `<li>` to the features it has, separated by spaces: `matter` (works with Matter), `local` (controls the device over the home network), `verified` (Verified by Homebridge), `taiwan` (for appliances sold in Taiwan). Leave it out if none apply. A new feature needs its own `<button class="chip">` in `.filters`; the counts on the chips are filled in by `site.js`.
5. To show a plugin or tool on the floor plan, add an `<a class="dev">` to `<g class="devices">`: `href` points to the `id` from step 3, `data-project` is the same `id`, `data-room` is the room (bedroom, study, balcony, kitchen, living, dining, entry) and `data-where` describes the device. Draw it with `class="shape"` outlines and `class="detail"` lines, and optionally a `<g class="fx">` that appears while the device is lit; its animation goes in `site.css`, and its power-on delay in the `nth-child` list there.
6. Add a line for it to `about.html`, and update the `lastmod` dates in `sitemap.xml`.
