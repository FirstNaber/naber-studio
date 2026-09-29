/* Naber Studio catering opportunity calculator — ESTIMATED ADDITIONAL CATERING REVENUE only.
   Two opportunities, kept separate:
     1. Monthly: guests × phone capture rate = new numbers a month; × conversion (low/high) = additional bookings;
        × average catering order = potential additional monthly catering revenue (recurring).
     2. Existing database: existing numbers × conversion (low/high) × average order = potential one-time revenue.
   The optional cost per booking is shown as a secondary estimate. No food, labor or other costs are subtracted.
   It asks one question at a time, then shows the numbers. Renders into every [data-calc]. */
(() => {
  // every input; `convLo`/`convHi` are asked together as a range ("between __ and __")
  const F = {
    guests:  { label: 'Monthly buffet guests', pre: '', v: 1000, step: 50, group: 'buffet' },
    capture: { label: 'Guests who give their phone number', post: '%', v: 70, step: 5, max: 100, group: 'buffet' },
    spend:   { label: 'Average spend per buffet visit', pre: '$', v: 20, step: 1, group: 'buffet' },
    current: { label: 'Current catering bookings a month', pre: '', v: 10, step: 1, group: 'catering' },
    order:   { label: 'Average catering order', pre: '$', v: 1500, step: 50, group: 'catering' },
    convLo:  { label: 'Catering conversion rate: low', post: '%', v: 0.5, step: 0.05, max: 100, group: 'catering' },
    convHi:  { label: 'Catering conversion rate: high', post: '%', v: 1, step: 0.05, max: 100, group: 'catering' },
    list:    { label: 'Existing customer phone numbers', pre: '', v: 4000, step: 100, group: 'database' },
    cpb:     { label: 'Cost per catering booking (optional)', pre: '$', v: 20, step: 1, group: 'database' },
  };
  const GROUPS = { buffet: 'Buffet', catering: 'Catering', database: 'Existing database & cost' };

  // the questions, in order
  const QS = [
    { ids: ['guests'], title: 'How many guests eat at the buffet in a month?', help: 'Every person through the door. About 35 a day is roughly 1,000 a month.' },
    { ids: ['capture'], title: 'What share of guests give their phone number?', help: 'For a free drink, a birthday deal or a QR code on the table. 700 out of 1,000 guests is 70%.' },
    { ids: ['spend'], title: 'What does a guest spend per buffet visit?', help: 'The buffet price plus drinks, per person.' },
    { ids: ['current'], title: 'How many catering bookings do you get now, a month?', help: 'What already comes in on its own. The new bookings below are in addition to these.' },
    { ids: ['order'], title: 'What’s the average catering order worth?', help: 'Office lunches, birthdays, church events, family parties.' },
    { ids: ['convLo', 'convHi'], range: true, title: 'What share of contacts might book catering?', help: 'An estimate, not a known number: give a low and a high assumption. 0.5% is 1 in 200; 1% is 1 in 100.' },
    { ids: ['list'], title: 'How many customer phone numbers do you already have?', help: 'Past guests, online orders, reservations, loyalty sign-ups. Leave at 0 if none.' },
    { ids: ['cpb'], title: 'Optional: what might it cost to generate one catering booking?', help: 'Texts, follow-ups and offers, per booking. Leave at 0 to skip.' },
  ];

  const usd = (n) => (n < 0 ? '−$' : '$') + (Math.abs(n) < 10 && n % 1 ? Math.abs(n).toFixed(2) : Math.round(Math.abs(n)).toLocaleString('en-US'));
  const num = (n) => (Math.abs(n) >= 10 ? Math.round(n) : +n.toFixed(2)).toLocaleString('en-US');
  const range = (a, b) => (Math.round(a) === Math.round(b) ? usd(a) : `${usd(a)} – ${usd(b)}`);
  const rangeN = (a, b) => (num(a) === num(b) ? num(a) : `${num(a)} – ${num(b)}`);
  const pct = (n) => `${num(n)}%`;

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
          <button type="button" class="q-back" data-a="skip">Not sure: use the example number</button>
        </div>
      </div>
      <div class="calc-run" hidden>
        <div class="calc-chips"><span>Buffet customers → catering customers</span><button type="button" class="q-back" data-a="restart">Answer the questions again</button></div>
        <div class="calc">
          <form class="glass calc-in sheet" novalidate onsubmit="return false">
            ${Object.entries(GROUPS).map(([g, name]) => `<fieldset><legend>${name}</legend>${Object.entries(F).filter(([, f]) => f.group === g).map(([id, f]) => `<label class="sheet-row" for="${uid}${id}"><span>${f.label}</span>${inputHTML(id, uid)}</label>`).join('')}</fieldset>`).join('')}
          </form>
          <div class="glass calc-out" id="${uid}res" aria-live="polite">
            <p class="miss-k">Potential monthly catering revenue</p>
            <p class="miss range"><span data-o="miss"></span><small>/mo</small></p>
            <p class="miss-year" data-o="year"></p>
            <div class="pnl">
              <div><span>New contacts / mo</span><b data-o="nums"></b></div>
              <i aria-hidden="true">×</i>
              <div><span>Conversion (assumed)</span><b data-o="conv"></b></div>
              <i aria-hidden="true">=</i>
              <div class="hot"><span>Additional bookings / mo</span><b data-o="books"></b></div>
            </div>
            <p class="pnl-note" data-o="uplift"></p>
            <div class="db">
              <p class="k">Potential revenue from existing customer database</p>
              <p class="db-v" data-o="db"></p>
              <p class="db-k">One-time revenue opportunity from your existing database</p>
              <p class="db-line" data-o="dbline"></p>
            </div>
            <div class="ladder two" aria-label="What one guest could become">
              <div><span>One buffet visit</span><b data-o="l1"></b><em>eats, pays, leaves</em></div>
              <i aria-hidden="true">→</i>
              <div class="hot"><span>A catering relationship</span><b data-o="l2"></b><em data-o="lx"></em></div>
            </div>
            <div class="sens">
              <p class="k">At other conversion assumptions</p>
              <table><thead><tr><th>Conversion</th><th>Bookings / mo</th><th>Monthly revenue</th><th>Database, one-time</th></tr></thead><tbody data-o="sens"></tbody></table>
            </div>
            <p class="calc-line" data-o="line"></p>
            <p class="acq" data-o="acq"></p>
            <div class="calc-acts">
              <a class="btn btn-primary" data-o="mail" href="mailto:hello@naberstudio.com">Get this for my restaurant</a>
              <button class="btn btn-ghost" type="button" data-a="copy">Copy link to these numbers</button>
            </div>
            <p class="calc-note">Estimates are based on the assumptions entered and are not a guarantee of results. Revenue only: food, labor and other operating costs are not subtracted.</p>
          </div>
        </div>
        <a class="calc-peek" href="#${uid}res" data-o="peek" hidden><span>Potential</span><b data-o="peek-v"></b><i>See the math ↓</i></a>
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
      $('[data-a="next"]').textContent = qi === QS.length - 1 ? 'Show the opportunity →' : 'Next →';
      const first = out('qi').querySelector('input');
      if (box.dataset.started) { first.focus({ preventScroll: true }); first.select(); }
      out('wiz').classList.remove('pop'); void out('wiz').offsetWidth; out('wiz').classList.add('pop');
    }
    function take(useExample) {
      out('qi').querySelectorAll('input').forEach((n) => {
        const v = parseFloat(n.value), f = F[n.dataset.id];
        val[n.dataset.id] = useExample || !Number.isFinite(v) || v < 0 ? f.v : f.max ? Math.min(v, f.max) : v;
      });
    }
    function next(useExample) {
      box.dataset.started = 1;
      take(useExample);
      if (qi < QS.length - 1) ask(qi + 1); else show();
    }
    function show() {
      out('wiz').hidden = true; $('.calc-run').hidden = false;
      sheet.querySelectorAll('input').forEach((n) => { n.value = val[n.dataset.id]; });
      calc();
      if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' });
    }

    /* ---- the math: revenue only ---- */
    function calc() {
      const v = val;
      const [cLo, cHi] = [Math.min(v.convLo, v.convHi), Math.max(v.convLo, v.convHi)];
      const nums = v.guests * (v.capture / 100);                      // new phone numbers a month
      const at = (conv) => {
        const books = nums * (conv / 100);                            // additional catering bookings a month
        const dbBooks = v.list * (conv / 100);                        // potential bookings from the existing database
        return { books, rev: books * v.order, dbBooks, dbRev: dbBooks * v.order };
      };
      const lo = at(cLo), hi = at(cHi);
      out('miss').textContent = range(lo.rev, hi.rev);
      out('peek-v').textContent = range(lo.rev, hi.rev) + '/mo';
      out('year').innerHTML = `Potential recurring monthly revenue from newly captured customers: about <b>${range(lo.rev * 12, hi.rev * 12)}</b> over 12 months at the assumptions entered.`;
      out('nums').textContent = num(nums);
      out('conv').textContent = cLo === cHi ? pct(cLo) : `${pct(cLo)} – ${pct(cHi)}`;
      out('books').textContent = rangeN(lo.books, hi.books);
      out('uplift').textContent = v.current > 0
        ? `In addition to the ${num(v.current)} catering bookings a month you get now (+${num((lo.books / v.current) * 100)}% to +${num((hi.books / v.current) * 100)}%).`
        : 'In addition to any catering bookings you get now.';
      out('db').textContent = v.list > 0 ? range(lo.dbRev, hi.dbRev) : '—';
      out('dbline').innerHTML = v.list > 0
        ? `If ${cLo === cHi ? pct(cLo) : `${pct(cLo)}–${pct(cHi)}`} of your ${num(v.list)} existing customers booked a catering order, that’s <b>${rangeN(lo.dbBooks, hi.dbBooks)}</b> bookings and the resulting revenue would be approximately <b>${range(lo.dbRev, hi.dbRev)}</b>. Your restaurant may already have a valuable catering audience hiding in its customer database. This is separate from the monthly number above.`
        : 'Add the number of customer phone numbers you already have to see this opportunity.';
      out('l1').textContent = usd(v.spend);
      out('l2').textContent = usd(v.order) + '+';
      out('lx').textContent = 'One $' + num(v.spend) + ' buffet visit can become a ' + usd(v.order) + '+ catering relationship';
      // conversion is an assumption, so show a spread; rows inside the chosen range are highlighted
      out('sens').innerHTML = [...new Set([0.25, 0.5, 0.75, 1, 2, cLo, cHi])].sort((a, b) => a - b).map((c) => {
        const r = at(c);
        return `<tr class="${c >= cLo && c <= cHi ? 'in' : ''}"><td>${pct(c)}</td><td>${num(r.books)}</td><td>${usd(r.rev)}</td><td>${v.list > 0 ? usd(r.dbRev) : '—'}</td></tr>`;
      }).join('');
      out('line').innerHTML = `Turn existing buffet customers into catering customers. <b>${num(v.guests)}</b> guests a month × <b>${pct(v.capture)}</b> who give a number = <b>${num(nums)}</b> new contacts a month. At <b>${cLo === cHi ? pct(cLo) : `${pct(cLo)}–${pct(cHi)}`}</b> conversion, that’s <b>${rangeN(lo.books, hi.books)}</b> additional bookings × <b>${usd(v.order)}</b> = <b>${range(lo.rev, hi.rev)}</b> a month.`;
      out('acq').innerHTML = v.cpb > 0
        ? `Estimated cost to generate those bookings: <b>${range(lo.books * v.cpb, hi.books * v.cpb)}</b> a month${v.list > 0 ? `, and <b>${range(lo.dbBooks * v.cpb, hi.dbBooks * v.cpb)}</b> one-time for the existing database` : ''} (at ${usd(v.cpb)} per booking).`
        : '';

      const qs = new URLSearchParams(Object.entries(v).map(([k, x]) => [k, String(x)]));
      box.dataset.link = `${location.origin}/calculator/?${qs}`;
      if (onPage && !$('.calc-run').hidden) history.replaceState(null, '', `?${qs}`);
      const lines = Object.entries(F).map(([id, f]) => `- ${f.label}: ${f.pre === '$' ? usd(v[id]) : v[id] + (f.post || '')}`).join('\n');
      const body = `Hi Faris,\n\nI ran my numbers in your catering calculator:\n\n${lines}\n\nPotential monthly catering revenue: ${range(lo.rev, hi.rev)}\nPotential revenue from existing customer database (one-time): ${v.list > 0 ? range(lo.dbRev, hi.dbRev) : 'n/a'}\n\n${box.dataset.link}\n\nMy restaurant: `;
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
