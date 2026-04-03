
// Romantic site JS (visual + interactions)
// - Enter + play audio
// - Falling petals
// - Floating thumbs
// - Heart text editable
// - Pages with GIF add / yes-no logic (4 pages + reveal page5 on Yes)
// - Background auto-sync from Unsplash

(() => {
  const intro = document.getElementById('intro');
  const startBtn = document.getElementById('startBtn');
  const enterBtn = document.getElementById('enterBtn');
  const bgAudio = document.getElementById('bgAudio');
  const app = document.getElementById('app');
  const petalContainer = document.getElementById('petalContainer');
  const bgLayer = document.getElementById('bgLayer');
  const playToggle = document.getElementById('playToggle');
  const heartText = document.getElementById('heartText');

  const pagesContainer = document.getElementById('pagesContainer');
  const pageEls = Array.from(document.querySelectorAll('.page'));
  const page5 = document.getElementById('page5');

  const thumbEls = Array.from(document.querySelectorAll('.thumb'));
  const bgKeyword = document.getElementById('bgKeyword');
  const applyBgBtn = document.getElementById('applyBgBtn');
  const resetBtn = document.getElementById('resetBtn');

  // thumbnails default placeholders (you can update these later)
  const defaultThumbs = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=6f8b3d58a6e0e03b7b70cb7b45f6d3f9',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=918b6d7f0b5e9b1dcf1d64f0f246a7b3',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=965e3b3f8b1f7c7a8f3c9eea6f0e8f45',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=cd5b4b3a5da95c5c54d46b5291f7a54a',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=bae342c20c2fdd0f5f2d6fb5a9d8a3b8'
  ];

  // assign thumbs
  thumbEls.forEach((el, i) => {
    const img = el.querySelector('img');
    img.src = defaultThumbs[i] || defaultThumbs[0];
  });

  // Show app on start
  async function enterSite() {
    try { await bgAudio.play(); } catch (e) { /* gesture required handled by click */ }
    intro.classList.add('hidden');
    app.classList.remove('hidden');
    startPetals();
    startFloatingThumbs();
  }
  startBtn.addEventListener('click', enterSite);
  enterBtn.addEventListener('click', () => {
    // simple reset or reapply background
    const kw = bgKeyword.value.trim();
    if (kw) setBackground(kw);
  });

  // Play/pause toggle button
  function updatePlayBtn() {
    playToggle.textContent = bgAudio.paused ? "▶" : "⏸";
  }
  playToggle.addEventListener('click', async () => {
    if (bgAudio.paused) {
      try { await bgAudio.play(); } catch (e) {}
    } else {
      bgAudio.pause();
    }
    updatePlayBtn();
  });
  bgAudio.addEventListener('play', updatePlayBtn);
  bgAudio.addEventListener('pause', updatePlayBtn);

  // Petals
  function startPetals() {
    const count = 14;
    for (let i = 0; i < count; i++) createPetal(i);
    setInterval(() => createPetal(), 3000);
  }
  function createPetal(seed = 0) {
    const p = document.createElement('div');
    p.className = 'petal';
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    p.style.left = `${Math.random() * vw}px`;
    const dur = 6 + Math.random() * 6;
    p.style.animationDuration = `${dur}s`;
    petalContainer.appendChild(p);
    setTimeout(() => p.remove(), (dur + 1) * 1000);
  }

  // Floating thumbs subtle animation
  function startFloatingThumbs() {
    thumbEls.forEach((t, idx) => {
      floatThumb(t, idx);
      setInterval(() => floatThumb(t, idx), 3500 + idx * 300);
    });
  }
  function floatThumb(el, i) {
    const amp = 6 + (i % 3) * 4;
    el.animate([
      { transform: `translateY(0)` },
      { transform: `translateY(-${amp}px)` },
      { transform: `translateY(0)` }
    ], { duration: 3000 + Math.random() * 2000, iterations: 1, easing: 'ease-in-out' });
  }

  // Background via Unsplash Source
  function setBackground(query) {
    const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
    bgLayer.style.backgroundImage = `url("${url}")`;
  }
  applyBgBtn.addEventListener('click', () => {
    const q = bgKeyword.value.trim();
    if (q) setBackground(q);
  });
  resetBtn.addEventListener('click', () => {
    bgKeyword.value = '';
    setBackground('romantic,roses');
  });

  // Initialize default background
  setBackground('romantic,roses');

  // Pages: GIF add / yes / no logic
  const addGifButtons = document.querySelectorAll('.add-gif-btn');
  addGifButtons.forEach(btn => btn.addEventListener('click', (e) => {
    const area = e.target.closest('.gif-area');
    const urlInput = area.querySelector('.gif-url');
    const url = urlInput.value.trim();
    if (!url) { urlInput.focus(); return; }
    const img = area.querySelector('.gif-preview img');
    img.src = url;
    saveState();
  }));

  // Yes logic => reveal page5 with last gif/text
  document.addEventListener('click', (e) => {
    if (e.target.matches('.yes-btn')) {
      const page = e.target.closest('.page');
      const gifImg = page.querySelector('.gif-preview img');
      page5.classList.remove('hidden');
      const finalImg = page5.querySelector('.gif-preview.final img') || page5.querySelector('img');
      if (gifImg && gifImg.src) {
        const targetFinal = page5.querySelector('.gif-preview.final img');
        if (targetFinal) targetFinal.src = gifImg.src;
      } else {
        const fallback = 'https://media.giphy.com/media/3oz8xS7GQ1ZQ1Y1Rbe/giphy.gif';
        const targetFinal = page5.querySelector('.gif-preview.final img');
        if (targetFinal) targetFinal.src = fallback;
      }
      // scroll pages container into view (if visible)
      pagesContainer.classList.remove('hidden');
      page5.scrollIntoView({behavior:'smooth'});
      saveState();
    }
  });

  // No logic: for page 4, on small screens floating behaviour
  document.addEventListener('click', (e) => {
    if (!e.target.matches('.no-btn')) return;
    const btn = e.target;
    const page = btn.closest('.page');
    const idx = +page.dataset.index;
    if (idx === 4 && window.matchMedia('(max-width:600px)').matches) {
      // move button to random position inside button's parent
      const parent = btn.parentElement;
      const pw = parent.clientWidth, ph = parent.clientHeight;
      const nx = Math.random() * (pw - 40);
      const ny = Math.random() * (ph - 28);
      btn.style.position = 'relative';
      btn.style.transform = `translate(${nx}px, ${ny}px)`;
      setTimeout(() => { btn.style.transform = ''; }, 800);
    } else {
      // shake
      btn.animate([{ transform:'translateX(0)' }, { transform:'translateX(-8px)' }, { transform:'translateX(8px)' }, { transform:'translateX(0)' }], { duration:400 });
    }
  });

  // Save & load to localStorage (heart text + page gifs)
  const storageKey = 'romantic_site_v1';
  function saveState() {
    const pages = pageEls.map(p => {
      return {
        idx: p.dataset.index,
        title: p.querySelector('.page-title')?.innerText || '',
        desc: p.querySelector('.page-desc')?.innerText || '',
        gif: p.querySelector('.gif-preview img')?.src || ''
      };
    });
    const thumbs = thumbEls.map(t => t.querySelector('img').src);
    const state = { heart: heartText.innerHTML, pages, thumbs };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
  function loadState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      if (s.heart) heartText.innerHTML = s.heart;
      if (s.pages) {
        s.pages.forEach(pd => {
          const p = pageEls.find(x => x.dataset.index === pd.idx);
          if (p) {
            if (pd.title) p.querySelector('.page-title').innerText = pd.title;
            if (pd.desc) p.querySelector('.page-desc').innerText = pd.desc;
            if (pd.gif) p.querySelector('.gif-preview img').src = pd.gif;
          }
        });
      }
      if (s.thumbs) {
        thumbEls.forEach((t, i) => {
          if (s.thumbs[i]) t.querySelector('img').src = s.thumbs[i];
        });
      }
    } catch (err) { console.warn('load failed', err); }
  }
  // Save on edits
  document.addEventListener('input', (e) => {
    if (e.target.matches('.page-title') || e.target.matches('.page-desc') || e.target.matches('#heartText')) {
      debounceSave();
    }
  });
  let saveTimer;
  function debounceSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 700);
  }
  // initial load
  document.addEventListener('DOMContentLoaded', loadState);

  // For developer: expose saveState to console
  window._romantic_save = saveState;

})();
