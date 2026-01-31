// Main interactions: nav, confetti, balloons, cake flame popup, message typing, playlist, lazy-load, collapsibles
document.addEventListener('DOMContentLoaded', ()=>{

  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  const mainEl = document.querySelector('main');

  function addClickFeedback(btn){
    if (!btn) return;
    btn.classList.add('clicked');
    clearTimeout(btn._clickTimeout);
    btn._clickTimeout = setTimeout(()=> btn.classList.remove('clicked'), 280);
  }
  document.querySelectorAll('button:not(.nav-item)').forEach(b=>{
    b.addEventListener('mousedown', ()=> addClickFeedback(b));
    b.addEventListener('keydown', (e)=>{ if (e.key==='Enter'||e.key===' ') addClickFeedback(b); });
  });

  // -------------------------
  // Prevent main scroll on mobile
  // -------------------------
  function disablePageScroll(){
    document.body.style.overflow = 'hidden';
  }
  function enablePageScroll(){
    document.body.style.overflow = '';
  }

  // -------------------------
  // Message typing animation
  // -------------------------
  const textEl = document.getElementById('typeText');
  const paper = document.querySelector('.paper');
  const iloveyou = document.getElementById('iloveyou');

  const firstMessage = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";

  let typingInProgress = false;

  function resetMessageScene() {
    typingInProgress = false;
    if (textEl) textEl.textContent = '';
    if (paper) paper.classList.remove('crumbled');
    if (iloveyou) iloveyou.classList.remove('show');
    if (paper) paper.querySelectorAll('.heart').forEach(h => h.remove());
  }

  function typeWriter(msg, target, callback){
    target.textContent = '';
    let i = 0;
    function step(){
      if(i < msg.length){
        target.textContent += msg[i++];
        setTimeout(step, 30 + Math.random() * 40);
      } else {
        if(callback) callback();
      }
    }
    step();
  }

  function createHearts(count){
    if (!paper) return;
    for(let i=0;i<count;i++){
      const heart=document.createElement('div');
      heart.className='heart';
      heart.innerHTML='❤️';
      heart.style.position='absolute';
      heart.style.left=Math.random()*paper.offsetWidth+'px';
      heart.style.bottom='0px';
      heart.style.fontSize=`${10+Math.random()*16}px`;
      heart.style.opacity=1;
      heart.style.transform='translateY(0) rotate(0deg)';
      heart.style.transition='transform 3s ease-out, opacity 3s ease-out';
      paper.appendChild(heart);

      setTimeout(()=>{
        const x=Math.random()*200-100;
        const y=-Math.random()*300-100;
        const r=Math.random()*720-360;
        heart.style.transform=`translate(${x}px, ${y}px) rotate(${r}deg)`;
        heart.style.opacity=0;
      },50);

      setTimeout(()=>heart.remove(),3100);
    }
  }

  // -------------------------
  // Fixed showPage function
  // -------------------------
  function showPage(id) {
    // toggle nav active state
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));

    // deactivate current page, activate target
    pages.forEach(p => {
      if (p.id === id) p.classList.add('active');
      else p.classList.remove('active');
    });

    // reset message scene if leaving message page
    if (id !== 'message') resetMessageScene();

    // disable scrolling on mobile for all pages
    if(window.innerWidth <= 900) disablePageScroll();
    else enablePageScroll();

    // stop/start confetti & audio
    const current = document.querySelector('.page.active');
    if (current && current.id === 'home' && id !== 'home') {
      stopConfetti();
      pauseHomepageAudio();
    } else if (id === 'home') {
      setTimeout(startConfetti, 80);
    } else {
      stopConfetti();
      pauseHomepageAudio();
    }

    // Start typing animation if opening message page
    if (id === 'message' && !typingInProgress) {
      resetMessageScene();
      typingInProgress = true;
      setTimeout(() => {
        typeWriter(firstMessage, textEl, () => {
          // After typing finishes, add crumpled class
          if (paper) paper.classList.add('crumbled');

          // Wait a short moment to let the crumple effect show
          setTimeout(() => {
            textEl.textContent = '';
            if (iloveyou) iloveyou.classList.add('show');
            createHearts(40);
          }, 700);
        });
      }, 150);
    }
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=> showPage(btn.dataset.target));
    btn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); btn.click(); }} );
  });
  if (logoBtn) logoBtn.addEventListener('click', ()=> showPage('home'));

  // -------------------------
  // Homepage audio and hero tap
  // -------------------------
  let homepageAudioPlaying = false;
  function startHomepageAudio(){ if(!bgAudio) return; bgAudio.play().then(()=>{ homepageAudioPlaying=true; }).catch(()=>{}); }
  function pauseHomepageAudio(){ if(!bgAudio) return; bgAudio.pause(); homepageAudioPlaying=false; }

  if (heroTap) {
    heroTap.addEventListener('click', ()=>{
      const home = document.getElementById('home');
      if(!home || !home.classList.contains('active')) return;
      if(homepageAudioPlaying) pauseHomepageAudio();
      else startHomepageAudio();
      startConfetti();
    });
    heroTap.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); heroTap.click(); }} );
    heroTap.addEventListener('touchstart',()=>{}, {once:true});
  }

  // -------------------------
  // Cake flame
  // -------------------------
  const flameDiv = document.getElementById('flame');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage ? cakeMessage.querySelector('.closeBtn') : null;
  if(flameDiv){
    flameDiv.addEventListener('click', ()=> { if(cakeMessage) cakeMessage.classList.remove('hidden'); });
    flameDiv.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); flameDiv.click(); }} );
  }
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ cakeMessage.classList.add('hidden'); addClickFeedback(closeBtn); });

  // -------------------------
  // Playlist player
  // -------------------------
  const playlistItems=document.querySelectorAll('.playlist-item');
  const playerWrap=document.getElementById('playlistPlayer');
  const playerIframe=document.getElementById('playerIframe');
  const playerTitle=document.getElementById('playerTitle');
  const playerClose=document.getElementById('playerClose');
  const playlistList=document.getElementById('playlistList');

  function showPlayer(title,url){
    if(!playerWrap||!playerIframe) return;
    playerTitle.textContent=title||'Playing';
    playerIframe.src=url+'?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
    const page=document.getElementById('playlist');
    if(page){ try{ page.scrollTo({top:0, behavior:'smooth'}); } catch(e){ page.scrollTop=0; } }
    if(playerClose) playerClose.focus();
  }
  function hidePlayer(){ if(!playerWrap||!playerIframe) return; playerWrap.setAttribute('aria-hidden','true'); try{ playerIframe.src=''; } catch(e){} }
  playlistItems.forEach(li=>{
    li.addEventListener('click',()=>{ showPlayer(li.textContent.trim(),li.dataset.youtube); });
    li.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); li.click(); }} );
  });
  if(playerClose) playerClose.addEventListener('click',()=>{ hidePlayer(); addClickFeedback(playerClose); const first=playlistList.querySelector('.playlist-item'); if(first) first.focus(); });

  // -------------------------
  // Confetti
  // -------------------------
  const confettiCanvas=document.getElementById('confetti');
  const ctx=confettiCanvas?confettiCanvas.getContext('2d'):null;
  let confettiPieces=[], confettiRunning=false, confettiTimer=null;

  function resizeCanvas(){ if(!confettiCanvas) return; confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight; if(confettiRunning) createConfetti(); }
  window.addEventListener('resize',resizeCanvas); resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }
  function createConfetti(){
    confettiPieces=[];
    const area = confettiCanvas.width*confettiCanvas.height;
    const count=Math.max(60, Math.floor(area/90000));
    const colors=['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for(let i=0;i<count;i++){
      confettiPieces.push({
        x:random(0,confettiCanvas.width),
        y:random(-confettiCanvas.height,0),
        w:random(6,12), h:random(8,18),
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: random(0,360), velY:random(1.4,4.2), velX:random(-1.5,1.5), rotSpeed:random(-8,8)
      });
    }
  }
  function drawConfetti(){
    if(!ctx) return;
    ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
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
  function startConfetti(){ if(!ctx||confettiRunning) return; createConfetti(); confettiRunning=true; animateConfetti(); }
  function stopConfetti(){ if(!ctx||!confettiRunning) return; confettiRunning=false; cancelAnimationFrame(confettiTimer); confettiTimer=null; ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
  if(document.querySelector('.page.active')?.id==='home') startConfetti();

  // -------------------------
  // Lazy load images
  // -------------------------
  const lazyImages=document.querySelectorAll('img.lazy');
  if('IntersectionObserver' in window && lazyImages.length>0){
    const imgObserver=new IntersectionObserver((entries,obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img=entry.target;
          const src=img.getAttribute('data-src');
          if(src){ img.src=src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, {root:null, rootMargin:'120px', threshold:0.01});
    lazyImages.forEach(img=>imgObserver.observe(img));
  } else {
    lazyImages.forEach(img=>{ const src=img.getAttribute('data-src'); if(src) img.src=src; img.classList.remove('lazy'); });
  }

  // -------------------------
  // Collapsibles
  // -------------------------
  const collapsibles=document.querySelectorAll('.collapsible');
  const breakpoint=window.matchMedia('(max-width:900px)');
  function setCollapsibleDefault(){
    collapsibles.forEach(c=>{
      const toggle=c.querySelector('.collapsible-toggle');
      const content=c.querySelector('.collapsible-content');
      if(!toggle||!content) return;
      if(breakpoint.matches){
        const startCollapsed=c.hasAttribute('data-collapsed');
        c.setAttribute('data-open', startCollapsed?'false':'true');
        toggle.setAttribute('aria-expanded',String(!startCollapsed));
        toggle.addEventListener('click',()=>{
          const isOpen=c.getAttribute('data-open')==='true';
          c.setAttribute('data-open',String(!isOpen));
          toggle.setAttribute('aria-expanded',String(isOpen));
          if(!isOpen){ const page=c.closest('.page'); if(page) page.scrollTo({top:0,behavior:'smooth'}); }
        });
      } else {
        c.setAttribute('data-open','true');
        toggle.setAttribute('aria-expanded','true');
        toggle.addEventListener('click',()=>{ const isOpen=c.getAttribute('data-open')==='true'; c.setAttribute('data-open',String(!isOpen)); toggle.setAttribute('aria-expanded',String(!isOpen)); });
      }
    });
  }
  setCollapsibleDefault();
  breakpoint.addEventListener('change', setCollapsibleDefault);

  // Keyboard nav
  document.addEventListener('keydown',(e)=>{
    if(e.key==='1') showPage('home');
    if(e.key==='2') showPage('cake');
    if(e.key==='3') showPage('message');
    if(e.key==='4') showPage('flowers');
    if(e.key==='5') showPage('playlist');
  });

  if(!document.querySelector('.page.active')) showPage('home');

});
