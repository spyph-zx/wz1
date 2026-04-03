/* App JS for romantic site.
   - Handles intro enter + audio
   - Generates falling petals
   - Page navigation and background auto-sync using Unsplash Source
   - Editable content saved to localStorage
   - GIF add, Yes/No logic
   - Special floating No button on page 4 in mobile
*/

(() => {
  // DOM refs
  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enterBtn');
  const bgAudio = document.getElementById('bgAudio');
  const app = document.getElementById('app');
  const petalContainer = document.getElementById('petalContainer');
  const pagesEl = document.getElementById('pages');
  const pageEls = Array.from(document.querySelectorAll('.page'));
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const bgKeyword = document.getElementById('bgKeyword');
  const applyBgBtn = document.getElementById('applyBgBtn');
  const resetBtn = document.getElementById('resetBtn');
  const page5 = document.getElementById('page5');
  const mobileFrame = document.getElementById('mobileFrame');
  const noBtnSpecial = document.getElementById('noBtn');

  // state
  let currentIndex = 0;
  const pageDataKey = "romantic_pages_v1";

  // create dots
  pageEls.forEach((p, idx) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.dataset.index = idx;
    dot.addEventListener('click', () => goToIndex(idx));
    dotsEl.appendChild(dot);
  });

  // page navigation
  function goToIndex(idx) {
    currentIndex = idx;
    const translateX = -idx * (pageEls[0].offsetWidth + parseInt(getComputedStyle(pagesEl).gap || 40));
    pagesEl.style.transform = translateX(${translateX}px);
    Array.from(dotsEl.children).forEach(d => d.classList.toggle('active', +d.dataset.index === idx));
    // auto-sync background with page theme
    const theme = pageEls[idx].dataset.theme || '';
    setBackgroundForTheme(theme);
    // save
    saveState();
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) goToIndex(- 1);
  });
  nextBtn.addEventListener('click', () => {
    if (currentIndex < pageEls.length - 1) goToIndex(currentIndex + 1);
  });

  // Enter + play music
  enterBtn.addEventListener('click', async () => {
    try {
      await bgAudio.play();
    } catch (e) {
      // some browsers require gesture; this click is allowed
    }
    intro.classList.add('hidden');
    app.classList.remove('hidden');
    startPetals();
    goToIndex(0);
    loadState();
  });

  // Petal generation
  function startPetals() {
    // create multiple petals with randomized timing
    const count = 18;
    for (let i = 0; i < count; i++) {
      createPetal(i);
    }
    // keep generating slowly
    setInterval(() => { createPetal(); }, 3000);
  }
  function createPetal(seed) {
    const p = document.createElement('div');
    p.className = 'petal';
    // random starting horizontal position across viewport
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const left = Math.random() * vw;
    p.style.left = ${left}px;
    p.style.top = ${-30 - Math.random() * 40}px;
    // randomized animation duration and delay
    const dur = 6 + Math.random() * 5;
    const delay = Math.random() * 4;
    p.style.animationDuration = ${dur}s, ${4 + Math.random() * 8}s;
    p.style.animationDelay = ${delay}s, ${delay}s;
    p.style.opacity = ${0.7 + Math.random() * 0.4};
    petalContainer.appendChild(p);
    // remove after animation roughly ends (~dur + delay)
    setTimeout(() => { p.remove(); }, (dur + delay) * 1000 + 2000);
  }

  // background auto-sync using Unsplash source
  let bgFetchInProgress = null;
  function setBackgroundForTheme(themeStr) {
    const q = (bgKeyword.value && bgKeyword.value.trim()) || (themeStr || '').trim() || "romantic,roses";
    // Use Unsplash source for keyword-based image (no API key)
    // Note: this returns a redirect URL for an image - set as CSS url()
    const url = https://source.unsplash.com/1600x900/?${encodeURIComponent(q)};
    document.documentElement.style.setProperty('--bg-image', url("${url}"));
  }

  applyBgBtn.addEventListener('click', () => {
    const q = (bgKeyword.value || '').trim();
    if (!q) return;
    setBackgroundForTheme(q);
  });
  resetBtn.addEventListener('click', () => {
    bgKeyword.value = '';
    // get current page theme
    const theme = pageEls[currentIndex] && pageEls[currentIndex].dataset.theme;
    setBackgroundForTheme(theme);
  });

  // Save & Load content using localStorage
  function gatherState() {
    const pages = pageEls.map(p => {
      return {
        idx: +p.dataset.index,
        theme: p.dataset.theme,
        title: (p.querySelector('.title')?.innerText || '').trim(),
        desc: (p.querySelector('.desc')?.innerText || '').trim(),
        gif: (p.querySelector('.gif-preview img')?.src || '')
      };
    });
    const page5data = {
      title: page5.querySelector('.title')?.innerText || '',
      desc: page5.querySelector('.desc')?.innerText || '',
      gif: page5.querySelector('.gif-preview img')?.src || '',
      finalText: page5.querySelector('.final-text')?.innerText || ''
    };
    return { pages, page5: page5data, currentIndex };
  }
  function saveState() {
    const state = gatherState();
    localStorage.setItem(pageDataKey, JSON.stringify(state));
  }
  function loadState() {
    const raw = localStorage.getItem(pageDataKey);
    if (!raw) return;
    try {
      const state = JSON.parse(raw);
      state.pages?.forEach(pdata => {
        const p = pageEls.find(x => +x.dataset.index === +pdata.idx);
        if (!p) return;
        if (pdata.title) p.querySelector('.title').innerText = pdata.title;
        if (pdata.desc) p.querySelector('.desc').innerText = pdata.desc;
        if (pdata.gif) {
          const img = p.querySelector('.gif-preview img');
          img.src = pdata.gif;
          img.alt = pdata.title || 'GIF';
        }
      });
      if (state.page5) {
        if (state.page5.gif) {
          const img = page5.querySelector('.gif-preview img');
          img.src = state.page5.gif;
        }
        if (state.page5.finalText) page5.querySelector('.final-text').innerText = state.page5.finalText;
      }
      if (typeof state.currentIndex !== 'undefined') goToIndex(state.currentIndex);
    } catch (e) { console.warn('Failed to restore', e); }
  }

  // Make editable elements save on blur and on input throttle
  document.addEventListener('input', (e) => {
    if (e.target.matches('.editable')) {
      // save after small delay
      debounceSave();
    }
  });
  document.addEventListener('blur', (e) => {
    if (e.target.matches('.editable')) saveState();
  }, true);
  let saveTimer = null;
  function debounceSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveState(), 700);
  }

  // GIF add buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-gif-btn')) {
      const area = e.target.closest('.gif-area');
      const urlInput = area.querySelector('.gif-url');
      const url = urlInput.value.trim();
      if (!url) {
        urlInput.focus();
        return;
      }
      const img = area.querySelector('.gif-preview img');
      img.src = url;
      img.alt = 'GIF';
      saveState();
    }
    // yes button logic: show page5 with a special gif and text
    if (e.target.matches('.yes-btn')) {
      // find the closest gif preview image (from the page)
      const area = e.target.closest('.gif-area');
      const img = area.querySelector('.gif-preview img');
      const src = img?.src || '';
      // reveal page5 and set image and some text
      page5.classList.remove('hidden');
      if (src) {
        page5.querySelector('.gif-preview img').src = src;
      } else {
        // fallback celebration gif
        page5.querySelector('.gif-preview img').src = 'https://media.giphy.com/media/3oz8xS7GQ1ZQ1Y1Rbe/giphy.gif';
      }
      // prefill final text
      const titleFrom = e.target.closest('.page')?.querySelector('.title')?.innerText || '';
      page5.querySelector('.final-text').innerText = Forever starts with a single yes. ${titleFrom};
      // scroll to last page by moving pages container
      // append page5 at the end of pages if not already there
      if (!Array.from(pageEls).includes(page5)) {
        pagesEl.appendChild(page5);
      }
      // navigate to page5 (we'll put it after the existing pages)
      goToIndex(pageEls.length); // index beyond current pages
      saveState();
    }
  });

  // No button fun: for page 4, on mobile the No floats away / moves to random positions
  function moveNoButtonRandomly(btn) {
    const container = mobileFrame || btn.parentElement;
    const rect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    // compute bounds relative to container
    const maxLeft = Math.max(0, rect.width - btnRect.width - 8);
    const maxTop = Math.max(0, rect.height - btnRect.height - 8);
    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;
    // apply transform relative to container
    btn.style.transition = 'transform 0.25s ease';
    btn.style.transform = translate(${left - btn.offsetLeft + 0}px, ${top - btn.offsetTop + 0}px);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.matches('.no-btn')) return;
    const btn = e.target;
    // if this is the special page4 button in mobile
    const page = btn.closest('.page');
    const idx = +page?.dataset.index;
    if (idx === 4 && window.matchMedia('(max-width:600px)').matches) {
      // move the button randomly within mobile frame
      moveNoButtonRandomly(btn);
      // playful sound effect? (optional) - you can hook an audio here
    } else {
      // small shaking animation as gentle refusal
      btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 350 });
    }
  });

  // When window resizes, ensure the pages transform aligns with the current index
  window.addEventListener('resize', () => {
    goToIndex(currentIndex);
  });

  // On initial load set background by first page theme
  document.addEventListener('DOMContentLoaded', () => {
    const theme = pageEls[0] && pageEls[0].dataset.theme;
    setBackgroundForTheme(theme);
  });

  // Reset button and data reset
  document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem(pageDataKey);
    // reload to clear content
    setTimeout(() => location.reload(), 300);
  });

  // Save before unload
  window.addEventListener('beforeunload', saveState);

})();
