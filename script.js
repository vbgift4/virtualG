document.addEventListener('DOMContentLoaded', ()=>{

  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  const mainEl = document.querySelector('main');

  // NAVIGATION
  function showPage(id){
    navItems.forEach(n=>n.classList.toggle('active', n.dataset.target===id));
    pages.forEach(p=>p.id===id?p.classList.add('active'):p.classList.remove('active'));
    try{ mainEl.scrollTo({top:0,behavior:'smooth'}); } catch(e){ mainEl.scrollTop=0; }
  }
  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=> showPage(btn.dataset.target));
  });
  logoBtn.addEventListener('click', ()=> showPage('home'));

  // HERO TAP
  heroTap.addEventListener('click', ()=> {
    if(bgAudio.paused) bgAudio.play().catch(()=>{}); else bgAudio.pause();
  });

  // CAKE FLAME
  const flame = document.getElementById('cakeFlame');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage.querySelector('.closeBtn');

  if(flame){
    flame.addEventListener('click', ()=>{
      cakeMessage.classList.remove('hidden');
    });
    flame.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); cakeMessage.classList.remove('hidden'); }
    });
  }
  closeBtn.addEventListener('click', ()=> cakeMessage.classList.add('hidden'));

  // MESSAGE TYPING
  const textEl = document.getElementById('typeText');
  const pencil = document.getElementById('pencilSvg');
  const follow = document.getElementById('messageFollow');
  const message = "Dear you,\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
  function typeWrite(target,text,onDone){
    target.textContent='';
    let i=0;
    function step(){
      if(i<text.length){
        target.textContent+=text[i++];
        if(pencil) pencil.style.transform = `translateX(${Math.min(140,i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30 + Math.random()*40);
      }else if(onDone) onDone();
    }
    step();
  }
  const observer = new MutationObserver(()=> {
    if(document.querySelector('.page.active')?.id==='message' && textEl.textContent===''){
      typeWrite(textEl,message, ()=> follow.classList.remove('hidden'));
    }
  });
  observer.observe(document.querySelector('main'),{attributes:true,subtree:true,attributeFilter:['class']});

  // PLAYLIST
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');

  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> {
      playerTitle.textContent = li.textContent.trim();
      playerIframe.src = li.dataset.youtube+'?autoplay=1';
      playerWrap.setAttribute('aria-hidden','false');
    });
  });
  playerClose.addEventListener('click', ()=> {
    playerWrap.setAttribute('aria-hidden','true');
    playerIframe.src='';
  });

  // CONFETTI
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas.getContext('2d');
  let pieces=[],running=false,timer;
  function random(min,max){return Math.random()*(max-min)+min;}
  function resize(){confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight;}
  window.addEventListener('resize', resize); resize();
  function create(){pieces=[];for(let i=0;i<100;i++){pieces.push({x:random(0,confettiCanvas.width),y:random(-confettiCanvas.height,0),w:random(6,12),h:random(8,18),color:['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a','#ffb4c6','#ff9db7'][Math.floor(random(0,6))],rot:random(0,360),velY:random(1.4,4.2),velX:random(-1.5,1.5),rotSpeed:random(-8,8)});}}
  function draw(){ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); pieces.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore(); p.x+=p.velX; p.y+=p.velY; p.rot+=p.rotSpeed*0.6; if(p.y>confettiCanvas.height+40){p.y=-20;p.x=random(0,confettiCanvas.width);}});}
  function animate(){draw(); timer=requestAnimationFrame(animate);}
  function startConfetti(){if(running)return;create();running=true;animate();}
  function stopConfetti(){running=false;cancelAnimationFrame(timer); ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);}
  if(document.querySelector('.page.active')?.id==='home') startConfetti();

});
