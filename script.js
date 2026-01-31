document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  const mainEl = document.querySelector('main');

  // Click feedback effect
  function addClickFeedback(btn) {
    if (!btn) return;
    btn.classList.add('clicked');
    clearTimeout(btn._clickTimeout);
    btn._clickTimeout = setTimeout(() => btn.classList.remove('clicked'), 280);
  }
  document.querySelectorAll('button:not(.nav-item)').forEach(b => {
    b.addEventListener('mousedown', () => addClickFeedback(b));
    b.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') addClickFeedback(b);
    });
  });

  // Scroll to top helper
  function scrollMainTop() {
    if (!mainEl) return;
    try { mainEl.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch(e) { mainEl.scrollTop = 0; }
  }

  // Show page function
  function showPage(id) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
    scrollMainTop();
    const current = document.querySelector('.page.active');
    if(current && current.id === 'home' && id !== 'home'){
      stopConfetti();
      pauseHomepageAudio();
      current.classList.remove('active');
      setTimeout(() => { 
        pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
        scrollMainTop(); 
      }, 300);
    } else if(id === 'home'){
      pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      setTimeout(() => startConfetti(), 80);
      scrollMainTop();
    } else {
      pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
      stopConfetti();
      pauseHomepageAudio();
      scrollMainTop();
    }
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.target));
    btn.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }});
  });
  logoBtn.addEventListener('click', () => showPage('home'));

  // Homepage audio toggle
  let homepageAudioPlaying = false;
  function startHomepageAudio() { if(!bgAudio) return; bgAudio.play().then(()=> homepageAudioPlaying=true).catch(()=>{}); }
  function pauseHomepageAudio() { if(!bgAudio) return; bgAudio.pause(); homepageAudioPlaying=false; }

  heroTap.addEventListener('click', () => {
    const home = document.getElementById('home');
    if(!home || !home.classList.contains('active')) return;
    homepageAudioPlaying ? pauseHomepageAudio() : startHomepageAudio();
    startConfetti();
  });
  heroTap.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heroTap.click(); }});
  heroTap.addEventListener('touchstart', ()=>{}, {once:true});

  // Cake flame popup
  const flameDiv = document.getElementById('flame');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage ? cakeMessage.querySelector('.closeBtn') : null;
  if(flameDiv){
    flameDiv.addEventListener('click', () => { if(cakeMessage) cakeMessage.classList.remove('hidden'); });
    flameDiv.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flameDiv.click(); }});
  }
  if(closeBtn) closeBtn.addEventListener('click', () => { cakeMessage.classList.add('hidden'); addClickFeedback(closeBtn); });

  // Typing animation + paper crumple + "I LOVE YOU ❤️" + floating hearts
  const textEl = document.getElementById('typeText');
  const paper = document.querySelector('.paper');
  const iloveyou = document.getElementById('iloveyou');
  const iloveyouContainer = document.getElementById('iloveyou-container');

  const firstMessage = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";

  function typeWriter(msg, target, callback){
    target.textContent = '';
    let i = 0;
    function step(){
      if(i < msg.length){
        target.textContent += msg[i++];
        setTimeout(step, 30 + Math.random() * 40);
      } else if(callback) callback();
    }
    step();
  }

  function createHearts(count){
    for(let i=0;i<count;i++){
      const heart = document.createElement('div');
      heart.className='heart';
      heart.innerHTML='❤️';
      heart.style.left = Math.random()*iloveyouContainer.offsetWidth + 'px';
      heart.style.top = Math.random()*iloveyouContainer.offsetHeight + 'px';
      heart.style.fontSize = `${14 + Math.random()*20}px`;
      heart.style.opacity = 1;
      iloveyouContainer.appendChild(heart);

      const x = (Math.random()*200 - 100);
      const y = (Math.random()*200 - 100);
      const duration = 3000 + Math.random()*2000;

      setTimeout(()=>{
        heart.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        heart.style.transform = `translate(${x}px, ${y}px)`;
        heart.style.opacity = 0;
      },50);

      setTimeout(()=> heart.remove(), 3500);
    }
  }

  // Start typing when navigating to message page
  const observer = new MutationObserver(() => {
    const active = document.querySelector('.page.active');
    if(active && active.id==='message' && textEl.textContent.trim()===''){
      typeWriter(firstMessage, textEl, () => {
        setTimeout(() => {
          paper.classList.add('crumbled');
          paper.addEventListener('animationend', () => {
            textEl.textContent='';
            iloveyou.classList.add('show');
            createHearts(50);
            setInterval(()=> createHearts(3), 1200);
          }, {once:true});
        }, 1000);
      });
    }
  });
  observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});

  // Playlist player
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');
  const playlistList = document.getElementById('playlistList');

  function showPlayer(title,url){
    if(!playerWrap||!playerIframe) return;
    playerTitle.textContent = title || 'Playing';
    playerIframe.src = url + '?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
    const page = document.getElementById('playlist');
    if(page) page.scrollTo({top:0, behavior:'smooth'});
    if(playerClose) playerClose.focus();
  }

  function hidePlayer(){
    if(!playerWrap||!playerIframe) return;
    playerWrap.setAttribute('aria-hidden','true');
    try { playerIframe.src=''; } catch(e){}
  }

  playlistItems.forEach(li => {
    li.addEventListener('click', () => showPlayer(li.textContent.trim(), li.dataset.youtube));
    li.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); li.click(); } });
  });

  if(playerClose) playerClose.addEventListener('click', () => { hidePlayer(); addClickFeedback(playerClose); const first=playlistList.querySelector('.playlist-item'); if(first) first.focus(); });

  // Confetti
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces=[], confettiRunning=false, confettiTimer=null;

  function resizeCanvas(){
    if(!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    if(confettiRunning) createConfetti();
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }
  function createConfetti(){
    confettiPieces=[];
    const area = confettiCanvas.width * confettiCanvas.height;
    const count = Math.max(60, Math.floor(area / 90000));
    const colors = ['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for(let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0,confettiCanvas.width),
        y: random(-confettiCanvas.height,0),
        w: random(6,12), h: random(8,18),
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: random(0,360),
        velY: random(1.4,4.2),
        velX: random(-1.5,1.5),
        rotSpeed: random(-8,8)
      });
    }
  }

  function drawConfetti(){
    if(!ctx) return;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.velX; p.y += p.velY; p.rot += p.rotSpeed*0.6;
      if(p.y > confettiCanvas.height+40){ p.y=-20; p.x=random(0,confettiCanvas.width); }
    });
  }

  function animateConfetti(){ drawConfetti(); confettiTimer=requestAnimationFrame(animateConfetti); }
  function startConfetti(){ if(!ctx||confettiRunning) return; createConfetti(); confettiRunning=true; animateConfetti(); }
  function stopConfetti(){ if(!ctx||!confettiRunning) return; confettiRunning=false; cancelAnimationFrame(confettiTimer); confettiTimer=null; ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }

  if(document.querySelector('.page.active')?.id==='home') startConfetti();

  // Lazy load images
  const lazyImages = document.querySelectorAll('img.lazy');
  if('IntersectionObserver' in window && lazyImages.length>0){
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if(src){ img.src = src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, { root:null, rootMargin:'120px', threshold:0.01 });
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    lazyImages.forEach(img => { const src = img.getAttribute('data-src'); if(src) img.src=src; img.classList.remove('lazy'); });
  }

  // Collapsible sections
  const collapsibles = document.querySelectorAll('.collapsible');
  const breakpoint = window.matchMedia('(max-width:900px)');
  function setCollapsibleDefault(){
    collapsibles.forEach(c=>{
      const toggle = c.querySelector('.collapsible-toggle');
      const content = c.querySelector('.collapsible-content');
      if(!toggle||!content) return;
      if(breakpoint.matches){
        const startCollapsed = c.hasAttribute('data-collapsed');
        c.setAttribute('data-open', startCollapsed?'false':'true');
        toggle.setAttribute('aria-expanded', String(!startCollapsed));
        toggle.addEventListener('click', () => {
          const isOpen = c.getAttribute('data-open')==='true';
          c.setAttribute('data-open', String(!isOpen));
          toggle.setAttribute('aria-expanded', String(isOpen));
          if(!isOpen){ const page = c.closest('.page'); if(page) page.scrollTo({top:0,behavior:'smooth'}); }
        });
      } else {
        c.setAttribute('data-open','true');
        toggle.setAttribute('aria-expanded','true');
        toggle.addEventListener('click', () => {
          const isOpen = c.getAttribute('data-open')==='true';
          c.setAttribute('data-open', String(!isOpen));
          toggle.setAttribute('aria-expanded', String(!isOpen));
        });
      }
    });
  }
  setCollapsibleDefault();
  breakpoint.addEventListener('change', setCollapsibleDefault);

  // Keyboard shortcuts
  document.addEventListener('keydown', e=>{
    if(e.key==='1') showPage('home');
    if(e.key==='2') showPage('cake');
    if(e.key==='3') showPage('message');
    if(e.key==='4') showPage('flowers');
    if(e.key==='5') showPage('playlist');
  });

  if(!document.querySelector('.page.active')) showPage('home');
});
