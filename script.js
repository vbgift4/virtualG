// Main interactions for the birthday site

document.addEventListener('DOMContentLoaded', ()=>{

  // Basic element refs
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');

  // SPA navigation (show/hide pages)
  function showPage(id){
    pages.forEach(p=> p.id===id ? p.classList.add('active') : p.classList.remove('active'));
    navItems.forEach(n=> n.classList.toggle('active', n.dataset.target===id));
    // special: stop video if switching
    closeVideo();
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      showPage(target);
      if (target === 'home') {
        document.getElementById('home').scrollIntoView({behavior:'smooth'});
      }
    });
  });

  // Logo returns to home
  logoBtn.addEventListener('click', ()=> showPage('home'));

  // Hero tap: play/pause audio and start confetti
  heroTap.addEventListener('click', ()=> {
    if (bgAudio.paused) {
      bgAudio.play().catch(()=>{/* playback blocked */});
      startConfetti();
    } else {
      bgAudio.pause();
    }
  });

  // Keyboard accessibility: space/enter on hero
  heroTap.addEventListener('keydown', (e)=>{
    if (e.key==='Enter' || e.key===' ') { e.preventDefault(); heroTap.click(); }
  });

  // --- Cake flame interaction ---
  const flameGroup = document.getElementById('flameGroup');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage.querySelector('.closeBtn');

  flameGroup.addEventListener('click', ()=> {
    cakeMessage.classList.remove('hidden');
  });
  flameGroup.addEventListener('keydown', (e)=> {
    if (e.key==='Enter' || e.key===' ') { e.preventDefault(); flameGroup.click(); }
  });
  closeBtn.addEventListener('click', ()=> cakeMessage.classList.add('hidden'));

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
        pencil.style.transform = `translateX(${Math.min(160, i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30 + (Math.random()*40));
      } else {
        pencil.style.transform = 'translateX(0) rotate(0)';
        if (onDone) onDone();
      }
    }
    step();
  }

  // Start typing when the message page becomes active
  const observer = new MutationObserver(()=> {
    const active = document.querySelector('.page.active');
    if (active && active.id === 'message' && textEl.textContent.trim()==='') {
      typeWrite(textEl, message, ()=> {
        setTimeout(()=>{
          textEl.style.transition='opacity 700ms';
          textEl.style.opacity=0;
          setTimeout(()=> {
            textEl.style.opacity=1;
            textEl.textContent = followMsg;
            follow.classList.remove('hidden');
          },700);
        }, 800);
      });
    }
  });
  observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});

  // Playlist: clicking list items opens video overlay
  const playlistItems = document.querySelectorAll('.playlist li');
  const videoScreen = document.getElementById('videoScreen');
  const videoFrame = document.getElementById('videoFrame');
  const closeVideoBtn = document.getElementById('closeVideo');

  function openVideo(url){
    videoFrame.src = url + "?autoplay=1&rel=0";
    videoScreen.classList.remove('hidden');
    videoScreen.setAttribute('aria-hidden','false');
  }
  function closeVideo(){
    if (videoScreen) {
      videoScreen.classList.add('hidden');
      videoFrame.src = '';
      videoScreen.setAttribute('aria-hidden','true');
    }
  }

  playlistItems.forEach(li=>{
    li.addEventListener('click', ()=> openVideo(li.dataset.youtube));
  });
  closeVideoBtn.addEventListener('click', closeVideo);

  // Close video on background click
  videoScreen.addEventListener('click', (e)=>{
    if (e.target === videoScreen) closeVideo();
  });

  // Confetti implementation (lightweight)
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let confettiRunning = false;

  function resizeCanvas(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function random(min,max){ return Math.random()*(max-min)+min; }

  function createConfetti(){
    confettiPieces = [];
    const count = 80;
    for (let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0, confettiCanvas.width),
        y: random(-confettiCanvas.height, 0),
        w: random(6,12),
        h: random(8,18),
        color: ['#ff7fbf','#ffd1e6','#cbb0ff','#ffe89a'][Math.floor(Math.random()*4)],
        rot: random(0,360),
        velY: random(1,4),
        velX: random(-1,1),
        rotSpeed: random(-6,6),
      });
    }
  }

  function drawConfetti(){
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
      p.rot += p.rotSpeed * 0.5;

      if (p.y > confettiCanvas.height + 20) {
        p.y = -10;
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
    if (confettiRunning) return;
    createConfetti();
    confettiRunning = true;
    animateConfetti();
    setTimeout(()=> {
      stopConfetti();
    }, 8000);
  }
  function stopConfetti(){
    if (!confettiRunning) return;
    confettiRunning = false;
    cancelAnimationFrame(confettiTimer);
    confettiTimer = null;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }

  // Accessibility: number-key navigation
  document.addEventListener('keydown', (e)=>{
    if (e.key === '1') showPage('home');
    if (e.key === '2') showPage('cake');
    if (e.key === '3') showPage('message');
    if (e.key === '4') showPage('flowers');
    if (e.key === '5') showPage('playlist');
  });

  // Initialize to home
  showPage('home');
});
