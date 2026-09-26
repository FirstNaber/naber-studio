/* "What are you missing?" — the buffet → catering calculator.
   It asks for the restaurant's numbers one question at a time, then shows a range (low to high) of the catering
   revenue left on the table each month and year by never following up with guests who already eat there.
   Costs counted: only what it takes to close a catering customer, plus the retainer. Renders into every [data-calc]. */
(() => {
  // every number the calculator needs; `lo`/`hi` pairs are asked as a range ("between __ and __")
  const F = {
    g:     { label: 'Guests a month', pre: '', v: 3000, step: 50, group: 'buffet' },
    spend: { label: 'Spend per guest, per visit', pre: '$', v: 20, step: 1, group: 'buffet' },
    visits:{ label: 'Visits per guest a year', post: '×', v: 4, step: 1, group: 'buffet' },
    reach: { label: 'Guests who’d give their number', post: '%', v: 30, step: 1, max: 100, group: 'buffet' },
    convLo:{ label: 'Who order catering: low', post: '%', v: 1, step: 0.5, max: 100, group: 'catering' },
    convHi:{ label: 'Who order catering: high', post: '%', v: 3, step: 0.5, max: 100, group: 'catering' },
    ordLo: { label: 'Catering order: low', pre: '$', v: 300, step: 25, group: 'catering' },
    ordHi: { label: 'Catering order: high', pre: '$', v: 600, step: 25, group: 'catering' },
    freq:  { label: 'Catering orders per customer a year', post: '×', v: 2, step: 1, group: 'catering' },
    now:   { label: 'Catering orders you get now, a month', pre: '', v: 0, step: 1, group: 'catering' },
    ctc:   { label: 'Cost to close one catering customer', pre: '$', v: 25, step: 5, group: 'cost' },
    fee:   { label: 'Naber Studio retainer, a month', pre: '$', v: 99, step: 1, group: 'cost' },
  };
  const GROUPS = { buffet: 'Your buffet', catering: 'Your catering', cost: 'Cost to close' };

  // the questions, in order
  const QS = [
    { ids: ['g'], title: 'How many guests eat at your buffet in a month?', help: 'Count every plate. Guests a day × days open × 4 works. 100 a day, 7 days a week ≈ 3,000.' },
    { ids: ['spend'], title: 'What does one guest spend per visit?', help: 'The buffet price plus drinks, per person.' },
    { ids: ['visits'], title: 'How many times a year does a regular come back?', help: 'Including the first visit. This tells us how many different people you actually feed.' },
    { ids: ['reach'], title: 'How many guests would give you their number?', help: 'For a free drink or a birthday deal: a QR code on the table or the receipt. That list is who we offer catering to.' },
    { ids: ['convLo', 'convHi'], range: true, title: 'Out of those, how many would order catering in a year?', help: 'Office lunches, birthdays, church events, family parties. 1 in 100 is 1%; 1 in 33 is 3%.' },
    { ids: ['ordLo', 'ordHi'], range: true, title: 'What’s a typical catering order worth?', help: 'Your smallest common order to your bigger ones: party trays up to events.' },
    { ids: ['freq'], title: 'How many times a year does a catering customer order?', help: 'An office that orders lunch every quarter is 4.' },
    { ids: ['now'], title: 'How many catering orders do you get now, a month?', help: 'Without anyone asking for them. We only count what you’re missing on top of these.' },
    { ids: ['ctc'], title: 'What does it cost to close one catering customer?', help: 'Texts, a follow-up ad, a free sample tray: what you’d spend to win one. Food cost isn’t counted.' },
    { ids: ['fee'], title: 'And the monthly retainer for the system?', help: 'Naber Studio sets up the list, the texts and the catering page, and keeps it running.' },
  ];

  const usd = (n) => (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
  const num = (n) => (Math.abs(n) >= 10 ? Math.round(n) : +n.toFixed(1)).toLocaleString('en-US');
  const range = (a, b) => (Math.round(a) === Math.round(b) ? usd(a) : `${usd(a)} – ${usd(b)}`);
  const rangeN = (a, b) => (num(a) === num(b) ? num(a) : `${num(a)} – ${num(b)}`);

  function inputHTML(id, uid, big) {
    const f = F[id];
    return `<span class="money${big ? ' big' : ''}" ${f.pre ? `data-pre="${f.pre}"` : ''} ${f.post ? `data-post="${f.post}"` : ''}><input id="${uid}${id}" data-id="${id}" type="number" inputmode="decimal" min="0" ${f.max ? `max="${f.max}"` : ''} step="${f.step}" aria-label="${f.label}"></span>`;
  }

  let uidN = 0;
  function mount(box) {
    const uid = 'k' + ++uidN + '-';
    const onPage = box.hasAttribute('data-url');    // the /calculator/ page keeps the answers in its URL
    const q = new URLSearchParams(location.search);
    const val = {};
    for (const [id, f] of Object.entries(F)) { const p = parseFloat(q.get(id)); val[id] = onPage && Number.isFinite(p) && p >= 0 ? p : f.v; }
    let qi = 0;

    box.innerHTML = `
      <div class="glass wiz" data-o="wiz">
        <div class="wiz-top"><span data-o="qn"></span><i class="wiz-bar"><b data-o="bar"></b></i></div>
        <label class="q-title" data-o="qt"></label>
        <p class="wiz-help" data-o="qh"></p>
        <div class="wiz-in" data-o="qi"></div>
        <div class="wiz-acts">
          <button type="button" class="q-back" data-a="back">← Back</button>
          <button type="button" class="btn btn-primary" data-a="next">Next →</button>
          <button type="button" class="q-back" data-a="skip">Not sure: use a typical number</button>
        </div>
      </div>
      <div class="calc-run" hidden>
        <div class="calc-chips"><span>Buffet guests → catering orders</span><button type="button" class="q-back" data-a="restart">Answer the questions again</button></div>
        <div class="calc">
          <form class="glass calc-in sheet" novalidate onsubmit="return false">
            ${Object.entries(GROUPS).map(([g, name]) => `<fieldset><legend>${name}</legend>${Object.entries(F).filter(([, f]) => f.group === g).map(([id, f]) => `<label class="sheet-row" for="${uid}${id}"><span>${f.label}</span>${inputHTML(id, uid)}</label>`).join('')}</fieldset>`).join('')}
          </form>
          <div class="glass calc-out" id="${uid}res" aria-live="polite">
            <p class="miss-k">Catering revenue you’re missing</p>
            <p class="miss range"><span data-o="miss"></span><small>/mo</small></p>
            <p class="miss-year" data-o="year"></p>
            <div class="ladder" aria-label="What one guest is worth">
              <div><span>One visit</span><b data-o="l1"></b></div>
              <i aria-hidden="true">→</i>
              <div><span>A regular, a year</span><b data-o="l2"></b></div>
              <i aria-hidden="true">→</i>
              <div class="hot"><span>A catering customer, a year</span><b data-o="l3"></b><em data-o="lx"></em></div>
            </div>
            <div class="flow">
              <div><span>Guests you could reach / yr</span><b data-o="reach"></b></div>
              <div><span>New catering customers / yr</span><b data-o="cust"></b></div>
              <div><span>Catering orders / yr</span><b data-o="ords"></b></div>
            </div>
            <p class="calc-line" data-o="line"></p>
            <div class="calc-acts">
              <a class="btn btn-primary" data-o="mail" href="mailto:hello@naberstudio.com">Get this for my restaurant</a>
              <button class="btn btn-ghost" type="button" data-a="copy">Copy link to these numbers</button>
            </div>
            <p class="calc-note">A range from the numbers you enter, not a guarantee. Revenue is before food cost; the only costs taken out are closing each catering customer and the retainer.</p>
          </div>
        </div>
        <a class="calc-peek" href="#${uid}res" data-o="peek" hidden><span>Missing</span><b data-o="peek-v"></b><i>See the math ↓</i></a>
      </div>`;
    const $ = (s) => box.querySelector(s), out = (k) => box.querySelector(`[data-o="${k}"]`);
    const sheet = $('.sheet');

    /* ---- the questions ---- */
    function ask(i) {
      qi = Math.max(0, Math.min(i, QS.length - 1));
      const Q = QS[qi];
      out('qn').textContent = `Question ${qi + 1} of ${QS.length}`;
      out('bar').style.width = ((qi + 1) / QS.length) * 100 + '%';
      out('qt').textContent = Q.title; out('qt').htmlFor = `${uid}q-${Q.ids[0]}`;
      out('qh').textContent = Q.help;
      out('qi').innerHTML = Q.range
        ? `${inputHTML(Q.ids[0], uid + 'q-', true)}<span class="wiz-to">to</span>${inputHTML(Q.ids[1], uid + 'q-', true)}`
        : inputHTML(Q.ids[0], uid + 'q-', true);
      out('qi').querySelectorAll('input').forEach((n) => { n.value = val[n.dataset.id]; });
      $('[data-a="back"]').style.visibility = qi ? 'visible' : 'hidden';
      $('[data-a="next"]').textContent = qi === QS.length - 1 ? 'Show me the money →' : 'Next →';
      const first = out('qi').querySelector('input');
      if (box.dataset.started) { first.focus({ preventScroll: true }); first.select(); }
      out('wiz').classList.remove('pop'); void out('wiz').offsetWidth; out('wiz').classList.add('pop');
    }
    function take(useTypical) {
      out('qi').querySelectorAll('input').forEach((n) => {
        const v = parseFloat(n.value), f = F[n.dataset.id];
        val[n.dataset.id] = useTypical || !Number.isFinite(v) || v < 0 ? f.v : f.max ? Math.min(v, f.max) : v;
      });
    }
    function next(useTypical) {
      box.dataset.started = 1;
      take(useTypical);
      if (qi < QS.length - 1) ask(qi + 1); else show();
    }
    function show() {
      out('wiz').hidden = true; $('.calc-run').hidden = false;
      sheet.querySelectorAll('input').forEach((n) => { n.value = val[n.dataset.id]; });
      calc();
      if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' });
    }

    /* ---- the math ---- */
    function calc() {
      const v = val;
      const [cLo, cHi] = [Math.min(v.convLo, v.convHi), Math.max(v.convLo, v.convHi)];
      const [oLo, oHi] = [Math.min(v.ordLo, v.ordHi), Math.max(v.ordLo, v.ordHi)];
      const people = v.visits > 0 ? (v.g * 12) / v.visits : 0;       // different people fed in a year
      const reach = people * (v.reach / 100);                         // the ones on the list
      const scen = (conv, ord) => {
        const cust = reach * (conv / 100);
        const ords = cust * v.freq;
        const rev = ords * ord;
        const current = v.now * 12 * ord;
        const missing = Math.max(0, rev - current);
        const cost = cust * v.ctc + v.fee * 12;
        return { cust, ords, missing, net: missing - cost };
      };
      const lo = scen(cLo, oLo), hi = scen(cHi, oHi);
      out('miss').textContent = range(lo.missing / 12, hi.missing / 12);
      out('peek-v').textContent = range(lo.missing / 12, hi.missing / 12) + '/mo';
      out('year').innerHTML = `That’s <b>${range(lo.missing, hi.missing)}</b> a year. After the cost to close them and the retainer: <b>${range(lo.net / 12, hi.net / 12)}</b> a month, <b>${range(lo.net, hi.net)}</b> a year.`;
      const year = v.spend * v.visits;
      out('l1').textContent = usd(v.spend);
      out('l2').textContent = usd(year);
      out('l3').textContent = range(year + v.freq * oLo, year + v.freq * oHi);
      out('lx').textContent = year > 0 ? `${num((year + v.freq * oLo) / year)}–${num((year + v.freq * oHi) / year)}× a regular` : '';
      out('reach').textContent = num(reach);
      out('cust').textContent = rangeN(lo.cust, hi.cust);
      out('ords').textContent = rangeN(lo.ords, hi.ords);
      out('line').innerHTML = `You feed about <b>${num(people)}</b> different people a year. Get <b>${num(v.reach)}%</b> of them on a list, and if <b>${num(cLo)}–${num(cHi)}%</b> order catering <b>${num(v.freq)}×</b> a year at <b>${range(oLo, oHi)}</b>, that’s <b>${rangeN(lo.ords, hi.ords)}</b> catering orders a year${v.now ? `, on top of the <b>${num(v.now * 12)}</b> you already get` : ''}. Right now those guests eat, pay ${usd(v.spend)} and leave.`;

      const qs = new URLSearchParams(Object.entries(v).map(([k, x]) => [k, String(x)]));
      box.dataset.link = `${location.origin}/calculator/?${qs}`;
      if (onPage && !$('.calc-run').hidden) history.replaceState(null, '', `?${qs}`);
      const lines = Object.entries(F).map(([id, f]) => `- ${f.label}: ${f.pre === '$' ? usd(v[id]) : v[id] + (f.post === '%' ? '%' : f.post || '')}`).join('\n');
      const body = `Hi Faris,\n\nI ran my buffet numbers in your catering calculator:\n\n${lines}\n\nCatering revenue I'm missing: ${range(lo.missing / 12, hi.missing / 12)} a month (${range(lo.missing, hi.missing)} a year).\n\n${box.dataset.link}\n\nMy restaurant: `;
      out('mail').href = `mailto:hello@naberstudio.com?subject=${encodeURIComponent('My catering numbers')}&body=${encodeURIComponent(body)}`;
    }

    sheet.addEventListener('input', (e) => {
      const n = e.target, v = parseFloat(n.value), f = F[n.dataset.id];
      if (!f || !Number.isFinite(v) || v < 0) return;
      val[n.dataset.id] = f.max ? Math.min(v, f.max) : v;
      calc();
    });
    sheet.addEventListener('focusout', (e) => { const n = e.target; if (n.dataset?.id && (n.value === '' || +n.value < 0)) n.value = val[n.dataset.id]; });
    out('wiz').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next(false); } });
    box.addEventListener('click', (e) => {
      const t = e.target.closest('[data-a]');
      if (!t) return;
      const a = t.dataset.a;
      if (a === 'next') next(false);
      else if (a === 'skip') next(true);
      else if (a === 'back') { take(false); ask(qi - 1); }
      else if (a === 'restart') { $('.calc-run').hidden = true; out('wiz').hidden = false; ask(0); out('wiz').scrollIntoView({ block: 'center' }); }
      else if (a === 'copy') {
        navigator.clipboard.writeText(box.dataset.link).then(() => { t.textContent = 'Link copied ✓'; }, () => prompt('Copy this link:', box.dataset.link));
        setTimeout(() => { t.textContent = 'Copy link to these numbers'; }, 2200);
      }
    });

    // on phones the result sits under the numbers: pin a small live readout while it's out of view
    let resVisible = false, sheetVisible = false;
    const peekCheck = () => { out('peek').hidden = $('.calc-run').hidden || resVisible || !sheetVisible; };
    new IntersectionObserver(([e]) => { resVisible = e.isIntersecting; peekCheck(); }, { threshold: 0.25 }).observe($('.calc-out'));
    new IntersectionObserver(([e]) => { sheetVisible = e.isIntersecting; peekCheck(); }).observe(sheet);

    // a shared link (with numbers) opens straight on the result
    if (onPage && [...q.keys()].some((k) => k in F)) show(); else ask(0);
  }

  document.querySelectorAll('[data-calc]').forEach(mount);
})();
