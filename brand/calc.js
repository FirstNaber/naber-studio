/* "What are you missing?" calculator: Meta ad spend, cost per booked customer, retainer and order size
   in; customers, revenue and the money left on the table out. Renders into every [data-calc]. */
(() => {
  const FIELDS = [
    { id: 'spend', label: 'Monthly ad spend', hint: 'Facebook + Instagram (Meta)', pre: '$', v: 1500, min: 100, max: 50000, step: 50, log: true },
    { id: 'cpa', label: 'Cost per booked customer', hint: 'what the ads pay for one customer', pre: '$', v: 40, min: 2, max: 1000, step: 1, log: true },
    { id: 'aov', label: 'Average order size', hint: 'what one customer spends', pre: '$', v: 250, min: 10, max: 10000, step: 5, log: true },
    { id: 'fee', label: 'Naber Studio retainer', hint: 'per month', pre: '$', v: 99, min: 0, max: 5000, step: 1 },
  ];
  const MORE = [
    { id: 'close', label: 'Booked customers who buy', hint: 'show-up / close rate', post: '%', v: 100, min: 5, max: 100, step: 1 },
    { id: 'orders', label: 'Orders per customer', hint: 'in their first year', post: '×', v: 1, min: 1, max: 12, step: 0.5 },
  ];
  const ALL = [...FIELDS, ...MORE];
  const usd = (n) => (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
  const num = (n, d = 1) => (Math.abs(n) >= 10 ? Math.round(n) : +n.toFixed(d)).toLocaleString('en-US');

  function fieldHTML(f) {
    return `<div class="field">
      <label for="c-${f.id}">${f.label} <small>${f.hint}</small></label>
      <div class="row">
        <input type="range" id="r-${f.id}" min="${f.log ? 0 : f.min}" max="${f.log ? 1000 : f.max}" step="${f.log ? 1 : f.step}" aria-label="${f.label}" tabindex="-1">
        <span class="money" ${f.pre ? `data-pre="${f.pre}"` : `data-post="${f.post}"`}><input id="c-${f.id}" type="number" inputmode="decimal" min="0" step="${f.step}"></span>
      </div></div>`;
  }

  function mount(box) {
    const onPage = box.hasAttribute('data-url');    // the /calculator/ page keeps the numbers in its URL
    box.innerHTML = `
      <form class="glass calc-in" novalidate onsubmit="return false">
        ${FIELDS.map(fieldHTML).join('')}
        <details class="calc-more"><summary>Fine-tune</summary>${MORE.map(fieldHTML).join('')}</details>
      </form>
      <div class="glass calc-out" aria-live="polite">
        <p class="miss-k" data-o="k">Money you’re missing out on</p>
        <p class="miss"><span data-o="miss">$0</span><small>/mo</small></p>
        <p class="miss-year" data-o="year"></p>
        <div class="flow">
          <div><span>New customers</span><b data-o="cust">0</b></div>
          <div><span>Revenue / mo</span><b data-o="rev">$0</b></div>
          <div><span>Return on ads</span><b data-o="roas">0×</b></div>
        </div>
        <div class="bars">
          <div class="bar-row"><span>Revenue</span><i data-o="b-rev" style="--c:var(--t)"></i><b data-o="t-rev"></b></div>
          <div class="bar-row"><span>Ad spend</span><i data-o="b-ads" style="--c:var(--o)"></i><b data-o="t-ads"></b></div>
          <div class="bar-row"><span>Retainer</span><i data-o="b-fee" style="--c:var(--y)"></i><b data-o="t-fee"></b></div>
        </div>
        <p class="calc-line" data-o="line"></p>
        <div class="calc-acts">
          <a class="btn btn-primary" data-o="mail" href="mailto:hello@naberstudio.com">Get this for my business</a>
          <button class="btn btn-ghost" type="button" data-o="copy">Copy link to these numbers</button>
        </div>
        <p class="calc-note">An estimate from the numbers you enter, not a guarantee. Real ad costs change with your offer, audience and season. Revenue is before the cost of what you sell.</p>
      </div>`;
    const $ = (s) => box.querySelector(s), out = (k) => box.querySelector(`[data-o="${k}"]`);
    const q = new URLSearchParams(location.search);
    const val = {};
    for (const f of ALL) {
      const p = parseFloat(q.get(f.id));
      val[f.id] = onPage && Number.isFinite(p) && p >= 0 ? p : f.v;
      const n = $(`#c-${f.id}`), r = $(`#r-${f.id}`);
      // money sliders move on a log scale, so $40 and $400 both get room; typed values can go past the ends
      const toR = (v) => { v = Math.min(Math.max(v, f.min), f.max); return f.log ? Math.round(1000 * Math.log(v / f.min) / Math.log(f.max / f.min)) : v; };
      const fromR = (x) => { if (!f.log) return x; const v = f.min * Math.pow(f.max / f.min, x / 1000); return Math.round(v / f.step) * f.step; };
      const sync = (from) => {
        let v = parseFloat(from.value);
        if (!Number.isFinite(v) || v < 0) return;
        if (from === r) { v = fromR(v); n.value = v; } else r.value = toR(v);
        val[f.id] = f.id === 'close' ? Math.min(v, 100) : v;
        paint(r); calc();
      };
      n.value = val[f.id]; r.value = toR(val[f.id]); paint(r);
      n.addEventListener('input', () => sync(n));
      r.addEventListener('input', () => sync(r));
      n.addEventListener('blur', () => { if (n.value === '' || +n.value < 0) { n.value = val[f.id]; } });
    }
    if (MORE.some((f) => val[f.id] !== f.v)) $('.calc-more').open = true;

    function paint(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'); }

    function calc() {
      const { spend, cpa, aov, fee, close, orders } = val;
      const booked = cpa > 0 ? spend / cpa : 0;
      const buyers = booked * (close / 100);
      const rev = buyers * aov * orders;
      const cost = spend + fee;
      const net = rev - cost;
      const roas = spend > 0 ? rev / spend : 0;
      const breakEven = cost > 0 ? (spend * (close / 100) * aov * orders) / cost : 0;   // highest cost per customer that still pays for itself
      const loss = net < 0;
      box.querySelector('.calc-out').classList.toggle('loss', loss);
      out('k').textContent = loss ? 'At these numbers you’d lose' : 'Money you’re missing out on';
      out('miss').textContent = usd(net);
      out('year').innerHTML = loss
        ? `The ads cost more than they bring in. A customer can cost at most <b>${usd(breakEven)}</b> to break even.`
        : `That’s <b>${usd(net * 12)}</b> a year left on the table, after ad spend and the retainer.`;
      out('cust').textContent = num(buyers);
      out('rev').textContent = usd(rev);
      out('roas').textContent = num(roas) + '×';
      const top = Math.max(rev, spend, fee, 1);
      out('b-rev').style.setProperty('--w', (rev / top) * 100 + '%'); out('t-rev').textContent = usd(rev);
      out('b-ads').style.setProperty('--w', (spend / top) * 100 + '%'); out('t-ads').textContent = usd(spend);
      out('b-fee').style.setProperty('--w', (fee / top) * 100 + '%'); out('t-fee').textContent = usd(fee);
      out('line').innerHTML = cost > 0
        ? `Every <b>$1</b> in (ads + retainer) brings back <b>$${(rev / cost).toFixed(2)}</b>. You stay profitable while a customer costs under <b>${usd(breakEven)}</b>.`
        : '';
      const qs = new URLSearchParams(ALL.map((f) => [f.id, String(val[f.id])]));
      const link = `${location.origin}/calculator/?${qs}`;
      box.dataset.link = link;
      if (onPage) history.replaceState(null, '', `?${qs}`);
      const body = `Hi Faris,\n\nI ran my numbers in your calculator:\n\n- Monthly ad spend: ${usd(spend)}\n- Cost per booked customer: ${usd(cpa)}\n- Average order: ${usd(aov)}\n- Retainer: ${usd(fee)}/mo\n\nEstimate: ${num(buyers)} new customers and ${usd(rev)} revenue a month, ${usd(net)} after costs.\n\n${link}\n\nMy business: `;
      out('mail').href = `mailto:hello@naberstudio.com?subject=${encodeURIComponent('My numbers from the calculator')}&body=${encodeURIComponent(body)}`;
    }

    out('copy').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(box.dataset.link); b.textContent = 'Link copied ✓'; }
      catch { prompt('Copy this link:', box.dataset.link); }
      setTimeout(() => { b.textContent = 'Copy link to these numbers'; }, 2200);
    });
    calc();
  }

  document.querySelectorAll('[data-calc]').forEach(mount);
})();
