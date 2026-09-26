/* "What are you missing?" calculator. It asks what kind of business it is and whether they have their numbers,
   then builds a calculator for that business model: Meta ad spend and cost per customer in; new customers,
   revenue and the money left on the table out. Renders into every [data-calc]. */
(() => {
  const SPEND = { id: 'spend', label: 'Monthly ad spend', hint: 'Facebook + Instagram (Meta)', where: 'Ads Manager → Amount spent, last 30 days', pre: '$', min: 100, max: 50000, step: 50, log: true };
  const FEE = { id: 'fee', label: 'Naber Studio retainer', hint: 'per month', pre: '$', v: 99, min: 0, max: 5000, step: 1 };
  const MARGIN = { id: 'margin', post: '%', v: 100, min: 5, max: 100, step: 1 };

  // Each business model: its own words, questions and sample numbers. `party` only exists where one customer brings others.
  const MODELS = {
    restaurant: {
      name: 'Restaurant or café', eg: 'Buffets, diners, cafés, bars, food trucks', one: 'guest', many: 'guests', first: 'visit', spend: 1000,
      fields: [
        { id: 'cpa', label: 'Cost per new guest', hint: 'what the ads pay for one guest', where: 'Ads Manager → Cost per result', pre: '$', v: 8, min: 1, max: 300, step: 0.5, log: true },
        { id: 'aov', label: 'Spend per person, per visit', hint: 'e.g. $20 for the buffet', where: 'Your register: sales ÷ covers', pre: '$', v: 20, min: 2, max: 500, step: 1, log: true },
        { id: 'party', label: 'People per visit', hint: 'the guest plus who they bring', where: 'Your register: covers ÷ checks', post: '×', v: 2, min: 1, max: 12, step: 0.5 },
        { id: 'repeat', label: 'Visits per guest in a year', hint: 'including the first one', where: 'Loyalty app or your best guess', post: '×', v: 4, min: 1, max: 52, step: 1 },
      ],
      more: [{ id: 'close', label: 'Guests who actually come in', hint: 'of the ones the ad reaches', where: 'Redeemed offers ÷ claimed offers', post: '%', v: 100, min: 5, max: 100, step: 1 }],
      margin: 'Kept after food and labor costs',
    },
    shop: {
      name: 'Shop or retail', eg: 'Boutiques, gift and crystal shops, bookshops, plant shops', one: 'customer', many: 'customers', first: 'purchase', spend: 1000,
      fields: [
        { id: 'cpa', label: 'Cost per new customer', hint: 'what the ads pay for one customer', where: 'Ads Manager → Cost per result', pre: '$', v: 15, min: 1, max: 500, step: 1, log: true },
        { id: 'aov', label: 'Average sale', hint: 'what one customer spends per visit', where: 'Your register: sales ÷ transactions', pre: '$', v: 45, min: 2, max: 5000, step: 1, log: true },
        { id: 'repeat', label: 'Purchases per customer in a year', hint: 'including the first one', where: 'Your register or your best guess', post: '×', v: 3, min: 1, max: 52, step: 1 },
      ],
      more: [{ id: 'close', label: 'People who come in and buy', hint: 'of the ones the ad brings', where: 'Your best guess', post: '%', v: 100, min: 5, max: 100, step: 1 }],
      margin: 'Kept after the cost of what you sell',
    },
    services: {
      name: 'Appointments', eg: 'Salons, barbers, gyms, tattoo, clinics, detailing', one: 'client', many: 'clients', spend: 1500, first: 'appointment',
      fields: [
        { id: 'cpa', label: 'Cost per booked appointment', hint: 'what the ads pay for one booking', where: 'Ads Manager → Cost per result', pre: '$', v: 25, min: 1, max: 500, step: 1, log: true },
        { id: 'close', label: 'Bookings that show up', hint: 'and pay', where: 'Your booking app: completed ÷ booked', post: '%', v: 85, min: 5, max: 100, step: 1 },
        { id: 'aov', label: 'Price per visit', hint: 'what one appointment brings in', where: 'Your booking app: average ticket', pre: '$', v: 60, min: 5, max: 5000, step: 1, log: true },
        { id: 'repeat', label: 'Visits per client in a year', hint: 'including the first one', where: 'Your booking app: visits ÷ clients', post: '×', v: 6, min: 1, max: 52, step: 1 },
      ],
      more: [],
      margin: 'Kept after supplies and staff pay',
    },
    store: {
      name: 'Online store', eg: 'Shopify, Etsy, eBay, shipping orders', one: 'buyer', many: 'buyers', first: 'order', spend: 2000,
      fields: [
        { id: 'cpa', label: 'Cost per purchase', hint: 'what the ads pay for one order', where: 'Ads Manager → Cost per purchase', pre: '$', v: 30, min: 1, max: 500, step: 1, log: true },
        { id: 'aov', label: 'Average order', hint: 'what one order is worth', where: 'Store dashboard → Average order value', pre: '$', v: 80, min: 5, max: 5000, step: 1, log: true },
        { id: 'repeat', label: 'Orders per buyer in a year', hint: 'including the first one', where: 'Store dashboard → returning customer rate', post: '×', v: 1.5, min: 1, max: 24, step: 0.5 },
      ],
      more: [],
      margin: 'Kept after product, shipping and fees',
    },
    leads: {
      name: 'Quotes & big jobs', eg: 'Contractors, auto repair, med spas, event venues', one: 'client', many: 'clients', spend: 2000, first: 'job',
      fields: [
        { id: 'cpa', label: 'Cost per lead', hint: 'a call, form or message', where: 'Ads Manager → Cost per lead', pre: '$', v: 40, min: 1, max: 1000, step: 1, log: true },
        { id: 'close', label: 'Leads that become jobs', hint: 'your close rate', where: 'Your CRM or quote book: won ÷ leads', post: '%', v: 20, min: 1, max: 100, step: 1 },
        { id: 'aov', label: 'Average job size', hint: 'what one job is worth', where: 'Your invoices: average invoice', pre: '$', v: 1500, min: 50, max: 100000, step: 50, log: true },
        { id: 'repeat', label: 'Jobs per client in a year', hint: 'including the first one', where: 'Your invoices or your best guess', post: '×', v: 1, min: 1, max: 12, step: 0.5 },
      ],
      more: [],
      margin: 'Kept after materials and labor',
    },
  };
  const usd = (n) => (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
  const num = (n) => (Math.abs(n) >= 10 ? Math.round(n) : +n.toFixed(1)).toLocaleString('en-US');
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  function fieldsFor(key) {
    const m = MODELS[key];
    const main = [{ ...SPEND, v: m.spend }, ...m.fields, FEE];
    const more = [...m.more, { ...MARGIN, label: m.margin, hint: 'leave at 100% to see revenue', where: 'Your books: gross margin' }];
    return { main, more, all: [...main, ...more] };
  }

  function fieldHTML(f, uid) {
    return `<div class="field">
      <label for="${uid}c-${f.id}">${f.label} <small>${f.hint}</small></label>
      <div class="row">
        <input type="range" id="${uid}r-${f.id}" min="${f.log ? 0 : f.min}" max="${f.log ? 1000 : f.max}" step="${f.log ? 1 : f.step}" aria-label="${f.label}" tabindex="-1">
        <span class="money" ${f.pre ? `data-pre="${f.pre}"` : `data-post="${f.post}"`}><input id="${uid}c-${f.id}" type="number" inputmode="decimal" min="0" step="${f.step}"></span>
      </div>
      ${f.where ? `<p class="where">Where to find it: ${f.where}</p>` : ''}</div>`;
  }

  let uidN = 0;
  function mount(box) {
    const uid = 'k' + ++uidN + '-';
    const onPage = box.hasAttribute('data-url');    // the /calculator/ page keeps the answers in its URL
    const q = new URLSearchParams(location.search);
    const st = { model: null, known: false, count: 'year', val: {} };

    box.innerHTML = `
      <ol class="calc-steps" aria-label="Steps"><li data-s="1"><span>01</span> Your business</li><li data-s="2"><span>02</span> Your numbers</li><li data-s="3"><span>03</span> The math</li></ol>
      <div class="calc-q" data-q="1">
        <p class="q-title">What kind of business is it?</p>
        <div class="q-cards five">${Object.entries(MODELS).map(([k, m]) => `<button type="button" class="glass q-card" data-model="${k}"><b>${m.name}</b><span>${m.eg}</span></button>`).join('')}</div>
      </div>
      <div class="calc-q" data-q="2" hidden>
        <p class="q-title">Do you know your numbers?</p>
        <div class="q-cards two">
          <button type="button" class="glass q-card" data-known="1"><b>Yes, I have them</b><span>From Ads Manager and your register, booking app or store. I’ll show you where each one lives.</span></button>
          <button type="button" class="glass q-card" data-known="0"><b>Not yet</b><span>Start with sample numbers for this kind of business, then change anything you know.</span></button>
        </div>
        <button type="button" class="q-back" data-back="1">← Change business type</button>
      </div>
      <div class="calc-run" hidden>
        <div class="calc-chips"><span data-o="model"></span><button type="button" class="q-back" data-back="1">Change business</button><button type="button" class="q-back" data-back="2">Change numbers</button></div>
        <div class="calc">
          <form class="glass calc-in" novalidate onsubmit="return false"></form>
          <div class="glass calc-out" id="${uid}res" aria-live="polite">
            <div class="seg" role="group" aria-label="What to count">
              <button type="button" data-count="visit">First visit only</button><button type="button" data-count="year">Over a year</button>
            </div>
            <p class="miss-k" data-o="k"></p>
            <p class="miss"><span data-o="miss">$0</span><small>/mo</small></p>
            <p class="miss-year" data-o="year"></p>
            <div class="flow">
              <div><span data-o="cust-k">New customers / mo</span><b data-o="cust">0</b></div>
              <div><span data-o="rev-k">Revenue / mo</span><b data-o="rev">$0</b></div>
              <div><span>Return on ads</span><b data-o="roas">0×</b></div>
            </div>
            <div class="bars">
              <div class="bar-row"><span data-o="bar-k">Revenue</span><i data-o="b-rev" style="--c:var(--t)"></i><b data-o="t-rev"></b></div>
              <div class="bar-row"><span>Ad spend</span><i data-o="b-ads" style="--c:var(--o)"></i><b data-o="t-ads"></b></div>
              <div class="bar-row"><span>Retainer</span><i data-o="b-fee" style="--c:var(--y)"></i><b data-o="t-fee"></b></div>
            </div>
            <p class="calc-line" data-o="line"></p>
            <div class="calc-acts">
              <a class="btn btn-primary" data-o="mail" href="mailto:hello@naberstudio.com">Get this for my business</a>
              <button class="btn btn-ghost" type="button" data-o="copy">Copy link to these numbers</button>
            </div>
            <p class="calc-note">An estimate from the numbers you enter, not a guarantee. Real ad costs change with your offer, audience and season.</p>
          </div>
        </div>
        <a class="calc-peek" href="#${uid}res" data-o="peek" hidden><span data-o="peek-k">Missing out</span><b data-o="peek-v">$0/mo</b><i>See the math ↓</i></a>
      </div>`;
    const $ = (s) => box.querySelector(s), out = (k) => box.querySelector(`[data-o="${k}"]`);
    const form = $('.calc-in');
    const focusFirst = (sel) => { const el = $(sel); if (el) el.focus({ preventScroll: true }); };

    function step(n) {
      box.querySelectorAll('.calc-q').forEach((el) => { el.hidden = +el.dataset.q !== n; });
      $('.calc-run').hidden = n !== 3;
      box.querySelectorAll('.calc-steps li').forEach((li) => { li.classList.toggle('on', +li.dataset.s === n); li.classList.toggle('done', +li.dataset.s < n); });
      box.dataset.step = n;
      if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' });
      peekCheck();
    }

    function build(fromUrl) {
      const m = MODELS[st.model], F = fieldsFor(st.model);
      box.dataset.model = st.model;
      out('model').textContent = `${m.name} · ${st.known ? 'your numbers' : 'sample numbers, change anything'}`;
      form.innerHTML = F.main.map((f) => fieldHTML(f, uid)).join('') +
        `<details class="calc-more"${st.known ? ' open' : ''}><summary>Fine-tune</summary>${F.more.map((f) => fieldHTML(f, uid)).join('')}</details>`;
      form.classList.toggle('known', st.known);    // "where to find it" hints show for people entering their own numbers
      st.val = {};
      for (const f of F.all) {
        const p = fromUrl ? parseFloat(q.get(f.id)) : NaN;
        st.val[f.id] = Number.isFinite(p) && p >= 0 ? p : f.v;
        wire(f);
      }
      if (fromUrl && F.more.some((f) => st.val[f.id] !== f.v)) $('.calc-more').open = true;
      out('cust-k').textContent = `New ${m.many} / mo`;
      $('[data-count="visit"]').textContent = `First ${m.first} only`;
      calc();
    }

    function wire(f) {
      const n = box.querySelector(`#${uid}c-${f.id}`), r = box.querySelector(`#${uid}r-${f.id}`);
      // money sliders move on a log scale, so $8 and $800 both get room; typed values can go past the ends
      const toR = (v) => { v = Math.min(Math.max(v, f.min), f.max); return f.log ? Math.round(1000 * Math.log(v / f.min) / Math.log(f.max / f.min)) : v; };
      const fromR = (x) => { if (!f.log) return x; const v = f.min * Math.pow(f.max / f.min, x / 1000); return Math.round(v / f.step) * f.step; };
      const paint = () => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
      const sync = (from) => {
        let v = parseFloat(from.value);
        if (!Number.isFinite(v) || v < 0) return;
        if (from === r) { v = fromR(v); n.value = v; } else r.value = toR(v);
        st.val[f.id] = f.post === '%' ? Math.min(v, 100) : v;
        paint(); calc();
      };
      n.value = st.val[f.id]; r.value = toR(st.val[f.id]); paint();
      n.addEventListener('input', () => sync(n));
      r.addEventListener('input', () => sync(r));
      n.addEventListener('blur', () => { if (n.value === '' || +n.value < 0) n.value = st.val[f.id]; });
    }

    function calc() {
      const m = MODELS[st.model], v = st.val;
      const party = v.party ?? 1, close = v.close ?? 100, repeat = st.count === 'year' ? (v.repeat ?? 1) : 1, margin = v.margin ?? 100;
      const results = v.cpa > 0 ? v.spend / v.cpa : 0;               // what the ads pay for: guests, bookings, leads, purchases
      const won = results * (close / 100);                            // the ones who actually buy
      const rev = won * v.aov * party * repeat;
      const kept = rev * (margin / 100);
      const cost = v.spend + v.fee;
      const net = kept - cost;
      const roas = v.spend > 0 ? rev / v.spend : 0;
      const breakEven = cost > 0 ? v.cpa * (kept / cost) : 0;         // highest cost per result that still pays for itself
      const loss = net < 0, profit = margin < 100;
      const span = st.count === 'year' ? 'over their first year' : `on their first ${m.first}`;
      const shown = profit ? kept : rev;
      box.querySelectorAll('[data-count]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.count === st.count)));
      $('.calc-out').classList.toggle('loss', loss);
      out('k').textContent = loss ? 'At these numbers you’d lose' : 'Money you’re missing out on';
      out('miss').textContent = usd(net);
      out('peek-k').textContent = loss ? 'You’d lose' : 'Missing out';
      out('peek-v').textContent = usd(net) + '/mo';
      out('peek').classList.toggle('loss', loss);
      out('year').innerHTML = loss
        ? `The ads cost more than they bring in. ${cap(m.many)} can cost at most <b>${usd(breakEven)}</b> each to break even.`
        : st.count === 'year'
          ? `Every month of ads wins ${m.many} worth that much over their first year, after ad spend and the retainer${profit ? ' and your costs' : ''}. Twelve months: <b>${usd(net * 12)}</b>.`
          : `That’s <b>${usd(net * 12)}</b> a year left on the table from first ${m.first}s alone, after ad spend and the retainer${profit ? ' and your costs' : ''}.`;
      out('cust').textContent = num(won);
      out('rev-k').textContent = profit ? 'You keep / mo' : 'Revenue / mo';
      out('rev').textContent = usd(shown);
      out('roas').textContent = num(roas) + '×';
      out('bar-k').textContent = profit ? 'You keep' : 'Revenue';
      const top = Math.max(shown, v.spend, v.fee, 1);
      out('b-rev').style.setProperty('--w', (shown / top) * 100 + '%'); out('t-rev').textContent = usd(shown);
      out('b-ads').style.setProperty('--w', (v.spend / top) * 100 + '%'); out('t-ads').textContent = usd(v.spend);
      out('b-fee').style.setProperty('--w', (v.fee / top) * 100 + '%'); out('t-fee').textContent = usd(v.fee);
      const who = party > 1 ? `${num(won)} new ${m.many} a month (${num(won * party)} people through the door)` : `${num(won)} new ${m.many} a month`;
      out('line').innerHTML = `The ads bring in <b>${who}</b>, worth <b>${usd(rev)}</b> ${span}.` +
        (cost > 0 && !loss ? ` You stay profitable while one costs under <b>${usd(breakEven)}</b>.` : '');

      const qs = new URLSearchParams({ model: st.model, count: st.count, ...Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)])) });
      box.dataset.link = `${location.origin}/calculator/?${qs}`;
      if (onPage) history.replaceState(null, '', `?${qs}`);
      const lines = fieldsFor(st.model).all.map((f) => `- ${f.label}: ${f.pre ? usd(v[f.id]) : v[f.id] + (f.post === '%' ? '%' : '')}`).join('\n');
      const body = `Hi Faris,\n\nI ran my numbers in your calculator (${m.name}):\n\n${lines}\n\nEstimate: ${num(won)} new ${m.many} a month, worth ${usd(rev)} ${span}. ${usd(net)} a month after costs.\n\n${box.dataset.link}\n\nMy business: `;
      out('mail').href = `mailto:hello@naberstudio.com?subject=${encodeURIComponent('My numbers from the calculator')}&body=${encodeURIComponent(body)}`;
    }

    // on phones the result sits under the inputs: pin a small live readout to the bottom while it's out of view
    let resVisible = false, inputsVisible = false;
    function peekCheck() { out('peek').hidden = box.dataset.step !== '3' || resVisible || !inputsVisible; }
    new IntersectionObserver(([e]) => { resVisible = e.isIntersecting; peekCheck(); }, { threshold: 0.25 }).observe($('.calc-out'));
    new IntersectionObserver(([e]) => { inputsVisible = e.isIntersecting; peekCheck(); }).observe(form);

    box.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t || !box.contains(t)) return;
      if (t.dataset.model) { st.model = t.dataset.model; step(2); focusFirst('[data-q="2"] .q-card'); }
      else if (t.dataset.known) { st.known = t.dataset.known === '1'; build(false); step(3); if (st.known) focusFirst('.calc-in input[type=number]'); }
      else if (t.dataset.back) { step(+t.dataset.back); focusFirst(`[data-q="${t.dataset.back}"] .q-card`); }
      else if (t.dataset.count) { st.count = t.dataset.count; calc(); }
      else if (t.dataset.o === 'copy') {
        navigator.clipboard.writeText(box.dataset.link).then(() => { t.textContent = 'Link copied ✓'; }, () => prompt('Copy this link:', box.dataset.link));
        setTimeout(() => { t.textContent = 'Copy link to these numbers'; }, 2200);
      }
    });

    // a shared link opens straight on that business's calculator
    if (onPage && MODELS[q.get('model')]) {
      st.model = q.get('model'); st.count = q.get('count') === 'visit' ? 'visit' : 'year'; st.known = true;
      build(true); step(3);
    } else step(1);
  }

  document.querySelectorAll('[data-calc]').forEach(mount);
})();
