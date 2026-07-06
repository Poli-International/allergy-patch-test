# Allergy Patch Test Protocol Generator - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

---

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with form controls and dynamic result container
- **CSS3**, External stylesheet (`/tools/allergy-patch-test/css/style.css`)
- **JavaScript (ES6)**, Single file (`/tools/allergy-patch-test/js/app.js`), no external dependencies, no frameworks
- **No backend**, Fully client-side, static tool

### File Structure

```
/tools/allergy-patch-test/
├── index.html          # Tool page (noindex, nofollow)
├── css/
│   └── style.css       # All visual styling
└── js/
    └── app.js          # All logic, data, and rendering
```

### Component / Logic Breakdown

| Component | File | Description |
|-----------|------|-------------|
| UI Form | `index.html` | Three `<select>` inputs and a generate button |
| Result Container | `index.html` | Empty `<div id="result">` for dynamic protocol output |
| Data Layer | `app.js` | `MATERIALS`, `SITE_NAMES`, `SENSITIVITY_NOTES` constants |
| Event Handler | `app.js` | `generate()` function bound to button click |
| Rendering | `app.js` | Builds HTML string with protocol timeline and reaction grid |
| Utility | `app.js` | `escHtml()` for XSS-safe output |

---

## Data Schemas

### `MATERIALS` Object

Keyed by material identifier string. Each entry contains:

```javascript
{
  name:       string,  // Display name (e.g., "Surgical steel")
  risk:       string,  // One of: "high", "moderate", "low", "very-low"
  allergen:   string,  // Description of allergen and sensitisation risk
  prep:       string,  // Preparation instructions for the test material
  apply:      string   // Application instructions for the patch test
}
```

**Example entry:**

```javascript
'steel': {
  name:       'Surgical steel',
  risk:       'high',
  allergen:   'Nickel (up to 8% in 316L grade). The most common contact allergen...',
  prep:       'Obtain a small piece of surgical steel jewellery...',
  apply:      'Secure the jewellery piece to the inner forearm with medical tape...'
}
```

**All keys:** `steel`, `titanium`, `niobium`, `gold-9`, `gold-18`, `silver`, `bioflex`, `ptfe`, `ink-black`, `ink-colour`, `numbing`

### `SITE_NAMES` Object

```javascript
{
  'inner-arm':    'inner forearm',
  'behind-ear':   'behind the ear',
  'wrist':        'inner wrist',
  'behind-knee':  'behind the knee'
}
```

### `SENSITIVITY_NOTES` Object

```javascript
{
  'sensitive':     'You have sensitive skin, check the test site every 4 hours...',
  'contact-derm':  'With a history of contact dermatitis, use the 96-hour extended...',
  'metal-allergy': 'You have a known metal allergy. For jewellery testing, consider...'
}
```

### `riskBadgeMap` Object (local to `generate()`)

```javascript
{
  'high':      '⚠️ Higher allergy risk',
  'moderate':  '~ Moderate allergy risk',
  'low':       '✓ Low allergy risk',
  'very-low':  '✓ Very low allergy risk'
}
```

---

## Calculation / Logic Algorithms

### `escHtml(s)`, XSS Sanitization

**Input:** Any string `s`

**Output:** HTML-escaped string

**Logic:**
1. Convert `s` to string (or empty string if null/undefined)
2. Replace `&` with `&amp;`
3. Replace `<` with `&lt;`
4. Replace `>` with `&gt;`
5. Replace `"` with `&quot;`

### `generate()`, Protocol Generation

**Trigger:** Click event on `#gen-btn`

**Steps:**

1. **Read form values:**
   - `matKey` = value of `#test-material`
   - `siteKey` = value of `#test-site`
   - `sensKey` = value of `#skin-sensitivity`

2. **Validation:**
   - If `matKey` is empty string → `alert('Please select a material to test.')` → return early

3. **Lookup data:**
   - `m` = `MATERIALS[matKey]`
   - `site` = `SITE_NAMES[siteKey]` (falls back to `'inner forearm'`)
   - `sensNote` = `SENSITIVITY_NOTES[sensKey]` (or `null`)

4. **Build sensitivity warning HTML:**
   - If `sensNote` is truthy → wrap in `<div class="sensitivity-alert">`
   - Otherwise → empty string

5. **Determine risk badge:**
   - `riskBadge` = `riskBadgeMap[m.risk]` (or empty string)

6. **Render protocol card:**
   - Construct full HTML string with:
     - Protocol header (material name, site, risk badge)
     - Sensitivity alert (if applicable)
     - Allergen description section
     - Preparation instructions (3 bullet points)
     - 96-hour timeline (5 steps: Hour 0, 24, 48, 72, 96)
     - Reaction interpretation grid (3 outcomes: Negative, Doubtful, Positive)
     - Positive test guidance (4 bullet points)

7. **Insert into DOM:**
   - `document.getElementById('result').innerHTML = ...`

