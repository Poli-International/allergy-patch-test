'use strict';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const MATERIALS = {
  'steel':     { name:'Surgical steel',            risk:'high',    allergen:'Nickel (up to 8% in 316L grade). The most common contact allergen in body jewellery. EN 1811 limits nickel release to 0.2 µg/cm²/week for piercings — surgical steel frequently exceeds this with sweat exposure.', prep:'Obtain a small piece of surgical steel jewellery (e.g. a plain stud or ring from the same source as the intended jewellery).', apply:'Secure the jewellery piece to the inner forearm with medical tape. Do not use adhesive directly on the metal.' },
  'titanium':  { name:'Implant-grade titanium',    risk:'low',     allergen:'Titanium hypersensitivity is extremely rare (estimated 0.6% of population). Implant-grade ASTM F136 alloy contains no nickel. A patch test may still be appropriate for clients with documented multiple-metal sensitivities.', prep:'Obtain a small titanium disc or piece of implant-grade titanium jewellery from the same source you plan to use.', apply:'Secure to the inner forearm with medical tape and a small gauze pad.' },
  'niobium':   { name:'Niobium',                   risk:'low',     allergen:'Niobium is biocompatible and hypoallergenic for the vast majority of wearers. Reactive metal — safe for initial jewellery. True niobium allergy is exceptionally rare.', prep:'Obtain a small niobium piece from the same manufacturer as the intended jewellery.', apply:'Secure to the inner forearm with medical tape.' },
  'gold-9':    { name:'9ct gold',                  risk:'moderate',allergen:'9ct gold is only 37.5% gold — the remainder is alloy (typically copper, silver, and zinc). Nickel-free 9ct gold is common but not universal. White gold varieties often contain nickel or palladium. Check the specific alloy composition from your supplier.', prep:'Obtain the specific 9ct gold piece you plan to wear. If it is white gold, check alloy content for nickel before proceeding.', apply:'Secure to the inner forearm with medical tape.' },
  'gold-18':   { name:'18ct / 14ct gold',          risk:'low',     allergen:'18ct gold is 75% pure gold — substantially purer than 9ct. Allergic response to 18ct yellow gold is rare. White gold at 18ct may still contain nickel or palladium depending on alloy — verify with supplier.', prep:'Obtain the specific piece from your supplier. Confirm alloy ingredients if white gold.', apply:'Secure to the inner forearm with medical tape.' },
  'silver':    { name:'Sterling silver',           risk:'moderate',allergen:'Sterling silver (92.5% Ag) is not recommended for new or unhealed piercings. It oxidises and leaves silver deposits (argyria) in healing tissue. Contact allergy to silver itself is rare, but oxidation products are irritating. Not suitable for initial jewellery.', prep:'Obtain the specific sterling silver piece you plan to wear. Note: sterling silver is not recommended for new piercings regardless of patch test result.', apply:'Secure to the inner forearm with medical tape.' },
  'bioflex':   { name:'BioFlex® polymer',          risk:'very-low',allergen:'BioFlex® is a polypropylene-based random copolymer (PP-R). ISO 10993-6 biocompatibility tested and FDA Class IV certified. True polymer allergy is extremely rare. Patch testing is generally unnecessary but can be done to give clients peace of mind.', prep:'Obtain a small piece of BioFlex® from the same source as the intended jewellery. The BioFlex® surface can be held against the skin without tape.', apply:'Place a small section of BioFlex® flat against the inner forearm and secure with medical tape.' },
  'ptfe':      { name:'PTFE / Bioplast',           risk:'very-low',allergen:'PTFE (polytetrafluoroethylene) is highly chemically inert and biocompatible. Allergy to PTFE itself is essentially unreported in the medical literature. Note: "bioplast" is a trade name applied to various polymer compositions — confirm the specific material with your supplier.', prep:'Obtain the specific PTFE/bioplast piece from your supplier.', apply:'Secure to the inner forearm with medical tape.' },
  'ink-black': { name:'Black / greywash tattoo ink',risk:'low',    allergen:'Black tattoo inks are typically carbon-based (carbon black). True allergy to carbon black is rare. However, some black inks contain polycyclic aromatic hydrocarbons (PAHs) — under EU Regulation 2020/2081, PAH content is limited. Check your ink is 2020/2081 compliant.', prep:'Your tattoo artist will apply a small amount (5mm × 5mm) of the specific ink to be used during the procedure.', apply:'Applied intradermally in a small area by your artist, or a topical application if testing pre-session.' },
  'ink-colour':{ name:'Colour tattoo ink',         risk:'moderate',allergen:'Colour inks carry higher allergy risk than black. Red (mercury sulphide in older inks, azo dyes in modern inks), yellow, and orange pigments have the highest documented sensitisation rates. EU 2020/2081 bans many problematic azo pigments — ensure ink is compliant. Test the specific colour you plan to use.', prep:'Your tattoo artist will apply a small amount of the specific colour ink to be used. Test each colour separately if multiple colours are planned.', apply:'Applied by your artist to the inner forearm in a 5mm × 5mm dot. Some artists apply topically; intradermal patch tests are more sensitive.' },
  'numbing':   { name:'Topical numbing cream',     risk:'moderate',allergen:'Common topical anaesthetics (lidocaine, EMLA — lidocaine/prilocaine, tetracaine) can cause contact sensitisation. The cream base (emulsifiers, preservatives) is often the allergen rather than the anaesthetic itself. Test the specific product and formulation to be used.', prep:'Obtain the specific numbing cream product and formulation that will be used during the procedure.', apply:'Apply a small amount (pea-sized) to the inner forearm under occlusion (covered with a small square of cling film secured with tape).' },
};

