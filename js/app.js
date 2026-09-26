'use strict';

/**
 * Allergy Patch Test Protocol Generator - V2
 * Poli International - Production Tool
 */

(function() {
  function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Cross-link URLs with target="_top"
  var URL_NICKEL_CALC = 'https://poliinternational.com/nickel-release-calculator/';
  var URL_CERT_CHECKER = 'https://poliinternational.com/material-certification-checker/';
  var urlBioflexRef = 'https://poliinternational.com/bioflex/';
  var URL_EU_REG = 'https://eur-lex.europa.eu/eli/reg/2020/2081/oj';

  var MATERIAL_KEYS = {
    'steel':      { risk: 'high',     matName: 'mat.steel.name',     allergen: 'mat_desc.steel.allergen',     prep: 'mat_desc.steel.prep',     apply: 'mat_desc.steel.apply' },
    'titanium':   { risk: 'low',      matName: 'mat.titanium.name',  allergen: 'mat_desc.titanium.allergen',  prep: 'mat_desc.titanium.prep',  apply: 'mat_desc.titanium.apply' },
    'niobium':    { risk: 'low',      matName: 'mat.niobium.name',   allergen: 'mat_desc.niobium.allergen',   prep: 'mat_desc.niobium.prep',   apply: 'mat_desc.niobium.apply' },
    'gold-9':     { risk: 'moderate', matName: 'mat.gold9.name',     allergen: 'mat_desc.gold9.allergen',     prep: 'mat_desc.gold9.prep',     apply: 'mat_desc.gold9.apply' },
    'gold-18':    { risk: 'low',      matName: 'mat.gold18.name',    allergen: 'mat_desc.gold18.allergen',    prep: 'mat_desc.gold18.prep',    apply: 'mat_desc.gold18.apply' },
    'silver':     { risk: 'moderate', matName: 'mat.silver.name',    allergen: 'mat_desc.silver.allergen',    prep: 'mat_desc.silver.prep',    apply: 'mat_desc.silver.apply' },
    'bioflex':    { risk: 'very_low', matName: 'mat.bioflex.name',   allergen: 'mat_desc.bioflex.allergen',   prep: 'mat_desc.bioflex.prep',   apply: 'mat_desc.bioflex.apply' },
    'ptfe':       { risk: 'very_low', matName: 'mat.ptfe.name',      allergen: 'mat_desc.ptfe.allergen',      prep: 'mat_desc.ptfe.prep',      apply: 'mat_desc.ptfe.apply' },
    'ink-black':  { risk: 'low',      matName: 'mat.ink_black.name', allergen: 'mat_desc.ink_black.allergen', prep: 'mat_desc.ink_black.prep', apply: 'mat_desc.ink_black.apply' },
    'ink-colour': { risk: 'moderate', matName: 'mat.ink_colour.name',allergen: 'mat_desc.ink_colour.allergen',prep: 'mat_desc.ink_colour.prep',apply: 'mat_desc.ink_colour.apply' },
    'numbing':    { risk: 'moderate', matName: 'mat.numbing.name',   allergen: 'mat_desc.numbing.allergen',   prep: 'mat_desc.numbing.prep',   apply: 'mat_desc.numbing.apply' }
  };

  var SITE_KEYS = {
    'inner-arm':   'site.inner_arm',
    'behind-ear':  'site.behind_ear',
    'wrist':       'site.wrist',
    'behind-knee': 'site.behind_knee'
  };

  var SENSITIVITY_KEYS = {
    'normal':        'sens.normal',
    'sensitive':     'sens.sensitive',
    'contact-derm':  'sens.contact_derm',
    'metal-allergy': 'sens.metal_allergy'
  };

  var SENSITIVITY_NOTE_KEYS = {
    'sensitive':     'sens_note.sensitive',
    'contact-derm':  'sens_note.contact_derm',
    'metal-allergy': 'sens_note.metal_allergy'
  };

  var activeTab = 'generator'; // 'generator' or 'method'
  var lastGeneratedState = null;

  function t(key, params) {
    if (window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, params);
    }
    return key;
  }

  // Format local date cleanly: YYYY-MM-DDTHH:mm
  function toLocalIsoDateTime(d) {
    var pad = function(n) { return (n < 10 ? '0' : '') + n; };
    var year = d.getFullYear();
    var month = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    var hours = pad(d.getHours());
    var minutes = pad(d.getMinutes());
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
  }

  // Format human-readable local date and time: e.g. "Thu, 25 Sep, 14:30"
  function formatHumanDateTime(d, lang) {
    try {
      var options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      };
      return d.toLocaleDateString(lang || 'en', options);
    } catch (e) {
      var pad = function(n) { return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
  }

  // Format iCalendar DTSTART / DTEND string (UTC format: YYYYMMDDTHHMMSSZ)
  function toIcsUtc(d) {
    var pad = function(n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + 'Z';
  }

  // Inline SVG reaction morphology diagrams (shapes & patterns so color is not only carrier of meaning)
  function getReactionSvg(type) {
    if (type === 'neg') {
      return '<svg class="reaction-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
        '<circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5" />' +
        '<path d="M14 24l7 7 13-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />' +
        '</svg>';
    } else if (type === 'doubt') {
      return '<svg class="reaction-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
        '<circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 3" />' +
        '<path d="M19 19a5 5 0 0 1 9.5 2c0 3-4.5 3.5-4.5 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />' +
        '<circle cx="24" cy="33" r="2" fill="currentColor" />' +
        '</svg>';
    } else {
      return '<svg class="reaction-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
        '<path d="M24 4L44 40H4L24 4z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />' +
        '<line x1="24" y1="17" x2="24" y2="28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />' +
        '<circle cx="24" cy="34" r="2" fill="currentColor" />' +
        '</svg>';
    }
  }

  // Generate .ics calendar file content
  function generateIcs(startD, matName) {
    var now = new Date();
    var stamp = toIcsUtc(now);

    var checkpoints = [
      {
        hours: 24,
        title: t('ics.h24_title', { material: matName }),
        desc: t('ics.h24_desc')
      },
      {
        hours: 48,
        title: t('ics.h48_title', { material: matName }),
        desc: t('ics.h48_desc')
      },
      {
        hours: 72,
        title: t('ics.h72_title', { material: matName }),
        desc: t('ics.h72_desc')
      },
      {
        hours: 96,
        title: t('ics.h96_title', { material: matName }),
        desc: t('ics.h96_desc')
      }
    ];

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Poli International//Patch Test Protocol//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    for (var i = 0; i < checkpoints.length; i++) {
      var cp = checkpoints[i];
      var evtStart = new Date(startD.getTime() + cp.hours * 3600 * 1000);
      var evtEnd = new Date(evtStart.getTime() + 15 * 60 * 1000); // 15 min reminder
      var uid = 'patch-test-' + cp.hours + 'h-' + evtStart.getTime() + '@poliinternational.com';

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid);
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART:' + toIcsUtc(evtStart));
      lines.push('DTEND:' + toIcsUtc(evtEnd));
      lines.push('SUMMARY:' + cp.title);
      lines.push('DESCRIPTION:' + cp.desc);
      lines.push('STATUS:CONFIRMED');
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT15M');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:' + t('ics.alarm_desc', { title: cp.title }));
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  // Trigger browser download of .ics file
  function downloadIcsFile(icsContent, filename) {
    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'patch-test-schedule.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  // Copy schedule text to clipboard
  function copyScheduleToClipboard(scheduleText, btnEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(scheduleText).then(function() {
        showCopyFeedback(btnEl);
      }).catch(function() {
        fallbackCopy(scheduleText, btnEl);
      });
    } else {
      fallbackCopy(scheduleText, btnEl);
    }
  }

  function fallbackCopy(text, btnEl) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(btnEl);
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function showCopyFeedback(btnEl) {
    if (!btnEl) return;
    var orig = btnEl.innerHTML;
    btnEl.textContent = t('reminder.copied');
    btnEl.disabled = true;
    setTimeout(function() {
      btnEl.innerHTML = orig;
      btnEl.disabled = false;
    }, 2000);
  }

  // Render documentation tab content
  function renderMethodDocumentation() {
    var container = document.getElementById('method-content');
    if (!container) return;

    var html = '<div class="doc-card">' +
      '<h2 class="doc-title">' + escHtml(t('doc.title')) + '</h2>' +

      '<div class="doc-section">' +
        '<h3 class="doc-sec-title">' + escHtml(t('doc.sec1_title')) + '</h3>' +
        '<p class="doc-sec-text">' + escHtml(t('doc.sec1_text')) + '</p>' +
      '</div>' +

      '<div class="doc-section">' +
        '<h3 class="doc-sec-title">' + escHtml(t('doc.sec2_title')) + '</h3>' +
        '<p class="doc-sec-text">' + escHtml(t('doc.sec2_text')) + '</p>' +
      '</div>' +

      '<div class="doc-section">' +
        '<h3 class="doc-sec-title">' + escHtml(t('doc.sec3_title')) + '</h3>' +
        '<ul class="doc-limits-list">' +
          '<li><strong>' + escHtml(t('doc.sec3_item1').split(':')[0]) + ':</strong>' + escHtml(t('doc.sec3_item1').split(':')[1] || '') + '</li>' +
          '<li><strong>' + escHtml(t('doc.sec3_item2').split(':')[0]) + ':</strong>' + escHtml(t('doc.sec3_item2').split(':')[1] || '') + '</li>' +
          '<li><strong>' + escHtml(t('doc.sec3_item3').split(':')[0]) + ':</strong>' + escHtml(t('doc.sec3_item3').split(':')[1] || '') + '</li>' +
          '<li><strong>' + escHtml(t('doc.sec3_item4').split(':')[0]) + ':</strong>' + escHtml(t('doc.sec3_item4').split(':')[1] || '') + '</li>' +
        '</ul>' +
      '</div>' +

      '<div class="doc-disclaimer">' +
        '<strong>' + escHtml(t('disclaimer.title')) + ':</strong> ' +
        escHtml(t('disclaimer.text')) +
      '</div>' +
    '</div>';

    container.innerHTML = html;
  }

  // Update dynamic translations on static DOM elements
  function updateStaticLabels() {
    if (window.i18n && typeof window.i18n.translatePage === 'function') {
      window.i18n.translatePage();
    } else {
      var el;
      el = document.getElementById('app-badge');
      if (el) el.textContent = t('app.badge');
      el = document.getElementById('app-title');
      if (el) el.textContent = t('app.title');
      el = document.getElementById('app-subtitle');
      if (el) el.textContent = t('app.subtitle');
      el = document.getElementById('tab-btn-generator');
      if (el) el.textContent = t('nav.generator');
      el = document.getElementById('tab-btn-method');
      if (el) el.textContent = t('nav.method');
      el = document.getElementById('lbl-lang');
      if (el) el.textContent = t('app.lang_label');
      el = document.getElementById('lbl-test-material');
      if (el) el.textContent = t('form.material.label');
      el = document.getElementById('lbl-test-site');
      if (el) el.textContent = t('form.site.label');
      el = document.getElementById('lbl-skin-sensitivity');
      if (el) el.textContent = t('form.sensitivity.label');
      el = document.getElementById('lbl-start-time');
      if (el) el.textContent = t('form.start_time.label');
      el = document.getElementById('hint-start-time');
      if (el) el.textContent = t('form.start_time.hint');
      el = document.getElementById('btn-set-now');
      if (el) el.textContent = t('form.start_time.btn_now');
      el = document.getElementById('gen-btn');
      if (el) el.textContent = t('form.submit');
      el = document.getElementById('main-disclaimer-title');
      if (el) el.textContent = t('disclaimer.title_label');
      el = document.getElementById('main-disclaimer-text');
      if (el) el.textContent = t('disclaimer.text');
    }

    // Update dropdown options
    updateDropdownOptions();
  }

  function updateDropdownOptions() {
    var matSelect = document.getElementById('test-material');
    if (matSelect) {
      var curVal = matSelect.value;
      matSelect.innerHTML = '<option value="">' + escHtml(t('form.material.placeholder')) + '</option>' +
        '<optgroup label="' + escHtml(t('form.group.metals')) + '">' +
          '<option value="steel">' + escHtml(t('mat.steel.name')) + '</option>' +
          '<option value="titanium">' + escHtml(t('mat.titanium.name')) + '</option>' +
          '<option value="niobium">' + escHtml(t('mat.niobium.name')) + '</option>' +
          '<option value="gold-9">' + escHtml(t('mat.gold9.name')) + '</option>' +
          '<option value="gold-18">' + escHtml(t('mat.gold18.name')) + '</option>' +
          '<option value="silver">' + escHtml(t('mat.silver.name')) + '</option>' +
        '</optgroup>' +
        '<optgroup label="' + escHtml(t('form.group.polymers')) + '">' +
          '<option value="bioflex">' + escHtml(t('mat.bioflex.name')) + '</option>' +
          '<option value="ptfe">' + escHtml(t('mat.ptfe.name')) + '</option>' +
        '</optgroup>' +
        '<optgroup label="' + escHtml(t('form.group.tattoos')) + '">' +
          '<option value="ink-black">' + escHtml(t('mat.ink_black.name')) + '</option>' +
          '<option value="ink-colour">' + escHtml(t('mat.ink_colour.name')) + '</option>' +
          '<option value="numbing">' + escHtml(t('mat.numbing.name')) + '</option>' +
        '</optgroup>';
      matSelect.value = curVal;
    }

    var siteSelect = document.getElementById('test-site');
    if (siteSelect) {
      var curSite = siteSelect.value || 'inner-arm';
      siteSelect.innerHTML = '<option value="inner-arm">' + escHtml(t('site.inner_arm')) + '</option>' +
        '<option value="behind-ear">' + escHtml(t('site.behind_ear')) + '</option>' +
        '<option value="wrist">' + escHtml(t('site.wrist')) + '</option>' +
        '<option value="behind-knee">' + escHtml(t('site.behind_knee')) + '</option>';
      siteSelect.value = curSite;
    }

    var sensSelect = document.getElementById('skin-sensitivity');
    if (sensSelect) {
      var curSens = sensSelect.value || 'normal';
      sensSelect.innerHTML = '<option value="normal">' + escHtml(t('sens.normal')) + '</option>' +
        '<option value="sensitive">' + escHtml(t('sens.sensitive')) + '</option>' +
        '<option value="contact-derm">' + escHtml(t('sens.contact_derm')) + '</option>' +
        '<option value="metal-allergy">' + escHtml(t('sens.metal_allergy')) + '</option>';
      sensSelect.value = curSens;
    }
  }

  // Switch between Protocol Generator and Method documentation tabs
  function switchTab(tabId) {
    activeTab = tabId;
    var genView = document.getElementById('view-generator');
    var methodView = document.getElementById('view-method');
    var btnGen = document.getElementById('tab-btn-generator');
    var btnMethod = document.getElementById('tab-btn-method');

    if (tabId === 'generator') {
      if (genView) genView.removeAttribute('hidden');
      if (methodView) methodView.setAttribute('hidden', '');
      if (btnGen) btnGen.classList.add('tab-btn--active');
      if (btnMethod) btnMethod.classList.remove('tab-btn--active');
    } else {
      if (genView) genView.setAttribute('hidden', '');
      if (methodView) methodView.removeAttribute('hidden');
      if (btnGen) btnGen.classList.remove('tab-btn--active');
      if (btnMethod) btnMethod.classList.add('tab-btn--active');
      renderMethodDocumentation();
    }
  }

  // Validation function
  function validateInputs() {
    var matSelect = document.getElementById('test-material');
    var errBox = document.querySelector('.validation-error');
    if (errBox) errBox.remove();

    if (!matSelect || !matSelect.value) {
      if (matSelect) matSelect.classList.add('input-error');
      var err = document.createElement('div');
      err.className = 'validation-error';
      err.setAttribute('role', 'alert');
      err.textContent = t('form.error.no_material');
      if (matSelect && matSelect.parentNode) {
        matSelect.parentNode.appendChild(err);
        matSelect.focus();
      }
      return false;
    }

    var dateInput = document.getElementById('start-datetime');
    if (dateInput && dateInput.value) {
      var d = new Date(dateInput.value);
      if (isNaN(d.getTime())) {
        var dErr = document.createElement('div');
        dErr.className = 'validation-error';
        dErr.setAttribute('role', 'alert');
        dErr.textContent = t('form.error.invalid_date');
        dateInput.parentNode.appendChild(dErr);
        dateInput.focus();
        return false;
      }
    }

    return true;
  }

  // Core Protocol Generation function
  function generate() {
    if (!validateInputs()) return;

    var matVal = document.getElementById('test-material').value;
    var siteVal = document.getElementById('test-site').value;
    var sensVal = document.getElementById('skin-sensitivity').value;
    var dateVal = document.getElementById('start-datetime').value;

    lastGeneratedState = {
      material: matVal,
      site: siteVal,
      sensitivity: sensVal,
      startDatetime: dateVal
    };

    renderProtocol(lastGeneratedState);
  }

  function renderProtocol(state) {
    var resultContainer = document.getElementById('result');
    if (!resultContainer) return;

    var matConfig = MATERIAL_KEYS[state.material];
    if (!matConfig) return;

    var matName = t(matConfig.matName);
    var siteName = t(SITE_KEYS[state.site] || 'site.inner_arm');
    var riskText = t('risk.' + matConfig.risk);

    // Prepare cross-links with target="_top" or rel="noopener noreferrer"
    var nickelLinkHtml = '<a href="' + URL_NICKEL_CALC + '" class="cross-link" target="_top" rel="noopener noreferrer">' + escHtml(t('links.nickel_calc')) + '</a>';
    var certLinkHtml = '<a href="' + URL_CERT_CHECKER + '" class="cross-link" target="_top" rel="noopener noreferrer">' + escHtml(t('links.cert_checker')) + '</a>';
    var bioflexLinkHtml = '<a href="' + urlBioflexRef + '" class="cross-link" target="_top" rel="noopener noreferrer">' + escHtml(t('links.bioflex')) + '</a>';
    var euRegLinkHtml = '<a href="' + URL_EU_REG + '" class="cross-link" target="_blank" rel="noopener noreferrer">' + escHtml(t('links.eu_reg')) + '</a>';

    var allergenText = t(matConfig.allergen, {
      site: siteName,
      nickel_link: nickelLinkHtml,
      cert_link: certLinkHtml,
      eu_link: euRegLinkHtml
    });

    var prepText = t(matConfig.prep);
    var applyText = t(matConfig.apply, { site: siteName });

    var sensitivityHtml = '';
    if (state.sensitivity !== 'normal' && SENSITIVITY_NOTE_KEYS[state.sensitivity]) {
      sensitivityHtml = '<div class="sensitivity-alert" role="note">' +
        '<strong>⚠️ ' + escHtml(t(SENSITIVITY_KEYS[state.sensitivity])) + ':</strong> ' +
        escHtml(t(SENSITIVITY_NOTE_KEYS[state.sensitivity])) +
      '</div>';
    }

    // Checkpoint times calculation
    var startDate = null;
    var h0Str = '';
    var h24Str = '';
    var h48Str = '';
    var h72Str = '';
    var h96Str = '';
    var currentLang = (window.i18n && window.i18n.getLanguage()) || 'en';

    if (state.startDatetime) {
      var parsed = new Date(state.startDatetime);
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
        h0Str = formatHumanDateTime(startDate, currentLang);
        h24Str = formatHumanDateTime(new Date(startDate.getTime() + 24 * 3600 * 1000), currentLang);
        h48Str = formatHumanDateTime(new Date(startDate.getTime() + 48 * 3600 * 1000), currentLang);
        h72Str = formatHumanDateTime(new Date(startDate.getTime() + 72 * 3600 * 1000), currentLang);
        h96Str = formatHumanDateTime(new Date(startDate.getTime() + 96 * 3600 * 1000), currentLang);
      }
    }

    // Reminders & Export Section HTML
    var reminderHtml = '';
    if (startDate) {
      reminderHtml = '<div class="protocol-section reminder-section">' +
        '<div class="protocol-section-title">' + escHtml(t('reminder.title')) + '</div>' +
        '<div class="reminder-banner">' +
          escHtml(t('reminder.computed_banner', { start_str: h0Str })) +
        '</div>' +
        '<div class="reminder-grid">' +
          '<div class="reminder-item">' +
            '<span class="reminder-badge">24h</span>' +
            '<span class="reminder-text">' + escHtml(t('reminder.h24', { time: h24Str })) + '</span>' +
          '</div>' +
          '<div class="reminder-item">' +
            '<span class="reminder-badge">48h</span>' +
            '<span class="reminder-text">' + escHtml(t('reminder.h48', { time: h48Str })) + '</span>' +
          '</div>' +
          '<div class="reminder-item">' +
            '<span class="reminder-badge">72h</span>' +
            '<span class="reminder-text">' + escHtml(t('reminder.h72', { time: h72Str })) + '</span>' +
          '</div>' +
          '<div class="reminder-item">' +
            '<span class="reminder-badge">96h</span>' +
            '<span class="reminder-text">' + escHtml(t('reminder.h96', { time: h96Str })) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="reminder-actions">' +
          '<button type="button" class="action-btn" id="btn-export-ics">' + escHtml(t('reminder.btn_ics')) + '</button>' +
          '<button type="button" class="action-btn action-btn--secondary" id="btn-copy-schedule">' + escHtml(t('reminder.btn_copy')) + '</button>' +
          '<button type="button" class="action-btn action-btn--secondary" id="btn-print-protocol">' + escHtml(t('reminder.print_btn')) + '</button>' +
        '</div>' +
      '</div>';
    } else {
      reminderHtml = '<div class="protocol-section reminder-section">' +
        '<div class="protocol-section-title">' + escHtml(t('reminder.title')) + '</div>' +
        '<div class="reminder-prompt">' +
          '<p>' + escHtml(t('form.start_time.hint')) + '</p>' +
          '<button type="button" class="action-btn action-btn--secondary" id="btn-print-protocol">' + escHtml(t('reminder.print_btn')) + '</button>' +
        '</div>' +
      '</div>';
    }

    // Assembly of Protocol Card
    var cardHtml = '<div class="protocol-card" id="active-protocol">' +
      '<div class="protocol-header">' +
        '<div class="protocol-title">' + escHtml(t('protocol.card_title', { material: matName })) + '</div>' +
        '<div class="protocol-meta">' +
          '<span>📍 ' + escHtml(siteName) + '</span>' +
          '<span class="risk-tag risk-tag--' + matConfig.risk + '">' + escHtml(riskText) + '</span>' +
        '</div>' +
      '</div>' +

      sensitivityHtml +

      '<div class="protocol-section">' +
        '<div class="protocol-section-title">' + escHtml(t('protocol.sec_testing_for')) + '</div>' +
        '<div class="allergen-box">' + allergenText + '</div>' +
      '</div>' +

      '<div class="protocol-section">' +
        '<div class="protocol-section-title">' + escHtml(t('protocol.sec_prep')) + '</div>' +
        '<ul class="prep-list">' +
          '<li>' + escHtml(prepText) + '</li>' +
          '<li>' + escHtml(t('protocol.prep_clean_site', { site: siteName })) + '</li>' +
          '<li>' + escHtml(t('protocol.prep_no_lotions')) + '</li>' +
          '<li>' + escHtml(t('protocol.prep_no_sweat')) + '</li>' +
        '</ul>' +
      '</div>' +

      '<div class="protocol-section">' +
        '<div class="protocol-section-title">' + escHtml(t('protocol.sec_timeline')) + '</div>' +
        '<div class="basis-note">' +
          '<strong>' + escHtml(t('basis.title')) + ':</strong> ' +
          escHtml(t('basis.text')) +
        '</div>' +

        '<div class="timeline">' +
          // Hour 0
          '<div class="timeline-item">' +
            '<div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>' +
            '<div class="tl-content">' +
              '<div class="tl-time">' + escHtml(t('tl.h0.time')) + (h0Str ? ' <span class="tl-calc-time">(' + escHtml(h0Str) + ')</span>' : '') + '</div>' +
              '<div class="tl-action">' + escHtml(t('tl.h0.action', { site: siteName })) + '</div>' +
              '<div class="tl-detail">' + escHtml(t('tl.h0.detail', { apply: applyText })) + '</div>' +
            '</div>' +
          '</div>' +

          // Hour 24
          '<div class="timeline-item">' +
            '<div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>' +
            '<div class="tl-content">' +
              '<div class="tl-time">' + escHtml(t('tl.h24.time')) + (h24Str ? ' <span class="tl-calc-time">(' + escHtml(h24Str) + ')</span>' : '') + '</div>' +
              '<div class="tl-action">' + escHtml(t('tl.h24.action')) + '</div>' +
              '<div class="tl-detail">' + escHtml(t('tl.h24.detail')) + '</div>' +
            '</div>' +
          '</div>' +

          // Hour 48
          '<div class="timeline-item">' +
            '<div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>' +
            '<div class="tl-content">' +
              '<div class="tl-time">' + escHtml(t('tl.h48.time')) + (h48Str ? ' <span class="tl-calc-time">(' + escHtml(h48Str) + ')</span>' : '') + '</div>' +
              '<div class="tl-action">' + escHtml(t('tl.h48.action')) + '</div>' +
              '<div class="tl-detail">' + escHtml(t('tl.h48.detail')) + '</div>' +
            '</div>' +
          '</div>' +

          // Hour 72
          '<div class="timeline-item">' +
            '<div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>' +
            '<div class="tl-content">' +
              '<div class="tl-time">' + escHtml(t('tl.h72.time')) + (h72Str ? ' <span class="tl-calc-time">(' + escHtml(h72Str) + ')</span>' : '') + '</div>' +
              '<div class="tl-action">' + escHtml(t('tl.h72.action')) + '</div>' +
              '<div class="tl-detail">' + escHtml(t('tl.h72.detail')) + '</div>' +
            '</div>' +
          '</div>' +

          // Hour 96
          '<div class="timeline-item">' +
            '<div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>' +
            '<div class="tl-content">' +
              '<div class="tl-time">' + escHtml(t('tl.h96.time')) + (h96Str ? ' <span class="tl-calc-time">(' + escHtml(h96Str) + ')</span>' : '') + '</div>' +
              '<div class="tl-action">' + escHtml(t('tl.h96.action')) + '</div>' +
              '<div class="tl-detail">' + escHtml(t('tl.h96.detail')) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Reaction Interpretation Guide with Inline SVG Diagrams
      '<div class="protocol-section">' +
        '<div class="protocol-section-title">' + escHtml(t('protocol.sec_reaction')) + '</div>' +
        '<div class="reaction-grid">' +
          '<div class="reaction-item reaction-item--neg">' +
            '<div class="reaction-visual">' + getReactionSvg('neg') + '</div>' +
            '<div class="reaction-meaning">' + escHtml(t('reaction.neg.title')) + '</div>' +
            '<div class="reaction-symbol">' + escHtml(t('reaction.neg.symbol')) + '</div>' +
            '<div class="reaction-text">' + escHtml(t('reaction.neg.text')) + '</div>' +
          '</div>' +

          '<div class="reaction-item reaction-item--doubt">' +
            '<div class="reaction-visual">' + getReactionSvg('doubt') + '</div>' +
            '<div class="reaction-meaning">' + escHtml(t('reaction.doubt.title')) + '</div>' +
            '<div class="reaction-symbol">' + escHtml(t('reaction.doubt.symbol')) + '</div>' +
            '<div class="reaction-text">' + escHtml(t('reaction.doubt.text')) + '</div>' +
          '</div>' +

          '<div class="reaction-item reaction-item--pos">' +
            '<div class="reaction-visual">' + getReactionSvg('pos') + '</div>' +
            '<div class="reaction-meaning">' + escHtml(t('reaction.pos.title')) + '</div>' +
            '<div class="reaction-symbol">' + escHtml(t('reaction.pos.symbol')) + '</div>' +
            '<div class="reaction-text">' + escHtml(t('reaction.pos.text')) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // If Positive Section
      '<div class="protocol-section">' +
        '<div class="protocol-section-title">' + escHtml(t('protocol.sec_if_positive')) + '</div>' +
        '<ul class="prep-list">' +
          '<li>' + escHtml(t('if_pos.item1')) + '</li>' +
          '<li>' + escHtml(t('if_pos.item2')) + '</li>' +
          '<li>' + t('if_pos.item3', { bioflex_link: bioflexLinkHtml }) + '</li>' +
          '<li>' + t('if_pos.item4', { eu_link: euRegLinkHtml }) + '</li>' +
        '</ul>' +
      '</div>' +

      reminderHtml +
    '</div>';

    resultContainer.innerHTML = cardHtml;

    // Attach Event Listeners to New Action Buttons
    var btnIcs = document.getElementById('btn-export-ics');
    if (btnIcs && startDate) {
      btnIcs.addEventListener('click', function() {
        var ics = generateIcs(startDate, matName);
        downloadIcsFile(ics, 'patch-test-' + state.material + '.ics');
      });
    }

    var btnCopy = document.getElementById('btn-copy-schedule');
    if (btnCopy && startDate) {
      btnCopy.addEventListener('click', function() {
        var scheduleSummary = t('protocol.card_title', { material: matName }) + '\n' +
          t('reminder.computed_banner', { start_str: h0Str }) + '\n' +
          '----------------------------------------\n' +
          t('reminder.h24', { time: h24Str }) + '\n' +
          t('reminder.h48', { time: h48Str }) + '\n' +
          t('reminder.h72', { time: h72Str }) + '\n' +
          t('reminder.h96', { time: h96Str }) + '\n' +
          '----------------------------------------\n' +
          t('reminder.schedule_source');
        copyScheduleToClipboard(scheduleSummary, btnCopy);
      });
    }

    var btnPrint = document.getElementById('btn-print-protocol');
    if (btnPrint) {
      btnPrint.addEventListener('click', function() {
        window.print();
      });
    }

    // Smooth scroll into view
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(function() {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  // Handle language switch
  function onLanguageChange(newLang) {
    if (window.i18n && window.i18n.setLanguage(newLang)) {
      updateStaticLabels();
      if (lastGeneratedState) {
        renderProtocol(lastGeneratedState);
      }
      if (activeTab === 'method') {
        renderMethodDocumentation();
      }
    }
  }

  // Theme support & handshake with embedding parent window
  function initTheme() {
    var themeBtn = document.getElementById('theme-toggle-btn');
    var themeText = document.getElementById('theme-btn-text');

    var applyTheme = function(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('poli_tools_theme', theme);
      } catch (e) {}
      if (themeText) {
        themeText.textContent = theme === 'light' ? t('theme.dark') : t('theme.light');
      }
    };

    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    try {
      var saved = localStorage.getItem('poli_tools_theme');
      if (saved) current = saved;
    } catch (e) {}
    applyTheme(current);

    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        var active = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(active === 'light' ? 'dark' : 'light');
      });
    }

    // Embed message listener for parent frame handshake
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'poli-theme' && (e.data.theme === 'light' || e.data.theme === 'dark')) {
        applyTheme(e.data.theme);
      }
      if (e.data && e.data.type === 'poli-language' && e.data.language) {
        var langSelect = document.getElementById('lang-select');
        if (langSelect) {
          langSelect.value = e.data.language;
          onLanguageChange(e.data.language);
        }
      }
    });
  }

  // Set current time helper button
  function initDateTimeHelper() {
    var btn = document.getElementById('btn-set-now');
    var input = document.getElementById('start-datetime');
    if (btn && input) {
      btn.addEventListener('click', function() {
        var now = new Date();
        input.value = toLocalIsoDateTime(now);
        input.classList.remove('input-error');
        var err = document.querySelector('.validation-error');
        if (err) err.remove();
        if (lastGeneratedState) {
          lastGeneratedState.startDatetime = input.value;
          renderProtocol(lastGeneratedState);
        }
      });
    }
  }

  function initApp() {
    // Language selector initialization
    var langSelect = document.getElementById('lang-select');
    if (langSelect && window.i18n) {
      langSelect.value = window.i18n.getLanguage();
      langSelect.addEventListener('change', function() {
        onLanguageChange(this.value);
      });
    }

    // Tab buttons
    var btnGen = document.getElementById('tab-btn-generator');
    var btnMethod = document.getElementById('tab-btn-method');
    if (btnGen) {
      btnGen.addEventListener('click', function() { switchTab('generator'); });
    }
    if (btnMethod) {
      btnMethod.addEventListener('click', function() { switchTab('method'); });
    }

    // Generator submit
    var genBtn = document.getElementById('gen-btn');
    if (genBtn) {
      genBtn.addEventListener('click', generate);
    }

    // Field error clearance on change
    var matSelect = document.getElementById('test-material');
    if (matSelect) {
      matSelect.addEventListener('change', function() {
        if (this.value) {
          this.classList.remove('input-error');
          var err = document.querySelector('.validation-error');
          if (err) err.remove();
        }
      });
    }

    initDateTimeHelper();
    initTheme();
    updateStaticLabels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
