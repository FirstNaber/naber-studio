/* Naber Studio — "your website in 10 seconds".
   Builds a live website concept for any business name, in the browser. Nothing is sent anywhere.
   Design = one of 8 hand-made systems (type pairing, palette, layout, art), chosen by business type
   and varied by the name. Content = written per business type. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── design systems ─────────────────────────────────────────────────────── */
  const THEMES = [
    { id: 'editorial', name: 'Editorial', d: 'Fraunces', b: 'Inter', css: 'family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;600', dw: 600, track: '-0.02em', upper: false, r: '6px', btn: 'square', hero: 'split', art: 'blobs', vibe: 'warm and editorial, like a good local magazine',
      pals: [{ n: 'moss, clay and cream', bg: '#f3eee4', ink: '#1f2a1f', acc: '#5d7a4a', acc2: '#c8683f', soft: '#e4dccb' }, { n: 'ink, rust and paper', bg: '#f6f1e8', ink: '#1b1a17', acc: '#b5452a', acc2: '#2e4a6b', soft: '#eadfcd' }] },
    { id: 'poster', name: 'Poster', d: 'Anton', b: 'Inter', css: 'family=Anton&family=Inter:wght@400;600', dw: 400, track: '0.005em', upper: true, r: '0px', btn: 'square', hero: 'poster', art: 'stripes', vibe: 'loud and confident, impossible to scroll past',
      pals: [{ n: 'tomato, cream and black', bg: '#fff4e3', ink: '#141414', acc: '#ff4f2e', acc2: '#141414', soft: '#ffd9b8' }, { n: 'cobalt, lemon and white', bg: '#fbfbf7', ink: '#10163a', acc: '#2742ff', acc2: '#ffd83d', soft: '#e7eaff' }] },
    { id: 'swiss', name: 'Swiss', d: 'Inter Tight', b: 'IBM Plex Mono', css: 'family=Inter+Tight:wght@500;700&family=IBM+Plex+Mono:wght@400;500', dw: 700, track: '-0.045em', upper: false, r: '0px', btn: 'square', hero: 'stack', art: 'dots', vibe: 'precise and modern, all grid and no fluff',
      pals: [{ n: 'white, black and signal red', bg: '#ffffff', ink: '#0d0d0d', acc: '#e3281b', acc2: '#0d0d0d', soft: '#f0f0f0' }, { n: 'bone, black and green', bg: '#f2f0e9', ink: '#111111', acc: '#1f8a4c', acc2: '#111111', soft: '#e2dfd4' }] },
    { id: 'soft', name: 'Soft', d: 'DM Serif Display', b: 'DM Sans', css: 'family=DM+Serif+Display&family=DM+Sans:wght@400;600', dw: 400, track: '-0.01em', upper: false, r: '22px', btn: 'pill', hero: 'split', art: 'arches', vibe: 'gentle and welcoming, rounded everywhere',
      pals: [{ n: 'blush, plum and cream', bg: '#fbf1ee', ink: '#3a1f2b', acc: '#d97f8f', acc2: '#6b3350', soft: '#f3dcd8' }, { n: 'sky, sand and navy', bg: '#f1f5f8', ink: '#1b2a44', acc: '#8fb3d9', acc2: '#d9b88f', soft: '#dde8f1' }] },
    { id: 'retro', name: 'Retro', d: 'Bricolage Grotesque', b: 'Space Mono', css: 'family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Space+Mono', dw: 800, track: '-0.035em', upper: false, r: '18px', btn: 'pill', hero: 'center', art: 'sun', vibe: 'friendly and a little nostalgic',
      pals: [{ n: 'mustard, teal and cream', bg: '#fdf6e3', ink: '#1d2b2a', acc: '#e3a21a', acc2: '#1f7a74', soft: '#f4e6c3' }, { n: 'orange, brown and peach', bg: '#fff1e6', ink: '#3b2314', acc: '#f06a1d', acc2: '#8a4a24', soft: '#fbd9bf' }] },
    { id: 'luxe', name: 'Luxe', d: 'Cormorant Garamond', b: 'Manrope', css: 'family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;600', dw: 600, track: '0em', upper: false, r: '0px', btn: 'underline', hero: 'center', art: 'blobs', vibe: 'dark, quiet and premium, like a gallery after hours',
      pals: [{ n: 'black, gold and ivory', bg: '#0f0e0c', ink: '#f3ede1', acc: '#c9a45c', acc2: '#6e5a3a', soft: '#1d1b17' }, { n: 'aubergine and champagne', bg: '#1a1220', ink: '#f4ece2', acc: '#d8b98a', acc2: '#7d4d8a', soft: '#261b2e' }] },
    { id: 'playful', name: 'Playful', d: 'Syne', b: 'Outfit', css: 'family=Syne:wght@700;800&family=Outfit:wght@400;600', dw: 800, track: '-0.03em', upper: false, r: '16px', btn: 'pill', hero: 'poster', art: 'blobs', vibe: 'bright and fun, built to be shared',
      pals: [{ n: 'lime, violet and white', bg: '#ffffff', ink: '#1a1033', acc: '#b8f04a', acc2: '#7b4dff', soft: '#f1ecff' }, { n: 'pink, green and cream', bg: '#fff8f2', ink: '#10281c', acc: '#ff7eb6', acc2: '#1f9e62', soft: '#ffe3ee' }] },
    { id: 'night', name: 'Night', d: 'Space Grotesk', b: 'JetBrains Mono', css: 'family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500', dw: 700, track: '-0.035em', upper: false, r: '10px', btn: 'square', hero: 'stack', art: 'stripes', vibe: 'moody and sharp, made for the evening crowd',
      pals: [{ n: 'midnight, mint and violet', bg: '#0c0d14', ink: '#eef0ff', acc: '#6cf0c2', acc2: '#8b6cff', soft: '#171a28' }, { n: 'charcoal, amber and red', bg: '#121212', ink: '#f5f1e8', acc: '#ffb547', acc2: '#e0533d', soft: '#1f1f1f' }] },
  ];
  const T = Object.fromEntries(THEMES.map((t) => [t.id, t]));
  const ART_NAMES = { blobs: 'soft painted shapes', stripes: 'bold stripes', dots: 'halftone print', arches: 'layered arches', sun: 'retro sunset' };
  const HERO_NAMES = { split: 'split hero, words beside the art', poster: 'poster hero, your name huge', stack: 'stacked hero, art band on top', center: 'centered hero over full art' };

  /* ── business types ─────────────────────────────────────────────────────── */
  const R = 'retail', S = 'service';
  const TYPES = {
    crystals: { kw: /crystal|gem|mineral|stone|rock|quartz/i, label: 'Crystal & gift shop', kind: R, themes: ['luxe', 'editorial', 'soft', 'retro'], tag: ['Stones with a story.', 'Find the one that’s yours.'], sub: 'Crystals, minerals and jewelry, one of a kind and ready for pickup today.', cta: 'Shop the collection', sec: 'New this week', items: [['Amethyst cluster', 85], ['Rose quartz heart', 42], ['Citrine point', 38], ['Labradorite palm stone', 24]] },
    barber: { kw: /barber|cuts?\b|fade|shave|clipper/i, label: 'Barbershop', kind: S, themes: ['poster', 'night', 'swiss', 'luxe'], tag: ['Sharp cuts. No wait.', 'Your chair is ready.'], sub: 'Classic cuts, skin fades and hot-towel shaves. Book your chair in seconds.', cta: 'Book a chair', sec: 'Services', items: [['Haircut', 35], ['Skin fade', 40], ['Beard trim', 20], ['Hot towel shave', 30]] },
    coffee: { kw: /coffee|caf[eé]|espresso|roast|brew|latte/i, label: 'Coffee shop', kind: R, themes: ['editorial', 'retro', 'swiss', 'soft'], tag: ['Good coffee, right here.', 'Your daily cup, sorted.'], sub: 'Espresso, pour-overs and house-roasted beans. Order ahead and skip the line.', cta: 'Order ahead', sec: 'On the menu', items: [['Cortado', 4.5], ['Oat latte', 5.5], ['Cold brew', 5], ['House beans, 12oz', 16]] },
    bakery: { kw: /bake|bakery|bread|pastr|donut|doughnut|cake|cookie|croissant/i, label: 'Bakery', kind: R, themes: ['soft', 'retro', 'editorial', 'playful'], tag: ['Baked this morning.', 'Warm from the oven.'], sub: 'Bread, pastries and cakes made fresh every day. Order online, pick up warm.', cta: 'Order for pickup', sec: 'Fresh today', items: [['Sourdough loaf', 9], ['Almond croissant', 5], ['Cinnamon roll', 4.5], ['Celebration cake', 48]] },
    florist: { kw: /flor|flower|bloom|petal|rose|bouquet/i, label: 'Florist', kind: R, themes: ['soft', 'editorial', 'playful', 'luxe'], tag: ['Flowers that say it for you.', 'Fresh blooms, delivered.'], sub: 'Seasonal bouquets and arrangements, delivered locally or ready for pickup.', cta: 'Send flowers', sec: 'This week’s bouquets', items: [['Seasonal bouquet', 55], ['Peony bunch', 40], ['Dried arrangement', 65], ['Weekly subscription', 45]] },
    boutique: { kw: /boutique|apparel|cloth|wear|thread|style|fashion|vintage/i, label: 'Boutique', kind: R, themes: ['luxe', 'swiss', 'editorial', 'playful'], tag: ['Pieces you won’t see twice.', 'New in, just for you.'], sub: 'A small, curated edit of clothing and accessories. Shop online or try it on in store.', cta: 'Shop new in', sec: 'New arrivals', items: [['Linen shirt', 68], ['Wide-leg trouser', 84], ['Leather tote', 120], ['Silk scarf', 42]] },
    tattoo: { kw: /tattoo|\bink\b|piercing/i, label: 'Tattoo studio', kind: S, themes: ['night', 'poster', 'swiss'], tag: ['Art that stays.', 'Your idea, done right.'], sub: 'Custom work, flash days and walk-ins. Send your idea and book a consult.', cta: 'Book a consult', sec: 'Book a session', items: [['Consultation', 0], ['Small flash piece', 80], ['Half-day session', 450], ['Piercing', 40]] },
    restaurant: { kw: /grill|kitchen|taco|pizza|burger|bbq|diner|eat|food|restaurant|sushi|thai|ramen|bistro/i, label: 'Restaurant', kind: R, themes: ['poster', 'retro', 'editorial', 'night'], tag: ['Come hungry.', 'Order it hot, pick it up fast.'], sub: 'The menu your regulars love. Order online for pickup or book a table.', cta: 'Order online', sec: 'Favorites', items: [['House special', 16], ['Starter to share', 11], ['Family meal', 42], ['Dessert', 8]] },
    salon: { kw: /salon|nail|lash|brow|beauty|spa|hair|wax/i, label: 'Salon & beauty', kind: S, themes: ['soft', 'luxe', 'playful'], tag: ['Look good, feel better.', 'Your time, your treat.'], sub: 'Hair, nails and beauty treatments. Book your appointment online in seconds.', cta: 'Book an appointment', sec: 'Treatments', items: [['Cut & style', 65], ['Gel manicure', 40], ['Lash lift', 75], ['Brow shape', 25]] },
    fitness: { kw: /gym|fit|yoga|pilates|box(ing)?\b|crossfit|train|studio\b/i, label: 'Fitness studio', kind: S, themes: ['swiss', 'poster', 'night', 'playful'], tag: ['Stronger, together.', 'Your first class is on us.'], sub: 'Classes for every level. Check the schedule and book your spot online.', cta: 'Book a class', sec: 'Classes & passes', items: [['Drop-in class', 25], ['10-class pass', 200], ['Monthly unlimited', 159], ['Intro week', 39]] },
    books: { kw: /book|press|read|library|comic/i, label: 'Bookshop', kind: R, themes: ['editorial', 'swiss', 'luxe'], tag: ['Your next favorite book.', 'Stories worth staying for.'], sub: 'New releases, staff picks and rare finds. Order online, pick up in store.', cta: 'Browse the shelves', sec: 'Staff picks', items: [['New release', 28], ['Staff pick', 18], ['Signed edition', 35], ['Gift card', 25]] },
    plants: { kw: /plant|garden|nursery|green|succulent|leaf/i, label: 'Plant shop', kind: R, themes: ['editorial', 'soft', 'retro'], tag: ['Bring the outside in.', 'Plants that thrive.'], sub: 'Houseplants, pots and care, with advice from people who love plants.', cta: 'Shop plants', sec: 'Easy-care picks', items: [['Monstera', 45], ['Snake plant', 32], ['Ceramic pot', 24], ['Care kit', 18]] },
    pets: { kw: /\bpet|dog|cat|paw|groom|kennel/i, label: 'Pet shop & grooming', kind: S, themes: ['playful', 'retro', 'soft'], tag: ['Happy pets live here.', 'Good boys and girls welcome.'], sub: 'Grooming, treats and everything your pet needs. Book online in seconds.', cta: 'Book grooming', sec: 'Services', items: [['Bath & brush', 45], ['Full groom', 70], ['Nail trim', 15], ['Treat box', 22]] },
    auto: { kw: /auto|motor|car\b|garage|tire|tyre|detail|mechanic/i, label: 'Auto shop', kind: S, themes: ['night', 'poster', 'swiss'], tag: ['Back on the road, fast.', 'Honest work, fair prices.'], sub: 'Repairs, servicing and detailing. Get a quote and book a time online.', cta: 'Book a service', sec: 'Services', items: [['Oil change', 59], ['Brake check', 0], ['Full detail', 180], ['Tire rotation', 35]] },
    other: { kw: /$^/, label: 'Local business', kind: R, themes: THEMES.map((t) => t.id), tag: ['Made for this neighborhood.', 'Come see what’s new.'], sub: 'Everything you love about us, now online. Order ahead or come say hi.', cta: 'Shop now', sec: 'Favorites', items: [['Best seller', 29], ['New arrival', 35], ['Local favorite', 22], ['Gift card', 25]] },
  };

  /* ── helpers ────────────────────────────────────────────────────────────── */
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) ^ Math.imul(seed ^ (seed >>> 13), 3266489909)) >>> 0) / 4294967296;
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '') || 'yourshop';
  const money = (n) => (n === 0 ? 'Free' : `$${Number.isInteger(n) ? n : n.toFixed(2)}`);
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const detect = (name) => Object.entries(TYPES).find(([k, t]) => k !== 'other' && t.kw.test(name))?.[0] || 'other';

  const fontsLoaded = new Set();
  async function loadFonts(t) {
    if (!fontsLoaded.has(t.id)) {
      fontsLoaded.add(t.id);
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?${t.css}&display=swap`; document.head.appendChild(l);
    }
    try { await Promise.race([Promise.all([document.fonts.load(`${t.dw} 48px "${t.d}"`), document.fonts.load(`400 16px "${t.b}"`)]), new Promise((r) => setTimeout(r, 1800))]); } catch { /* fall back quietly */ }
  }

  function art(style, p, rnd) {
    const x = () => Math.round(15 + rnd() * 70), r = () => Math.round(18 + rnd() * 22);
    switch (style) {
      case 'stripes': { const a = Math.round(rnd() * 180), w = 10 + Math.round(rnd() * 16); return `repeating-linear-gradient(${a}deg, ${p.acc} 0 ${w}px, ${p.soft} ${w}px ${w * 2}px)`; }
      case 'dots': { const s = 10 + Math.round(rnd() * 8); return `radial-gradient(${p.acc} 26%, transparent 28%) 0 0 / ${s}px ${s}px, linear-gradient(${Math.round(rnd() * 180)}deg, ${p.soft} 55%, ${p.acc2} 55%)`; }
      case 'arches': return `radial-gradient(circle at 50% 108%, ${p.acc2} 0 22%, ${p.acc} 22% 38%, ${p.soft} 38% 54%, transparent 54%), linear-gradient(${p.soft}, ${p.bg})`;
      case 'sun': return `radial-gradient(circle at ${x()}% 38%, ${p.acc} 0 20%, transparent 20.5%), repeating-linear-gradient(0deg, ${p.acc2} 0 8px, transparent 8px 16px) bottom / 100% 40% no-repeat, ${p.soft}`;
      default: return `radial-gradient(circle at ${x()}% ${x()}%, ${p.acc} 0 ${r()}%, transparent ${r() + 20}%), radial-gradient(circle at ${x()}% ${x()}%, ${p.acc2} 0 ${r()}%, transparent ${r() + 24}%), ${p.soft}`;
    }
  }

  /* ── the preview (built with textContent only: user input never becomes HTML) ── */
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function render(pv, name, type, t, p, rnd) {
    pv.replaceChildren();
    pv.dataset.hero = t.hero; pv.dataset.btn = t.btn; pv.dataset.upper = t.upper ? '1' : '0';
    const set = { '--bg': p.bg, '--ink': p.ink, '--acc': p.acc, '--acc2': p.acc2, '--soft': p.soft, '--df': `"${t.d}", Georgia, serif`, '--bf': `"${t.b}", system-ui, sans-serif`, '--dw': t.dw, '--track': t.track, '--r': t.r };
    for (const [k, v] of Object.entries(set)) pv.style.setProperty(k, v);
    const tagline = type.tag[Math.floor(rnd() * type.tag.length)];

    const nav = el('div', 'pv-nav');
    nav.append(el('b', 'pv-logo tx', name), el('span', 'pv-links tx', type.kind === S ? 'Services   Book   Visit' : 'Shop   Visit   About'), el('span', 'pv-btn tx', type.cta));
    const hero = el('section', 'pv-hero');
    const copy = el('div', 'pv-copy');
    const h1 = el('h1', 'pv-h1 tx', t.hero === 'poster' ? name : tagline);
    copy.append(el('p', 'pv-kick tx', type.label), h1, el('p', 'pv-sub tx', t.hero === 'poster' ? tagline + ' ' + type.sub : type.sub), el('span', 'pv-cta tx', type.cta + '  →'));
    const heroArt = el('div', 'pv-art pv-hero-art'); heroArt.style.background = art(t.art, p, rnd);
    hero.append(copy, heroArt);

    const shop = el('section', 'pv-shop');
    const sh = el('div', 'pv-sh'); sh.append(el('h2', 'tx', type.sec), el('span', 'tx', 'See all'));
    const grid = el('div', 'pv-grid');
    type.items.forEach(([n, pr], i) => {
      const c = el('article', 'pv-card'); c.style.transitionDelay = `${i * 90}ms`;
      const a = el('div', 'pv-art'); a.style.background = art(['blobs', 'stripes', 'dots', 'arches', 'sun'][(i + Math.floor(rnd() * 5)) % 5], p, rnd);
      const row = el('div', 'pv-row'); row.append(el('b', 'tx', n), el('span', 'tx', money(pr)));
      c.append(a, row, el('span', 'pv-add tx', type.kind === S ? 'Book' : 'Add to bag'));
      grid.append(c);
    });
    shop.append(sh, grid);

    const visit = el('section', 'pv-visit');
    const vc = el('div', 'pv-vc'); vc.append(el('h2', 'tx', type.kind === S ? 'Book online, 24/7' : 'Order online, pick up in store'), el('p', 'tx', 'Your address, hours, map and Google reviews live here.'));
    const map = el('div', 'pv-art pv-map'); map.style.background = `linear-gradient(90deg, transparent 48%, ${p.soft} 48% 52%, transparent 52%), linear-gradient(0deg, transparent 58%, ${p.soft} 58% 62%, transparent 62%), radial-gradient(circle at 50% 60%, ${p.acc} 0 7%, transparent 7.5%), ${p.acc2}`;
    visit.append(vc, map);
    const foot = el('footer', 'pv-foot'); foot.append(el('b', 'tx', name), el('span', 'tx', `© ${new Date().getFullYear()}`));
    const toast = el('div', 'pv-toast');
    const it = type.items[0];
    toast.append(el('b', null, type.kind === S ? 'New booking' : 'New order'), el('span', null, type.kind === S ? `${it[0]} · Saturday, 11:00` : `${it[0]} · ${money(it[1])} · pickup today`));
    pv.append(nav, hero, shop, visit, foot, toast);
    return h1;
  }

  /* ── build sequence ─────────────────────────────────────────────────────── */
  const form = $('#gen-form'), input = $('#gen-name'), sel = $('#gen-type'), pv = $('#pv'), logEl = $('#gen-log'), url = $('#pv-url'), timer = $('#gen-time'), actions = $('#gen-actions'), frame = $('#pv-frame');
  if (!form) return;
  let run = 0, variant = 0, current = null;

  const log = (txt, strong) => { const li = el('li'); if (strong) li.append(el('b', null, strong + ' ')); li.append(document.createTextNode(txt)); logEl.append(li); requestAnimationFrame(() => li.classList.add('on')); logEl.scrollTop = logEl.scrollHeight; };

  async function build(nameRaw, typeKey, v = 0) {
    const id = ++run, t0 = performance.now();
    const name = (nameRaw || '').trim().slice(0, 40) || 'Your Shop';
    const detected = typeKey === 'detect' || !typeKey ? detect(name) : typeKey;
    const type = TYPES[detected];
    const seed = hash(name.toLowerCase()) + v * 7919;
    const rnd = rng(seed);
    const theme = T[type.themes[(hash(name.toLowerCase()) + v) % type.themes.length]];   // shuffle always moves to the next design system
    const pal = theme.pals[Math.floor(rnd() * theme.pals.length)];
    current = { name, type: detected, v };
    actions.hidden = true; timer.textContent = '0.0s';
    logEl.replaceChildren();
    pv.className = 'pv';
    url.textContent = `${slug(name)}.com`;
    const tick = setInterval(() => { if (id === run) timer.textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s`; }, 100);

    log(`${type.label}${typeKey === 'detect' || !typeKey ? ' (read from the name)' : ''}`, 'Business:');
    const h1 = render(pv, name, type, theme, pal, rnd);
    const full = h1.textContent; h1.textContent = '';
    await sleep(500); if (id !== run) return clearInterval(tick);
    log('grid and page structure', 'Layout:'); log(HERO_NAMES[theme.hero], 'Hero:');
    const fontsP = loadFonts(theme);
    await sleep(900); if (id !== run) return clearInterval(tick);
    await fontsP;
    pv.classList.add('c-type');
    log(`${theme.d} for headlines, ${theme.b} for text: ${theme.vibe}`, 'Type:');
    for (let i = 1; i <= full.length; i++) { if (id !== run) return clearInterval(tick); h1.textContent = full.slice(0, i); await sleep(Math.max(18, 520 / full.length)); }
    await sleep(350); if (id !== run) return clearInterval(tick);
    pv.classList.add('c-col'); log(pal.n, 'Palette:');
    await sleep(900); if (id !== run) return clearInterval(tick);
    pv.classList.add('c-art'); log(`${ART_NAMES[theme.art]}, in your colours`, 'Art:');
    await sleep(800); if (id !== run) return clearInterval(tick);
    pv.classList.add('c-shop'); log(type.kind === S ? 'online booking for 4 services' : 'online store, checkout and free in-store pickup', type.kind === S ? 'Booking:' : 'Store:');
    await sleep(900); if (id !== run) return clearInterval(tick);
    log('reflows for phones', 'Mobile:');
    await sleep(700); if (id !== run) return clearInterval(tick);
    pv.classList.add('c-toast');
    clearInterval(tick);
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    timer.textContent = `${secs}s`;
    log(`in ${secs} seconds. A real one is designed by hand around your photos.`, 'Built');
    actions.hidden = false;
    const q = new URLSearchParams({ name, type: detected }); if (v) q.set('v', v);
    history.replaceState(null, '', `?${q}#try`);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); variant = 0; build(input.value, sel.value, 0); });
  input.addEventListener('input', () => { const d = detect(input.value); $('#gen-detect').textContent = input.value.trim() ? `Looks like: ${TYPES[d].label}` : ''; });
  $('#gen-shuffle').addEventListener('click', () => { variant++; build(current.name, current.type, variant); });
  document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
    frame.dataset.device = b.dataset.device;
    document.querySelectorAll('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  $('#gen-copy').addEventListener('click', async (e) => {
    const link = location.origin + location.pathname + location.search + '#try';
    try { await navigator.clipboard.writeText(link); e.currentTarget.textContent = 'Link copied ✓'; } catch { prompt('Copy this link:', link); }
  });
  $('#gen-mail').addEventListener('click', (e) => {
    const link = location.origin + location.pathname + location.search + '#try';
    e.currentTarget.href = `mailto:hello@naberstudio.com?subject=${encodeURIComponent(`Website concept for ${current?.name || 'my business'}`)}&body=${encodeURIComponent(`Hi Faris,\n\nI tried the builder for ${current?.name || 'my business'} and I'd like to talk about a real website.\n\nConcept: ${link}\n\nBest way to reach me:\n`)}`;
  });

  // start: a shared link opens with that business already built; otherwise a demo types itself in
  const qs = new URLSearchParams(location.search);
  if (qs.get('name')) {
    input.value = qs.get('name').slice(0, 40); sel.value = TYPES[qs.get('type')] ? qs.get('type') : 'detect';
    variant = +qs.get('v') || 0; build(input.value, sel.value, variant);
  } else {
    const demo = ['Sol Coffee Co.', 'Hollow Oak Barbers', 'Wildflower Bakery', 'Moonstone Crystals'][new Date().getDate() % 4];
    (async () => {
      await sleep(600);
      for (let i = 1; i <= demo.length; i++) { if (input.value && input.value !== demo.slice(0, i - 1)) return; input.value = demo.slice(0, i); input.dispatchEvent(new Event('input')); await sleep(55); }
      build(demo, 'detect', 0);
    })();
  }
})();
