// The floor plan lights the room of whichever project is being read or pointed at,
// and the filters narrow the list to the products that share a feature.
(function () {
  'use strict';

  var plan = document.querySelector('.plan');
  var list = document.querySelector('.list');
  var filters = document.querySelector('.filters');
  var note = document.querySelector('.filter-note');
  var idle = document.querySelector('.cap-idle');
  var lit = document.querySelector('.cap-lit');
  var capName = document.querySelector('.cap-name');
  var capWhere = document.querySelector('.cap-where');
  var groups = document.querySelectorAll('.list .group');
  var chips = filters ? filters.querySelectorAll('.chip') : [];
  var devices = {};
  var entries = {};
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
  document.querySelectorAll('.project[id]').forEach(function (entry) { entries[entry.id] = entry; });

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
    // A product the filter left out is hidden; show them all so the link has somewhere to land.
    dev.addEventListener('click', function () {
      if (entries[id] && entries[id].hidden) setFilter('all');
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

  // Filters: each entry lists its features in data-tags; a chip keeps the entries that have its tag.
  function has(id, tag) {
    return tag === 'all' || (entries[id].dataset.tags || '').split(/\s+/).indexOf(tag) !== -1;
  }

  function setFilter(tag) {
    filter = tag;
    chips.forEach(function (chip) {
      var on = chip.dataset.filter === tag;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && note) note.textContent = chip.dataset.note;
    });
    Object.keys(entries).forEach(function (id) {
      var keep = has(id, tag);
      entries[id].hidden = !keep;
      if (devices[id]) {
        devices[id].classList.toggle('is-match', keep && tag !== 'all');
        devices[id].classList.toggle('is-out', !keep);
      }
    });
    groups.forEach(function (group) { group.hidden = !group.querySelector('.project:not([hidden])'); });

    // Past the top of the list, start the reader at the top of the narrowed list.
    var top = list ? list.getBoundingClientRect().top : 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
    paintFloors();
  }

  // Named entries and groups slide to their new places instead of the whole page cross-fading.
  function name(on) {
    Object.keys(entries).forEach(function (id) { entries[id].style.viewTransitionName = on ? 'p-' + id : ''; });
    groups.forEach(function (group, i) { group.style.viewTransitionName = on ? 'g-' + i : ''; });
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
      if (count) count.textContent = Object.keys(entries).filter(function (id) { return has(id, tag); }).length;
      chip.addEventListener('click', function () { pick(tag); });
    });
    if (note) {
      note.textContent = filters.querySelector('[aria-pressed="true"]').dataset.note;
      note.hidden = false;
    }
    filters.hidden = false;
  }
})();
