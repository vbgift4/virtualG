// Main interactions for the birthday site
// Changes:
// - All nav items get .active (violet) when selected.
// - Other buttons get a brief violet "clicked" class on press.
// - Confetti runs continuously while Home is active and stops when leaving Home.
// - Home fades out when navigating away (smooth UX).
// - Cake is an inline SVG vector and flame click still opens popup.

document.addEventListener('DOMContentLoaded', ()=>{

  // Basic element refs
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');

  // Helper: add brief click feedback class for non-nav buttons
  function addClickFeedback(btn){
    if (!btn) return;
    btn.classList.add('clicked');
    clearTimeout(btn._clickTimeout);
    btn._clickTimeout = setTimeout(()=> {
      btn.classList.remove('clicked');
    }, 280);
  }

  // Attach ephemeral clicked class to non-nav buttons for visual feedback
  document.querySelectorAll('button:not(.nav-item)').forEach(b=>{
    b.addEventListener('mousedown', ()=> addClickFeedback(b));
    b.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') addClickFeedback(b);
    });
  });

  // SPA navigation with smooth fade-out for home
  function showPage(id){
    const current = document.querySelector('.page.active');
    const target = document.getElementById(id);
    // update nav active state
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));

    if (current && current.id === 'home' && id !== 'home') {
      // Fade out home smoothly, then switch
      current.classList.remove('active');
      // stop confetti immediately
      stopConfetti();
      // After CSS transition (matching 360ms) ensure target becomes active
      setTimeout(()=> {
        pages.forEach(p=> {
          p.id === id ? p.classList.add('active') : p.classList.remove('active');
        });
      }, 380);
    } else if (id === 'home') {
      // show home and start confetti
      pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      // small timeout to allow fade-in
      setTimeout(()=> startConfetti(), 80);
    } else {
      // normal switch
      pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      stopConfetti();
    }
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      showPage(target);
    });
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  // Logo returns to home
  logoBtn.addEventListener('click', ()=> showPage('home'));

  // Hero tap: play/pause audio (user gesture) and keep confetti running
  heroTap.addEventListener('click', ()=> {
    if (bgAudio.paused) {
      bgAudio.play().catch(()=>{/* playback blocked */});
    } else {
      bgAudio.pause();
    }
    // ensure confetti running when tapping home
    const home = document.getElementById('home');
    if (home && home.classList.contains('active')) startConfetti();
  });

  // Keyboard accessibility: space/enter on hero
  heroTap.addEventListener('keydown', (e)=>{
    if (e.key==='Enter' || e.key===' ') { e.preventDefault(); heroTap.click(); }
  });

  // --- Cake flame interaction ---
  const flameGroup = document.getElementById('flameGroup');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage ? cakeMessage.querySelector('.closeBtn') : null;

  if (flameGroup) {
    flameGroup.addEventListener('click', ()=> {
      if (cakeMessage) cakeMessage.classList.remove('hidden');
    });
    flameGroup.addEventListener('keydown', (e)=> {
      if (e.key==='Enter' || e.key===' ') { e.preventDefault(); flameGroup.click(); }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', ()=> {
      cakeMessage.classList.add('hidden');
      addClickFeedback(closeBtn);
    });
  }

  // --- Message typing animation ---
  const textEl = document.getElementById('typeText');
  const pencil = document.getElementById('pencilSvg');
  const follow = document.getElementById('messageFollow');

  const message = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
  const followMsg = "And one more thing — you're the best part of my every day. 💖";

  function typeWrite(target, text, onDone){
    target.textContent = '';
    let i=0;
    const total = text.length;
    function step(){
      if (i<total){
        target.textContent += text[i++];
        if (pencil) pencil.style.transform = `translateX(${Math.min(160, i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30 + (Math.random()*40));
      } else {
        if (pencil) pencil.style.transform = 'translateX(0) rotate(0)';
        if (onDone) onDone();
      }
    }
    step();
  }

  // Start typing when the message page becomes active
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

  // --- Playlist: persistent player area ---
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
    playerWrap.scrollIntoView({behavior:'smooth', block:'center'});
    if (playerClose) playerClose.focus();
  }

  function hidePlayer(){
    if (!playerWrap || !playerIframe) return;
    playerWrap.setAttribute('aria-hidden','true');
    try { playerIframe.src = ''; } catch(e){}
  }

  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> {
      const url = li.dataset.youtube;
      const title = li.textContent.trim();
      showPlayer(title, url);
    });
    li.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
    });
  });

  if (playerClose) {
    playerClose.addEventListener('click', ()=> {
      hidePlayer();
      addClickFeedback(playerClose);
      const first = playlistList.querySelector('.playlist-item');
      if (first) first.focus();
    });
  }

  // --- Confetti implementation (lightweight) ---
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces = [];
  let confettiRunning = false;

  function resizeCanvas(){ if (!confettiCanvas) return; confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; if (confettiRunning) createConfetti(); }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }

  function createConfetti(){
    confettiPieces = [];
    const count = Math.max(60, Math.floor((confettiCanvas.width*confettiCanvas.height)/90000)); // scale by viewport
    const colors = ['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for (let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0, confettiCanvas.width),
        y: random(-confettiCanvas.height, 0),
        w: random(6,12),
        h: random(8,18),
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: random(0,360),
        velY: random(1.5,4.5),
        velX: random(-1.5,1.5),
        rotSpeed: random(-8,8),
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

      p.x += p.velX;
      p.y += p.velY;
      p.rot += p.rotSpeed * 0.6;

      if (p.y > confettiCanvas.height + 40) {
        p.y = -20;
        p.x = random(0, confettiCanvas.width);
      }
    });
  }

  let confettiTimer = null;
  function animateConfetti(){
    drawConfetti();
    confettiTimer = requestAnimationFrame(animateConfetti);
  }

  function startConfetti(){
    if (!ctx || confettiRunning) return;
    createConfetti();
    confettiRunning = true;
    animateConfetti();
  }
  function stopConfetti(){
    if (!ctx || !confettiRunning) return;
    confettiRunning = false;
    cancelAnimationFrame(confettiTimer);
    confettiTimer = null;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }

  // Ensure confetti starts if home was active on load
  if (document.querySelector('.page.active')?.id === 'home') {
    startConfetti();
  }

  // Accessibility: number-key navigation
  document.addEventListener('keydown', (e)=>{
    if (e.key === '1') showPage('home');
    if (e.key === '2') showPage('cake');
    if (e.key === '3') showPage('message');
    if (e.key === '4') showPage('flowers');
    if (e.key === '5') showPage('playlist');
  });

  // Initialize to home (ensure active class exists)
  if (!document.querySelector('.page.active')) showPage('home');
});
