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
      };
    },

    applyState: function (s) {
      var ids = ['test-material', 'test-site', 'skin-sensitivity'];
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
      return {
        t: 'Patch Test Protocol: ' + selText('test-material'),
        d: [
          ['Material', selText('test-material') || val('test-material')],
          ['Test site', selText('test-site') || val('test-site')],
          ['Sensitivity', selText('skin-sensitivity') || val('skin-sensitivity')],
          ['Protocol', el.textContent.trim().substring(0, 200)],
        ],
      };
    },
  });
})();
