// The floor plan lights the room of whichever project is being read or pointed at.
(function () {
  'use strict';

  var plan = document.querySelector('.plan');
  var idle = document.querySelector('.cap-idle');
  var lit = document.querySelector('.cap-lit');
  var capName = document.querySelector('.cap-name');
  var capWhere = document.querySelector('.cap-where');
  var devices = {};
  var entries = {};
  var hoverId = null;
  var scrollId = null;
  var shown = null;
  var litFloor = null;

  if (plan) {
    plan.querySelectorAll('.dev').forEach(function (dev) { devices[dev.dataset.project] = dev; });
  }
  document.querySelectorAll('.project[id]').forEach(function (entry) { entries[entry.id] = entry; });

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

  function show() {
    var id = hoverId || scrollId;
    if (id === shown) return;

    if (shown && devices[shown]) devices[shown].classList.remove('is-lit');
    if (shown && entries[shown]) entries[shown].classList.remove('is-lit');
    if (litFloor) {
      litFloor.el.classList.remove('is-lit', litFloor.color);
      litFloor = null;
    }

    shown = id;
    var dev = id && devices[id];
    if (dev) {
      dev.classList.add('is-lit');
      if (entries[id]) entries[id].classList.add('is-lit');
      var floor = plan.querySelector('.floor[data-room="' + dev.dataset.room + '"]');
      var color = Array.prototype.find.call(dev.classList, function (c) { return c.indexOf('c-') === 0; });
      if (floor && color) {
        floor.classList.add('is-lit', color);
        litFloor = { el: floor, color: color };
      }
    }
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
})();