8. **Scroll to result:**
   - `document.getElementById('result').scrollIntoView({ behavior:'smooth', block:'nearest' })`

---

## API Reference

### Public Functions

#### `escHtml(s)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` (or any) | Input string to sanitize |

**Returns:** `string`, HTML-escaped safe string

**Behavior:** Replaces `&`, `<`, `>`, `"` with their HTML entity equivalents. Handles `null`/`undefined` gracefully.

---

#### `generate()`

| Parameter | Type | Description |
|-----------|------|-------------|
| *(none)* |, | Reads from DOM elements directly |

**Returns:** `undefined` (void)

**Side effects:**
- Reads values from `#test-material`, `#test-site`, `#skin-sensitivity`
- Displays `alert()` on validation failure
- Sets `innerHTML` on `#result`
- Scrolls `#result` into view

**Dependencies:** `MATERIALS`, `SITE_NAMES`, `SENSITIVITY_NOTES`, `escHtml()`

---

### Event Binding

```javascript
document.getElementById('gen-btn').addEventListener('click', generate);
```

---

## Integration Guide

### Standalone Embedding

The tool is fully self-contained static HTML/CSS/JS. Embed via iframe:

```html
<iframe
  src="https://poliinternational.com/tools/allergy-patch-test/"
  width="100%"
  height="800"
  frameborder="0"
  title="Allergy Patch Test Protocol Generator"
></iframe>
```

### Theme Support (iframe)

The tool listens for `postMessage` events to support dark/light theme switching when embedded:

```javascript
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'poli-theme') {
    document.documentElement.setAttribute('data-theme', e.data.light ? 'light' : 'dark');
  }
});
```

**Message format:**

```javascript
// For light theme
{ type: 'poli-theme', light: true }

// For dark theme
{ type: 'poli-theme', light: false }
```

### Dependencies

- **Zero** external libraries, frameworks, or CDN resources
- Requires only a modern browser with ES6 support

---

## Customization

### Adding New Materials

Add a new entry to the `MATERIALS` object in `app.js`:

```javascript
'your-key': {
  name:     'Display Name',
  risk:     'low',           // 'high' | 'moderate' | 'low' | 'very-low'
  allergen: 'Description of allergen and risks...',
  prep:     'How to prepare the test material...',
  apply:    'How to apply the test material to skin...'
}
```

Then add the corresponding `<option>` in `index.html` under the appropriate `<optgroup>`.

### Modifying Timeline Steps

Edit the timeline HTML template inside the `generate()` function. Each timeline item follows this structure:

```html
<div class="timeline-item">
  <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
  <div class="tl-content">
    <div class="tl-time">Hour X, Title</div>
    <div class="tl-action">Action description</div>
    <div class="tl-detail">Detailed instructions</div>
  </div>
</div>
```

---

## Performance

- **Bundle size:** ~8 KB total (HTML + CSS + JS)
- **Render time:** < 50ms for protocol generation (no DOM manipulation beyond `innerHTML` assignment)
- **No network requests** after initial page load
- **No memory leaks**, single event listener, no timers, no closures persisting beyond function scope
- **No reflows** beyond the single `innerHTML` write and `scrollIntoView` call

---

## Browser Compatibility

| Feature | Minimum Version |
|---------|----------------|
| `addEventListener` | IE 9+ |
| `querySelector` | IE 8+ |
| `classList` | IE 10+ |
| `scrollIntoView({ behavior:'smooth' })` | Chrome 61+, Firefox 36+, Safari 15.4+ |
| `template literals` | Chrome 41+, Firefox 34+, Safari 9+ |
| `const` / `let` | Chrome 49+, Firefox 44+, Safari 11+ |
| `arrow functions` | Chrome 45+, Firefox 22+, Safari 10+ |

**Polyfills required for IE 11:** None for basic functionality. `scrollIntoView` smooth behavior degrades gracefully to instant scroll.

---

## Security

### XSS Prevention

All user-facing output passes through `escHtml()`:

```javascript
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

This sanitizes:
- All material names (`m.name`)
- All allergen descriptions (`m.allergen`)
- All preparation/application instructions (`m.prep`, `m.apply`)
- Site names (`site`)
- Sensitivity notes (`sensNote`)
- Risk badge text

### Input Validation

- Material selection is validated: empty selection triggers `alert()` and prevents protocol generation
- Site and sensitivity selections have no validation (defaults are always valid)

### Content Security

- Page uses `<meta name="robots" content="noindex, nofollow">` to prevent search indexing
- External links use `target="_blank"` and `rel="noopener noreferrer"`
- No user input is stored, transmitted, or persisted

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial release | Full 96-hour patch test protocol generation for 12 materials, 4 test sites, 4 sensitivity profiles |

---

## Support / Contact

For technical issues, feature requests, or integration questions:

- **Email:** support@poliinternational.com
- **Tool URL:** https://poliinternational.com/tools/allergy-patch-test/
- **Company:** Poli International, serving tattoo & piercing studios