const SITE_NAMES = {
  'inner-arm':    'inner forearm',
  'behind-ear':   'behind the ear',
  'wrist':        'inner wrist',
  'behind-knee':  'behind the knee',
};

const SENSITIVITY_NOTES = {
  'sensitive':     'You have sensitive skin — check the test site every 4 hours during the first 24 hours. Any immediate redness (within 30 minutes) is an irritant reaction, not necessarily an allergy.',
  'contact-derm':  'With a history of contact dermatitis, use the 96-hour extended observation period. The "angry back" syndrome (false positives from systemic sensitisation) can occur — consider formal dermatology patch testing before any procedure.',
  'metal-allergy': 'You have a known metal allergy. For jewellery testing, consider using only implant-grade titanium or BioFlex® for piercings. A positive test to any metal should be reviewed by a dermatologist before proceeding.',
};

document.getElementById('gen-btn').addEventListener('click', generate);

function generate() {
  const matKey  = document.getElementById('test-material').value;
  const siteKey = document.getElementById('test-site').value;
  const sensKey = document.getElementById('skin-sensitivity').value;

  if (!matKey) { alert('Please select a material to test.'); return; }

  const m    = MATERIALS[matKey];
  const site = SITE_NAMES[siteKey] || 'inner forearm';
  const sensNote = SENSITIVITY_NOTES[sensKey] || null;

  const sensitivityHtml = sensNote
    ? `<div class="sensitivity-alert">⚠️ ${escHtml(sensNote)}</div>`
    : '';

  const riskBadgeMap = { 'high':'⚠️ Higher allergy risk', 'moderate':'~ Moderate allergy risk', 'low':'✓ Low allergy risk', 'very-low':'✓ Very low allergy risk' };
  const riskBadge = riskBadgeMap[m.risk] || '';

  document.getElementById('result').innerHTML = `
    <div class="protocol-card">
      <div class="protocol-header">
        <div class="protocol-title">96-Hour Patch Test: ${escHtml(m.name)}</div>
        <div class="protocol-subtitle">Test site: ${escHtml(site)} · ${escHtml(riskBadge)}</div>
      </div>
      ${sensitivityHtml}
      <div class="protocol-section">
        <div class="protocol-section-title">What you are testing for</div>
        <ul class="prep-list">
          <li>${escHtml(m.allergen)}</li>
        </ul>
      </div>
      <div class="protocol-section">
        <div class="protocol-section-title">Preparation</div>
        <ul class="prep-list">
          <li>${escHtml(m.prep)}</li>
          <li>The test site (${escHtml(site)}) must be clean, unbroken, and free of any active skin conditions</li>
          <li>Do not apply moisturiser, sunscreen, or any product to the test site on the day of testing</li>
          <li>Avoid vigorous exercise or sweating during the test period — this can give false positive irritant reactions</li>
        </ul>
      </div>
      <div class="protocol-section">
        <div class="protocol-section-title">96-Hour protocol timeline</div>
        <div class="timeline">
          <div class="timeline-item">
            <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
            <div class="tl-content">
              <div class="tl-time">Hour 0 — Application</div>
              <div class="tl-action">Apply the test material to the ${escHtml(site)}</div>
              <div class="tl-detail">${escHtml(m.apply)} Note the start time. Mark the test area lightly with a pen circle to identify it later. Avoid water on the site.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
            <div class="tl-content">
              <div class="tl-time">Hour 24 — First check</div>
              <div class="tl-action">Inspect the site without removing the patch</div>
              <div class="tl-detail">Look for any immediate redness, swelling, or itching. A faint pink outline from the tape is normal. Significant redness spreading beyond the tape border, swelling, or blistering at this stage may indicate irritant contact dermatitis — discontinue if severe.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
            <div class="tl-content">
              <div class="tl-time">Hour 48 — Remove and read</div>
              <div class="tl-action">Remove the patch — first reading</div>
              <div class="tl-detail">Remove tape and material carefully. Inspect the site immediately and again after 30 minutes (skin needs time to de-compress after occlusion). Document what you see. Leave the site unmarked and do not apply anything to it.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
            <div class="tl-content">
              <div class="tl-time">Hour 72 — Second reading (critical)</div>
              <div class="tl-action">Inspect the uncovered site — allergic reactions peak here</div>
              <div class="tl-detail">True allergic contact dermatitis reactions often peak at 72 hours — this reading is the most diagnostically important. Look for erythema (redness), papules (small raised bumps), vesicles (tiny fluid blisters), or infiltration (thickened skin). Any of these are a positive reaction.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="tl-line"><div class="tl-dot"></div><div class="tl-bar"></div></div>
            <div class="tl-content">
              <div class="tl-time">Hour 96 — Final reading</div>
              <div class="tl-action">Final assessment — proceed or do not proceed decision</div>
              <div class="tl-detail">Final reading. If the site is completely clear — no redness, no raised tissue, no itching — the test is negative for the tested material under the tested conditions. If any reaction persists, do not proceed. Photograph the site for your records.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="protocol-section">
        <div class="protocol-section-title">Reading the reaction — what it means</div>
        <div class="reaction-grid">
          <div class="reaction-item">
            <div class="reaction-meaning">Negative (−)</div>
            <div class="reaction-symbol neg">Clear skin</div>
            <div class="reaction-text">No redness, bumps, or itching at 72–96 hrs. Safe to proceed with this material under these test conditions.</div>
          </div>
          <div class="reaction-item">
            <div class="reaction-meaning">Doubtful (+?)</div>
            <div class="reaction-symbol doubt">Faint redness only</div>
            <div class="reaction-text">Faint redness with no papules or vesicles. May be irritant reaction, not allergic. Retest with lower concentration or consult a dermatologist.</div>
          </div>
          <div class="reaction-item">
            <div class="reaction-meaning">Positive (+)</div>
            <div class="reaction-symbol pos">Redness + bumps / blisters</div>
            <div class="reaction-text">Erythema plus papules, vesicles, or infiltration. Probable allergic sensitisation. Do not proceed with this material. Consult a dermatologist.</div>
          </div>
        </div>
      </div>
      <div class="protocol-section">
        <div class="protocol-section-title">If the test is positive</div>
        <ul class="prep-list">
          <li>Do not proceed with the tested material in any piercing or tattoo application</li>
          <li>Document the reaction with photos and take them to a dermatologist for formal assessment</li>
          <li>For jewellery: consider switching to implant-grade titanium (ASTM F136) or <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a> — the two materials with the lowest documented sensitisation rates</li>
          <li>For tattoo inks: request a different brand or formulation and test again with the alternative. EU 2020/2081 compliant inks reduce the risk of reaction to banned azo pigments and PAHs</li>
        </ul>
      </div>
    </div>`;
  document.getElementById('result').scrollIntoView({ behavior:'smooth', block:'nearest' });
}
