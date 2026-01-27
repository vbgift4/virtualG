document.addEventListener('DOMContentLoaded', ()=>{

  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  function showPage(id){
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target===id));
    pages.forEach(p => p.id===id ? p.classList.add('active') : p.classList.remove('active'));
  }
  navItems.forEach(btn=>btn.addEventListener('click', ()=>showPage(btn.dataset.target)));
  logoBtn.addEventListener('click', ()=>showPage('home'));

  // Hero tap: music + confetti
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  heroTap.addEventListener('click', ()=>{
    if(bgAudio.paused) bgAudio.play().catch(()=>{});
    else bgAudio.pause();
    startConfetti();
  });

  // Cake flame
  const flame = document.getElementById('cakeFlame');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage.querySelector('.closeBtn');
  if(flame){
    function showMessage(){
      flame.classList.add('extinguished');
      cakeMessage.classList.remove('hidden');
    }
    flame.addEventListener('click', showMessage);
    flame.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' ') { e.preventDefault(); showMessage(); }
    });
  }
  closeBtn.addEventListener('click', ()=>{
    cakeMessage.classList.add('hidden');
    flame.classList.remove('extinguished');
  });

  // Typing animation
  const textEl = document.getElementById('typeText');
  const pencil = document.getElementById('pencilSvg');
  const follow = document.getElementById('messageFollow');
  const message = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
  function typeWrite(target, text, onDone){
    target.textContent = '';
    let i=0;
    function step(){
      if(i<text.length){
        target.textContent += text[i++];
        if(pencil) pencil.style.transform = `translateX(${Math.min(140,i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30+Math.random()*40);
      }else{
        if(pencil) pencil.style.transform='translateX(0) rotate(0)';
        if(onDone) onDone();
      }
    }
    step();
  }
  new MutationObserver(()=>{
    const active = document.querySelector('.page.active');
    if(active?.id==='message' && textEl.textContent.trim()===''){
      typeWrite(textEl, message, ()=>{
        setTimeout(()=>{
          textEl.style.opacity=0;
          setTimeout(()=>{
            textEl.style.opacity=1;
            textEl.textContent = "And one more thing — you're the best part of my every day. 💖";
            if(follow) follow.classList.remove('hidden');
          },700);
        },800);
      });
    }
  }).observe(document.querySelector('main'),{attributes:true,subtree:true,attributeFilter:['class']});

  // Playlist
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');
  function showPlayer(title,url){
    playerTitle.textContent = title||'Playing';
    playerIframe.src = url+'?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
  }
  function hidePlayer(){ playerWrap.setAttribute('aria-hidden','true'); playerIframe.src=''; }
  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> showPlayer(li.textContent.trim(), li.dataset.youtube));
  });
  playerClose.addEventListener('click', hidePlayer);

  // Confetti
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas.getContext('2d');
  let confettiPieces=[], confettiRunning=false, confettiTimer=null;
  function resizeCanvas(){ confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight; if(confettiRunning) createConfetti(); }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();
  function random(min,max){ return Math.random()*(max-min)+min; }
  function createConfetti(){
    confettiPieces=[]; 
    const area=confettiCanvas.width*confettiCanvas.height;
    const count=Math.max(60,Math.floor(area/90000));
    const colors=['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'];
    for(let i=0;i<count;i++) confettiPieces.push({x:random(0,confettiCanvas.width),y:random(-confettiCanvas.height,0),w:random(6,12),h:random(8,18),color:colors[Math.floor(Math.random()*colors.length)],rot:random(0,360),velY:random(1.4,4.2),velX:random(-1.5,1.5),rotSpeed:random(-8,8)});
  }
  function drawConfetti(){
    ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    confettiPieces.forEach(p=>{
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      p.x+=p.velX; p.y+=p.velY; p.rot+=p.rotSpeed*0.6;
      if(p.y>confettiCanvas.height+40){p.y=-20;p.x=random(0,confettiCanvas.width);}
    });
  }
  function animateConfetti(){ drawConfetti(); confettiTimer=requestAnimationFrame(animateConfetti); }
  function startConfetti(){ if(confettiRunning) return; createConfetti(); confettiRunning=true; animateConfetti(); }
  function stopConfetti(){ confettiRunning=false; cancelAnimationFrame(confettiTimer); confettiTimer=null; ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }

});
