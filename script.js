// Main interactions: reduced spacing, lazy image loading, and collapsible sections on mobile.
// Keeps previous features: nav active state, confetti, balloon animation, cake flame popup,
// message typing animation, playlist persistent player.

document.addEventListener('DOMContentLoaded', ()=>{

  // Refs
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  const mainEl = document.querySelector('main');

  /* -------------------------
     Helper: click feedback
     ------------------------- */
  function addClickFeedback(btn){
    if (!btn) return;
    btn.classList.add('clicked');
    clearTimeout(btn._clickTimeout);
    btn._clickTimeout = setTimeout(()=> btn.classList.remove('clicked'), 280);
  }
  document.querySelectorAll('button:not(.nav-item)').forEach(b=>{
    b.addEventListener('mousedown', ()=> addClickFeedback(b));
    b.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') addClickFeedback(b);
    });
  });

  /* -------------------------
     Scroll main to top on page change
     ------------------------- */
  function scrollMainTop(){
    if (!mainEl) return;
    try { mainEl.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch(e){ mainEl.scrollTop = 0; }
  }

  /* -------------------------
     Page navigation
     ------------------------- */
  function showPage(id){
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
    scrollMainTop();
    const current = document.querySelector('.page.active');
    if (current && current.id === 'home' && id !== 'home') {
      stopConfetti();
      pauseHomepageAudio(); // stop audio when leaving homepage
      current.classList.remove('active');
      setTimeout(()=> {
        pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));
        scrollMainTop();
      }, 300);
    } else if (id === 'home') {
      pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      setTimeout(()=> startConfetti(), 80);
      scrollMainTop();
    } else {
      pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      stopConfetti();
      pauseHomepageAudio(); // stop audio on other pages
      scrollMainTop();
    }
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=> showPage(btn.dataset.target));
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
  logoBtn.addEventListener('click', ()=> showPage('home'));

  /* -------------------------
     Hero tap: toggle audio per homepage visit
     ------------------------- */
  let homepageAudioPlaying = false; // true if music is playing

  function startHomepageAudio() {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      homepageAudioPlaying = true;
      console.log('Music playing ✅');
    }).catch(err => {
      console.warn('Audio play blocked:', err);
    });
  }

  function pauseHomepageAudio() {
    if (!bgAudio) return;
    bgAudio.pause();
    homepageAudioPlaying = false;
    console.log('Music paused ⏸');
  }

  heroTap.addEventListener('click', () => {
    const home = document.getElementById('home');
    if (!home || !home.classList.contains('active')) return;

    if (homepageAudioPlaying) pauseHomepageAudio();
    else startHomepageAudio();

    startConfetti();
  });

  heroTap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      heroTap.click();
    }
  });

  // Optional: ensure first tap on mobile works
  heroTap.addEventListener('touchstart', () => {}, { once: true });


  /* -------------------------
     Cake flame popup
     ------------------------- */
  const flameGroup = document.getElementById('flameGroup');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage ? cakeMessage.querySelector('.closeBtn') : null;
  if (flameGroup){
    flameGroup.addEventListener('click', ()=> { if (cakeMessage) cakeMessage.classList.remove('hidden'); });
    flameGroup.addEventListener('keydown', (e)=> { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); flameGroup.click(); }});
  }
  if (closeBtn) closeBtn.addEventListener('click', ()=> { cakeMessage.classList.add('hidden'); addClickFeedback(closeBtn); });

  /* -------------------------
     Typing animation (Message)
     ------------------------- */
  const textEl = document.getElementById('typeText');
  const pencil = document.getElementById('pencilSvg');
  const follow = document.getElementById('messageFollow');
  const message = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
  const followMsg = "And one more thing — you're the best part of my every day. 💖";


  function typeWrite(target, text, onDone){
    if (!target) return;
    target.textContent = '';
    let i=0, total=text.length;
    function step(){
      if (i<total){
        target.textContent += text[i++];
        if (pencil) pencil.style.transform = `translateX(${Math.min(140, i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30 + (Math.random()*40));
      } else {
        if (pencil) pencil.style.transform = 'translateX(0) rotate(0)';
        if (onDone) onDone();
      }
    }
    step();
  }

  const observer = new MutationObserver(()=> {
    const active = document.querySelector('.page.active');
    if (active && active.id === 'message' && textEl && textEl.textContent.trim()==='') {
      typeWrite(textEl, message, ()=> {
        setTimeout(()=>{
          textEl.style.transition='opacity 700ms';
          textEl.style.opacity=0;
          setTimeout(()=> {
            textEl.style.opacity=1;
            textEl.textContent = followMsg;
            if (follow) follow.classList.remove('hidden');
          },700);
        }, 800);
      });
    }
  });
  observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});

  /* -------------------------
     Playlist player (persistent)
     ------------------------- */
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');
  const playlistList = document.getElementById('playlistList');

  function showPlayer(title, url){
    if (!playerWrap || !playerIframe) return;
    playerTitle.textContent = title || 'Playing';
    playerIframe.src = url + '?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
    const page = document.getElementById('playlist');
    if (page) { try { page.scrollTo({top:0, behavior:'smooth'}); } catch(e){ page.scrollTop = 0; } }
    if (playerClose) playerClose.focus();
  }
  function hidePlayer(){ if (!playerWrap || !playerIframe) return; playerWrap.setAttribute('aria-hidden','true'); try{ playerIframe.src=''; } catch(e){} }

  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> { showPlayer(li.textContent.trim(), li.dataset.youtube); });
    li.addEventListener('keydown', (e)=> { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); li.click(); }});
  });
  if (playerClose) playerClose.addEventListener('click', ()=> { hidePlayer(); addClickFeedback(playerClose); const first = playlistList.querySelector('.playlist-item'); if (first) first.focus(); });

  /* -------------------------
     Confetti (runs while home active)
     ------------------------- */
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces = [], confettiRunning = false, confettiTimer = null;

  function resizeCanvas(){ if (!confettiCanvas) return; confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; if (confettiRunning) createConfetti(); }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }
  function createConfetti(){
    confettiPieces = [];
    const area = confettiCanvas.width * confettiCanvas.height;
    const count = Math.max(60, Math.floor(area / 90000));
    const colors = ['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for (let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0, confettiCanvas.width),
        y: random(-confettiCanvas.height, 0),
        w: random(6,12), h: random(8,18),
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: random(0,360), velY: random(1.4,4.2), velX: random(-1.5,1.5), rotSpeed: random(-8,8)
      });
    }
  }
  function drawConfetti(){
    if (!ctx) return;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p=>{
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.velX; p.y += p.velY; p.rot += p.rotSpeed * 0.6;
      if (p.y > confettiCanvas.height + 40) { p.y = -20; p.x = random(0, confettiCanvas.width); }
    });
  }
  function animateConfetti(){ drawConfetti(); confettiTimer = requestAnimationFrame(animateConfetti); }
  function startConfetti(){ if (!ctx || confettiRunning) return; createConfetti(); confettiRunning = true; animateConfetti(); }
  function stopConfetti(){ if (!ctx || !confettiRunning) return; confettiRunning = false; cancelAnimationFrame(confettiTimer); confettiTimer = null; ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }
  if (document.querySelector('.page.active')?.id === 'home') startConfetti();

  /* -------------------------
     Lazy-load images (IntersectionObserver)
     ------------------------- */
  const lazyImages = document.querySelectorAll('img.lazy');
  if ('IntersectionObserver' in window && lazyImages.length > 0) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, { root: null, rootMargin: '120px', threshold: 0.01 });
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback: load all immediately
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) img.src = src;
      img.classList.remove('lazy');
    });
  }

  /* -------------------------
     Collapsible sections on small screens
     - Elements: .collapsible (wrap); .collapsible-toggle (button); .collapsible-content (wrapper)
     - On small screens (<=900px) collapsible default collapsed; on large screens always open.
     ------------------------- */
  const collapsibles = document.querySelectorAll('.collapsible');
  const breakpoint = window.matchMedia('(max-width: 900px)');

  function setCollapsibleDefault() {
    collapsibles.forEach(c => {
      const toggle = c.querySelector('.collapsible-toggle');
      const content = c.querySelector('.collapsible-content');
      if (!toggle || !content) return;

      if (breakpoint.matches) {
        // small screens: start collapsed if data-collapsed attribute present
        const startCollapsed = c.hasAttribute('data-collapsed');
        c.setAttribute('data-open', startCollapsed ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', String(!startCollapsed));
        toggle.addEventListener('click', ()=> {
          const isOpen = c.getAttribute('data-open') === 'true';
          c.setAttribute('data-open', String(!isOpen));
          toggle.setAttribute('aria-expanded', String(isOpen));
          // scroll into view when opening
          if (!isOpen) {
            const page = c.closest('.page');
            if (page) page.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      } else {
        // large screens: ensure open and remove aria collapsed state
        c.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        // clicking toggle on large screens still toggles, but default is open
        toggle.addEventListener('click', ()=> {
          const isOpen = c.getAttribute('data-open') === 'true';
          c.setAttribute('data-open', String(!isOpen));
          toggle.setAttribute('aria-expanded', String(!isOpen));
        });
      }
    });
  }
  // initialize and update on resize
  setCollapsibleDefault();
  breakpoint.addEventListener('change', setCollapsibleDefault);

  /* -------------------------
     Keyboard nav shortcuts
     ------------------------- */
  document.addEventListener('keydown', (e)=>{
    if (e.key === '1') showPage('home');
    if (e.key === '2') showPage('cake');
    if (e.key === '3') showPage('message');
    if (e.key === '4') showPage('flowers');
    if (e.key === '5') showPage('playlist');
  });

  // Ensure a home active page exists
  if (!document.querySelector('.page.active')) showPage('home');
});
