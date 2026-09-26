/* "What are you missing?" — buffet guests → catering bookings, through their phone numbers.
   Guests walk in every month, eat, pay about $20 and leave without knowing the restaurant caters. Some give a phone number;
   texting that list books catering orders. It asks for the numbers one question at a time, then shows the catering profit
   being missed as a range: catering revenue minus Naber Studio's cost to get each booking (no food cost).
   Renders into every [data-calc]. */
(() => {
  // every number the calculator needs; `convLo`/`convHi` are asked as a range ("between __ and __")
  const F = {
    guests:  { label: 'Guests a month', pre: '', v: 1000, step: 50, group: 'buffet' },
    capture: { label: 'Guests who give their number', post: '%', v: 50, step: 5, max: 100, group: 'buffet' },
    spend:   { label: 'Spend per guest, per visit', pre: '$', v: 20, step: 1, group: 'buffet' },
    convLo:  { label: 'Who book catering: low', post: '%', v: 0.25, step: 0.05, max: 100, group: 'catering' },
    convHi:  { label: 'Who book catering: high', post: '%', v: 1, step: 0.05, max: 100, group: 'catering' },
    order:   { label: 'Catering order', pre: '$', v: 1500, step: 50, group: 'catering' },
    cpb:     { label: 'Your cost to get one booking', pre: '$', v: 20, step: 1, group: 'cost' },
    list:    { label: 'Numbers they already have', pre: '', v: 0, step: 50, group: 'cost' },
  };
  const GROUPS = { buffet: 'The buffet', catering: 'Catering', cost: 'Your side' };

  // the questions, in order
  const QS = [
    { ids: ['guests'], title: 'How many guests eat there in a month?', help: 'Every person through the door. About 35 a day is roughly 1,000 a month.' },
    { ids: ['capture'], title: 'How many of them give their phone number?', help: 'For a free drink, a birthday deal or a QR code on the table. 500 out of 1,000 guests is 50%.' },
    { ids: ['spend'], title: 'What does one guest spend per visit?', help: 'The buffet price plus drinks. Right now that’s all they spend, because they don’t know about catering.' },
    { ids: ['convLo', 'convHi'], range: true, title: 'Of the numbers you text, how many book catering?', help: 'Nobody knows this in advance, so it’s an assumed range: a low and a high guess. 0.25% is 1 in 400; 1% is 1 in 100.' },
    { ids: ['order'], title: 'What’s a catering order worth?', help: 'The average booking: office lunches, birthdays, church events, family parties.' },
    { ids: ['cpb'], title: 'What does it cost you to get one catering booking from the list?', help: 'Your texts, follow-ups and offer, per booking. Food cost isn’t counted.' },
    { ids: ['list'], title: 'How many numbers do they already have?', help: 'From before you start: past guests, online orders, reservations. Texting them is a one-time boost on top. Leave at 0 if none.' },
  ];

  const usd = (n) => (n < 0 ? '−$' : '$') + (Math.abs(n) < 10 && n % 1 ? Math.abs(n).toFixed(2) : Math.round(Math.abs(n)).toLocaleString('en-US'));
  const num = (n) => (Math.abs(n) >= 10 ? Math.round(n) : +n.toFixed(2)).toLocaleString('en-US');
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
        <div class="calc-chips"><span>Buffet guests → catering bookings</span><button type="button" class="q-back" data-a="restart">Answer the questions again</button></div>
        <div class="calc">
          <form class="glass calc-in sheet" novalidate onsubmit="return false">
            ${Object.entries(GROUPS).map(([g, name]) => `<fieldset><legend>${name}</legend>${Object.entries(F).filter(([, f]) => f.group === g).map(([id, f]) => `<label class="sheet-row" for="${uid}${id}"><span>${f.label}</span>${inputHTML(id, uid)}</label>`).join('')}</fieldset>`).join('')}
          </form>
          <div class="glass calc-out" id="${uid}res" aria-live="polite">
            <p class="miss-k">Catering profit they’re missing</p>
            <p class="miss range"><span data-o="miss"></span><small>/mo</small></p>
            <p class="miss-year" data-o="year"></p>
            <div class="pnl">
              <div><span>Catering revenue</span><b data-o="rev"></b></div>
              <i aria-hidden="true">−</i>
              <div><span>Your cost to get the bookings</span><b data-o="cost"></b></div>
              <i aria-hidden="true">=</i>
              <div class="hot"><span>Profit</span><b data-o="profit"></b></div>
            </div>
            <p class="pnl-note">A month, low to high. No food cost.</p>
            <div class="flow">
              <div><span>Numbers collected / mo</span><b data-o="nums"></b></div>
              <div><span>Catering bookings / mo</span><b data-o="books"></b></div>
              <div><span>Profit per $1 you spend</span><b data-o="roi"></b></div>
            </div>
            <div class="ladder two" aria-label="What one guest could be worth">
              <div><span>What a guest spends now</span><b data-o="l1"></b><em>eats, pays, leaves</em></div>
              <i aria-hidden="true">→</i>
              <div class="hot"><span>If they book catering</span><b data-o="l2"></b><em data-o="lx"></em></div>
            </div>
            <div class="sens">
              <p class="k">Assumed booking rate: if this share of the numbers book catering</p>
              <table><thead><tr><th>Of the numbers</th><th>Bookings / mo</th><th>Profit / mo</th><th>Profit / yr</th></tr></thead><tbody data-o="sens"></tbody></table>
            </div>
            <p class="calc-line" data-o="line"></p>
            <div class="calc-acts">
              <a class="btn btn-primary" data-o="mail" href="mailto:hello@naberstudio.com">Get this for my restaurant</a>
              <button class="btn btn-ghost" type="button" data-a="copy">Copy link to these numbers</button>
            </div>
            <p class="calc-note">A range from the numbers you enter, not a guarantee. Profit here is catering revenue minus the cost to get each booking; food cost isn’t counted.</p>
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

    /* ---- the math: numbers collected → bookings → revenue − your cost = profit ---- */
    function calc() {
      const v = val;
      const [cLo, cHi] = [Math.min(v.convLo, v.convHi), Math.max(v.convLo, v.convHi)];
      const nums = v.guests * (v.capture / 100);                      // phone numbers collected every month
      const scen = (conv) => {
        const books = nums * (conv / 100);
        const rev = books * v.order;
        const cost = books * v.cpb;
        const oneTime = v.list * (conv / 100) * (v.order - v.cpb);    // texting the numbers they already have, once
        return { books, rev, cost, profit: rev - cost, oneTime };
      };
      const lo = scen(cLo), hi = scen(cHi);
      out('miss').textContent = range(lo.profit, hi.profit);
      out('peek-v').textContent = range(lo.profit, hi.profit) + '/mo';
      out('year').innerHTML = `That’s <b>${range(lo.profit * 12, hi.profit * 12)}</b> a year${v.list ? `, plus a one-time <b>${range(lo.oneTime, hi.oneTime)}</b> from the ${num(v.list)} numbers they already have` : ''}.`;
      out('rev').textContent = range(lo.rev, hi.rev);
      out('cost').textContent = range(lo.cost, hi.cost);
      out('profit').textContent = range(lo.profit, hi.profit);
      out('nums').textContent = num(nums);
      out('books').textContent = rangeN(lo.books, hi.books);
      out('roi').textContent = v.cpb > 0 ? usd((v.order - v.cpb) / v.cpb) : '—';
      out('l1').textContent = usd(v.spend);
      out('l2').textContent = usd(v.spend + v.order);
      out('lx').textContent = v.spend > 0 ? `${num(v.order / v.spend)}× a buffet visit, in one order` : '';
      // the booking rate is an assumption, so show a spread of them; rows inside the chosen range are highlighted
      out('sens').innerHTML = [...new Set([0.25, 0.5, 0.75, 1, 2, cLo, cHi])].sort((a, b) => a - b).map((c) => {
        const r = scen(c);
        return `<tr class="${c >= cLo && c <= cHi ? 'in' : ''}"><td>${num(c)}%</td><td>${num(r.books)}</td><td>${usd(r.profit)}</td><td>${usd(r.profit * 12)}</td></tr>`;
      }).join('');
      out('line').innerHTML = `<b>${num(v.guests)}</b> guests a month eat, pay <b>${usd(v.spend)}</b> and leave without knowing they cater. <b>${num(nums)}</b> of them give a number. If <b>${num(cLo)}–${num(cHi)}%</b> of those book a <b>${usd(v.order)}</b> order, that’s <b>${rangeN(lo.books, hi.books)}</b> bookings a month at <b>${usd(v.cpb)}</b> each to get.`;

      const qs = new URLSearchParams(Object.entries(v).map(([k, x]) => [k, String(x)]));
      box.dataset.link = `${location.origin}/calculator/?${qs}`;
      if (onPage && !$('.calc-run').hidden) history.replaceState(null, '', `?${qs}`);
      const lines = Object.entries(F).map(([id, f]) => `- ${f.label}: ${f.pre === '$' ? usd(v[id]) : v[id] + (f.post || '')}`).join('\n');
      const body = `Hi Faris,\n\nI ran my numbers in your catering calculator:\n\n${lines}\n\nCatering profit I'm missing: ${range(lo.profit, hi.profit)} a month (${range(lo.profit * 12, hi.profit * 12)} a year).\n\n${box.dataset.link}\n\nMy restaurant: `;
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
