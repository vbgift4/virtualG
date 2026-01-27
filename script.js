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

    // Stop confetti when leaving home
    if (current && current.id === 'home' && id !== 'home') stopConfetti();

    pages.forEach(p=> p.id === id ? p.classList.add('active') : p.classList.remove('active'));

    // Start confetti when entering home
    if (id === 'home') startConfetti();
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=> showPage(btn.dataset.target));
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
  logoBtn.addEventListener('click', ()=> showPage('home'));

  /* -------------------------
     Homepage tap audio toggle
     ------------------------- */
  let homeMusicPlaying = false;

  function toggleHeroAudio(){
    if (!bgAudio) return;
    if (!homeMusicPlaying){
      bgAudio.play().then(()=> homeMusicPlaying=true).catch(err=>console.warn('Audio blocked:',err));
    } else {
      bgAudio.pause();
      bgAudio.currentTime = 0;
      homeMusicPlaying = false;
    }
  }

  heroTap.addEventListener('click', ()=>{
    if (document.querySelector('.page.active')?.id === 'home'){
      toggleHeroAudio();
      startConfetti();
    }
  });

  heroTap.addEventListener('keydown', (e)=>{
    if ((e.key==='Enter'||e.key===' ') && document.querySelector('.page.active')?.id==='home'){
      e.preventDefault();
      heroTap.click();
    }
  });

  heroTap.addEventListener('touchstart', ()=> {
    if (document.querySelector('.page.active')?.id==='home') toggleHeroAudio();
  }, { once:true });

  /* -------------------------
     Cake flame popup
     ------------------------- */
  const flameGroup = document.getElementById('flameGroup');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage?.querySelector('.closeBtn');
  if (flameGroup){
    flameGroup.addEventListener('click', ()=> cakeMessage?.classList.remove('hidden'));
    flameGroup.addEventListener('keydown', (e)=> { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); flameGroup.click(); }});
  }
  closeBtn?.addEventListener('click', ()=> { cakeMessage.classList.add('hidden'); addClickFeedback(closeBtn); });

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
        if (pencil) pencil.style.transform='translateX(0) rotate(0)';
        onDone?.();
      }
    }
    step();
  }

  const observer = new MutationObserver(()=>{
    const active = document.querySelector('.page.active');
    if (active?.id==='message' && textEl?.textContent.trim()===''){
      typeWrite(textEl, message, ()=>{
        setTimeout(()=>{
          textEl.style.transition='opacity 700ms';
          textEl.style.opacity=0;
          setTimeout(()=>{
            textEl.style.opacity=1;
            textEl.textContent = followMsg;
            follow?.classList.remove('hidden');
          },700);
        },800);
      });
    }
  });
  observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});

  /* -------------------------
     Playlist player
     ------------------------- */
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');
  const playlistList = document.getElementById('playlistList');

  function showPlayer(title, url){
    if (!playerWrap || !playerIframe) return;
    playerTitle.textContent = title||'Playing';
    playerIframe.src = url+'?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
    const page = document.getElementById('playlist');
    page?.scrollTo({top:0, behavior:'smooth'});
    playerClose?.focus();
  }
  function hidePlayer(){
    if (!playerWrap || !playerIframe) return;
    playerWrap.setAttribute('aria-hidden','true');
    try{ playerIframe.src=''; } catch(e){}
  }

  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> showPlayer(li.textContent.trim(), li.dataset.youtube));
    li.addEventListener('keydown', (e)=> { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); li.click(); }});
  });
  playerClose?.addEventListener('click', ()=> { hidePlayer(); addClickFeedback(playerClose); playlistList.querySelector('.playlist-item')?.focus(); });

  /* -------------------------
     Confetti
     ------------------------- */
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas?.getContext('2d') || null;
  let confettiPieces=[], confettiRunning=false, confettiTimer=null;

  function resizeCanvas(){ if (!confettiCanvas) return; confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight; if(confettiRunning) createConfetti();}
  window.addEventListener('resize', resizeCanvas); resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }
  function createConfetti(){
    confettiPieces=[];
    const area = confettiCanvas.width * confettiCanvas.height;
    const count = Math.max(60, Math.floor(area/90000));
    const colors=['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for(let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0,confettiCanvas.width),
        y: random(-confettiCanvas.height,0),
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
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
      p.x+=p.velX; p.y+=p.velY; p.rot+=p.rotSpeed*0.6;
      if(p.y>confettiCanvas.height+40){ p.y=-20; p.x=random(0,confettiCanvas.width); }
    });
  }
  function animateConfetti(){ drawConfetti(); confettiTimer=requestAnimationFrame(animateConfetti); }
  function startConfetti(){ if(!ctx || confettiRunning) return; createConfetti(); confettiRunning=true; animateConfetti(); }
  function stopConfetti(){ if(!ctx || !confettiRunning) return; confettiRunning=false; cancelAnimationFrame(confettiTimer); confettiTimer=null; ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }
  if (document.querySelector('.page.active')?.id==='home') startConfetti();

  /* -------------------------
     Lazy-load images
     ------------------------- */
  const lazyImages = document.querySelectorAll('img.lazy');
  if('IntersectionObserver' in window && lazyImages.length>0){
    const imgObserver = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if(src){ img.src = src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    },{root:null, rootMargin:'120px', threshold:0.01});
    lazyImages.forEach(img=>imgObserver.observe(img));
  } else {
    lazyImages.forEach(img=>{ const src=img.getAttribute('data-src'); if(src) img.src=src; img.classList.remove('lazy'); });
  }

  /* -------------------------
     Collapsibles (mobile)
     ------------------------- */
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
        toggle.onclick = ()=> {
          const isOpen = c.getAttribute('data-open')==='true';
          c.setAttribute('data-open', String(!isOpen));
          toggle.setAttribute('aria-expanded', String(isOpen));
          if(!isOpen){ const page=c.closest('.page'); page?.scrollTo({top:0, behavior:'smooth'}); }
        };
      } else {
        c.setAttribute('data-open','true');
        toggle.setAttribute('aria-expanded','true');
        toggle.onclick = ()=> { const isOpen=c.getAttribute('data-open')==='true'; c.setAttribute('data-open',String(!isOpen)); toggle.setAttribute('aria-expanded',String(!isOpen)); };
      }
    });
  }
  setCollapsibleDefault();
  breakpoint.addEventListener('change', setCollapsibleDefault);

  /* -------------------------
     Keyboard shortcuts
     ------------------------- */
  document.addEventListener('keydown', (e)=>{
    if(e.key==='1') showPage('home');
    if(e.key==='2') showPage('cake');
    if(e.key==='3') showPage('message');
    if(e.key==='4') showPage('flowers');
    if(e.key==='5') showPage('playlist');
  });

  if(!document.querySelector('.page.active')) showPage('home');

});
