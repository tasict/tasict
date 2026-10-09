# ctsite.cc

Free, open-source Homebridge plugins that bring the devices you already own into Apple Home, plus tools for QNAP NAS and Gmail. All products: **[www.ctsite.cc](https://www.ctsite.cc/)**

| Product | What it does |
| --- | --- |
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
| `site.js` | The floor plan: pointing at or scrolling to a product lights its room. The filters: picking a feature narrows the list and highlights those devices on the plan |
| `404.html` | Page for unknown addresses |
| `icons/` | Product icons, copied from each product's site |
| `fonts/archivo-latin.woff2` | Archivo variable font (Latin), self-hosted |
| `CNAME` | Custom domain for GitHub Pages |

### Adding a product

1. Put the product icon in `icons/` as `.svg` or `.png`, named in lowercase letters, digits and `-`.
2. In `site.css`, add the brand color to the product colors (one for light, one for dark) and a line `.c-<name> { --c: var(--<name>); }`.
3. In `index.html`, copy a `<li class="project">` into the matching group and change the `id`, the `c-` class, the icon, name, description, facts and links.
4. Set `data-tags` on that `<li>` to the features it has, separated by spaces: `matter` (works with Matter), `local` (controls the device over the home network), `verified` (Verified by Homebridge), `taiwan` (for appliances sold in Taiwan). Leave it out if none apply. A new feature needs its own `<button class="chip">` in `.filters`; the counts on the chips are filled in by `site.js`.
5. To show it on the floor plan, add an `<a class="dev">` to `<g class="devices">`: `href` points to the `id` from step 3, `data-project` is the same `id`, `data-room` is the room (bedroom, study, balcony, kitchen, living, dining, entry) and `data-where` describes the device. Draw it with `class="shape"` outlines and `class="detail"` lines, and optionally a `<g class="fx">` that appears while the device is lit; its animation goes in `site.css`.
