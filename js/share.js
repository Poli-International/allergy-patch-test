/**
 * Shareable result card for Allergy Patch Test Generator (PoliShare).
 */
'use strict';
(function () {
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }
  function selText(id) {
    var el = document.getElementById(id);
    return el && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : '';
  }
  function t(key, params) {
    if (window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, params);
    }
    return key;
  }

  if (typeof PoliShare === 'undefined') {
    return;
  }

  PoliShare.init({
    tool: 'allergy-patch-test',
    mount: '#result',
    getState: function () {
      var mat = val('test-material');
      if (!mat) return null;
      return {
        'test-material': mat,
        'test-site': val('test-site'),
        'skin-sensitivity': val('skin-sensitivity'),
        'start-datetime': val('start-datetime')
      };
    },
    applyState: function (s) {
      var ids = ['test-material', 'test-site', 'skin-sensitivity', 'start-datetime'];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && s[id] !== undefined) el.value = s[id];
      });
      var btn = document.getElementById('gen-btn');
      if (btn) btn.click();
    },
    getCard: function () {
      var el = document.getElementById('result');
      if (!el || !el.textContent.trim()) return null;
      var selectedMat = selText('test-material') || val('test-material');
      return {
        t: t('share.card_title', { material: selectedMat }),
        d: [
          [t('share.material'), selectedMat],
          [t('share.site'), selText('test-site') || val('test-site')],
          [t('share.sensitivity'), selText('skin-sensitivity') || val('skin-sensitivity')],
          [t('share.protocol'), el.textContent.trim().substring(0, 200)],
        ],
      };
    },
  });
})();
