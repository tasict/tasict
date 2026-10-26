// The floor plan lights the room of whichever product is being read or pointed at,
// the filters narrow the Homebridge plugins to the ones that share a feature,
// and the app cards keep their launch state, price and "New" line current from the products' own published data.
(function () {
  'use strict';

  var plan = document.querySelector('.plan');
  var list = document.querySelector('.plugins');
  var filters = document.querySelector('.filters');
  var note = document.querySelector('.filter-note');
  var tools = document.getElementById('tools');
  var idle = document.querySelector('.cap-idle');
  var lit = document.querySelector('.cap-lit');
  var capName = document.querySelector('.cap-name');
  var capWhere = document.querySelector('.cap-where');
  var chips = filters ? filters.querySelectorAll('.chip') : [];
  var devices = {};
  var entries = {};
  var plugins = {};
  var floors = [];
  var hoverId = null;
  var scrollId = null;
  var shown = null;
  var filter = 'all';
  var transition = null;

  if (plan) {
    plan.querySelectorAll('.dev').forEach(function (dev) { devices[dev.dataset.project] = dev; });
    plan.querySelectorAll('.floor').forEach(function (el) { floors.push({ el: el, color: null }); });
  }
  // Only the products with a device on the plan take part in lighting it; only the plugins are filtered.
  document.querySelectorAll('.project[id]').forEach(function (entry) {
    if (devices[entry.id]) entries[entry.id] = entry;
  });
  if (list) list.querySelectorAll('.project[id]').forEach(function (entry) { plugins[entry.id] = entry; });

  function colorOf(el) {
    return Array.prototype.find.call(el.classList, function (c) { return c.indexOf('c-') === 0; });
  }

  function renderCaption() {
    if (!idle || !lit) return;
    var dev = shown && devices[shown];
    idle.hidden = !!dev;
    lit.hidden = !dev;
    if (!dev) return;
    var heading = entries[shown] && entries[shown].querySelector('h3');
    capName.textContent = heading ? heading.textContent : '';
    capWhere.textContent = dev.dataset.where;
  }

  // A room takes the color of the device lit in it or, failing that, of a device the filter picked.
  function paintFloors() {
    var litDev = shown && devices[shown];
    floors.forEach(function (floor) {
      var room = floor.el.dataset.room;
      var dev = litDev && litDev.dataset.room === room ? litDev : null;
      var match = dev ? null : plan.querySelector('.dev.is-match[data-room="' + room + '"]');
      if (floor.color) floor.el.classList.remove(floor.color);
      floor.el.classList.toggle('is-lit', !!dev);
      floor.el.classList.toggle('is-match', !!match);
      floor.color = dev || match ? colorOf(dev || match) : null;
      if (floor.color) floor.el.classList.add(floor.color);
    });
  }

  function show() {
    var id = hoverId || scrollId;
    if (id === shown) return;

    if (shown && devices[shown]) devices[shown].classList.remove('is-lit');
    if (shown && entries[shown]) entries[shown].classList.remove('is-lit');

    shown = id;
    var dev = id && devices[id];
    if (dev) {
      dev.classList.add('is-lit');
      if (entries[id]) entries[id].classList.add('is-lit');
    }
    paintFloors();
    renderCaption();
  }

  function point(id) { hoverId = id; show(); }

  Object.keys(entries).forEach(function (id) {
    var entry = entries[id];
    entry.addEventListener('mouseenter', function () { point(id); });
    entry.addEventListener('mouseleave', function () { point(null); });
    entry.addEventListener('focusin', function () { point(id); });
    entry.addEventListener('focusout', function () { point(null); });
  });

  Object.keys(devices).forEach(function (id) {
    var dev = devices[id];
    dev.addEventListener('mouseenter', function () { point(id); });
    dev.addEventListener('mouseleave', function () { point(null); });
    dev.addEventListener('focus', function () { point(id); });
    dev.addEventListener('blur', function () { point(null); });
    // A plugin the filter left out is hidden; show them all so the link has somewhere to land.
    dev.addEventListener('click', function () {
      if (plugins[id] && plugins[id].hidden) setFilter('all');
    });
  });

  // While scrolling the list, the entry crossing the middle of the screen lights its room.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (changes) {
      changes.forEach(function (change) {
        var id = change.target.id;
        if (change.isIntersecting) scrollId = id;
        else if (scrollId === id) scrollId = null;
      });
      show();
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(entries).forEach(function (id) { observer.observe(entries[id]); });
  }

  // Filters: each plugin lists its features in data-tags; a chip keeps the plugins that have its tag.
  // The tools stay listed, and their devices fade back on the plan while a feature is picked.
  function has(id, tag) {
    return tag === 'all' || (plugins[id].dataset.tags || '').split(/\s+/).indexOf(tag) !== -1;
  }

  function setFilter(tag) {
    filter = tag;
    chips.forEach(function (chip) {
      var on = chip.dataset.filter === tag;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && note) note.textContent = chip.dataset.note;
    });
    Object.keys(plugins).forEach(function (id) {
      var keep = has(id, tag);
      plugins[id].hidden = !keep;
      if (devices[id]) {
        devices[id].classList.toggle('is-match', keep && tag !== 'all');
        devices[id].classList.toggle('is-out', !keep);
      }
    });
    Object.keys(devices).forEach(function (id) {
      if (!plugins[id]) devices[id].classList.toggle('is-out', tag !== 'all');
    });

    // Past the top of the plugins, start the reader at the top of the narrowed list.
    var top = list ? list.getBoundingClientRect().top : 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
    paintFloors();
  }

  // Named plugins and the tools below them slide to their new places instead of the whole page cross-fading.
  function name(on) {
    Object.keys(plugins).forEach(function (id) { plugins[id].style.viewTransitionName = on ? 'p-' + id : ''; });
    if (tools) tools.style.viewTransitionName = on ? 'tools' : '';
    filters.style.viewTransitionName = on ? 'filters' : '';
  }

  function pick(tag) {
    if (tag === filter) tag = 'all';
    if (tag === filter) return;
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFilter(tag);
      return;
    }
    name(true);
    var t = transition = document.startViewTransition(function () { setFilter(tag); });
    t.finished.finally(function () {
      if (transition !== t) return;
      transition = null;
      name(false);
    });
  }

  if (filters && list) {
    chips.forEach(function (chip) {
      var tag = chip.dataset.filter;
      var count = chip.querySelector('.chip-n');
      if (count) count.textContent = Object.keys(plugins).filter(function (id) { return has(id, tag); }).length;
      chip.addEventListener('click', function () { pick(tag); });
    });
    if (note) {
      note.textContent = filters.querySelector('[aria-pressed="true"]').dataset.note;
      note.hidden = false;
    }
    filters.hidden = false;
  }

  // App cards. The markup carries each app's state as it was written: data-status is "soon" or "live".
  // An App Store app ("soon" with data-store and data-bundle-id) is looked up in Apple's public lookup
  // service, and once the store has it the card links to it. An app with data-pricing reads its price,
  // and any sale, from its own site. From that, the cards' badges, the "New" line above the heading
  // and the directory's status lines are worked out, so a launch or a sale needs no edit here.
  var home = document.querySelector('[data-new-days]');
  var apps = Array.prototype.slice.call(document.querySelectorAll('.project[data-status]'));
  var stores = {
    mac: { kind: 'mac-software', name: 'the Mac App Store' },
    ios: { kind: 'software', name: 'the App Store' }
  };
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var price = /^US\$\d+(\.\d{2})?$/;

  // A YYYY-MM-DD date (or the start of a longer timestamp) as local midnight.
  function day(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function today() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function getJSON(url) {
    var abort = 'AbortController' in window ? new AbortController() : null;
    var timer = abort ? setTimeout(function () { abort.abort(); }, 5000) : null;
    return fetch(url, { credentials: 'omit', signal: abort ? abort.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .finally(function () { clearTimeout(timer); });
  }

  function lookUp(card) {
    var store = stores[card.dataset.store];
    var id = card.dataset.bundleId;
    if (card.dataset.status !== 'soon' || !store || !id) return Promise.resolve();
    return getJSON('https://itunes.apple.com/lookup?country=us&bundleId=' + encodeURIComponent(id)).then(function (data) {
      var app = data && data.results && data.results[0];
      if (!app || app.bundleId !== id || app.kind !== store.kind || !/^\d+$/.test(String(app.trackId))) return;
      launch(card, store, app);
    }, function () {});
  }

  function launch(card, store, app) {
    card.dataset.status = 'live';
    if (day(app.releaseDate)) card.dataset.released = app.releaseDate.slice(0, 10);

    var links = card.querySelector('.links');
    if (links) {
      var first = links.querySelector('a');
      var get = document.createElement('a');
      get.href = 'https://apps.apple.com/app/id' + app.trackId;
      get.textContent = card.dataset.storeLabel || 'Get it on ' + store.name;
      if (first) first.classList.add('quiet');
      links.insertBefore(get, links.firstChild);
    }

    // The store's price, in US dollars since the lookup asks the US store. A free app can still sell
    // something in the app, so a price the card already states stays unless the store charges for the app.
    if (app.currency !== 'USD' || typeof app.price !== 'number' || app.price < 0) return;
    var text = (app.price === 0 ? 'Free' : 'US$' + app.price.toFixed(2)) + ' on ' + store.name;
    var fact = card.querySelector('[data-fact="price"]');
    if (fact) {
      if (app.price > 0) fact.querySelector('dd').textContent = text;
      return;
    }
    var facts = card.querySelector('.facts');
    if (!facts) return;
    fact = document.createElement('div');
    fact.dataset.fact = 'price';
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = 'Price';
    dd.textContent = text;
    fact.appendChild(dt);
    fact.appendChild(dd);
    facts.appendChild(fact);
  }

  // The price file: { price, sale: null | { price, ends: "YYYY-MM-DD", text: { en: "… {sale} … {ends} … {price}." } } }.
  // A sale shows through the day it ends, as on the product's own site.
  function readPrice(card) {
    var url = card.dataset.pricing;
    if (!url) return Promise.resolve();
    return getJSON(url).then(function (pricing) {
      if (!pricing || !price.test(pricing.price)) return;
      card.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = pricing.price; });

      var line = card.querySelector('.sale');
      var sale = pricing.sale;
      var ends = sale && /^\d{4}-\d{2}-\d{2}$/.test(sale.ends) ? day(sale.ends) : null;
      var text = sale && sale.text && sale.text.en;
      if (!line || !ends || !price.test(sale.price) || typeof text !== 'string' || text.length > 160 || today() > ends) return;
      line.textContent = text
        .replace('{sale}', function () { return sale.price; })
        .replace('{ends}', function () { return ends.getDate() + ' ' + months[ends.getMonth()] + ' ' + ends.getFullYear(); })
        .replace('{price}', function () { return pricing.price; });
      line.hidden = false;
    }, function () {});
  }

  function refresh() {
    var days = parseInt(home && home.dataset.newDays, 10) || 60;
    var now = today();
    var newest = null;
    var newestDay = null;

    apps.forEach(function (card) {
      var live = card.dataset.status === 'live';
      var released = day(card.dataset.released);
      var age = released ? Math.round((now - released) / 864e5) : -1;
      var fresh = live && age >= 0 && age < days;
      var badge = card.querySelector('.status');
      if (badge) {
        badge.textContent = live ? (fresh ? 'New' : '') : 'Coming soon';
        badge.hidden = live && !fresh;
      }
      if (fresh && (!newest || released > newestDay)) {
        newest = card;
        newestDay = released;
      }
    });

    var slot = document.querySelector('.new');
    var link = slot && slot.querySelector('a');
    if (link) {
      if (newest) {
        link.href = newest.dataset.site;
        link.textContent = newest.dataset.newLine;
      }
      slot.hidden = !newest;
    }

    document.querySelectorAll('.directory a[data-section]').forEach(function (tile) {
      var section = document.getElementById(tile.dataset.section);
      var meta = tile.querySelector('.dir-meta');
      if (!section || !meta) return;
      var n = section.querySelectorAll('.project[data-status]').length;
      var live = section.querySelectorAll('.project[data-status="live"]').length;
      var soon = n - live;
      if (!n) return;
      var noun = (tile.dataset.noun || 'app') + (n === 1 ? '' : 's');
      meta.textContent = n + ' ' + noun + ' · ' +
        (soon === 0 ? 'available now' : live === 0 ? 'coming soon' : live + ' available, ' + soon + ' coming soon');
    });
  }

  if (apps.length) {
    refresh();
    if (window.fetch && window.Promise) {
      Promise.all(apps.map(function (card) {
        return Promise.all([lookUp(card), readPrice(card)]);
      })).then(refresh);
    }
  }
})();
