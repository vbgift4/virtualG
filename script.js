document.addEventListener('DOMContentLoaded', ()=>{

  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const logoBtn = document.getElementById('logoBtn');
  const heroTap = document.getElementById('heroTap');
  const bgAudio = document.getElementById('bgAudio');
  const mainEl = document.querySelector('main');
  let musicPlaying = false;

  /* Click feedback */
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

  /* Scroll main to top on page change */
  function scrollMainTop(){
    if (!mainEl) return;
    try { mainEl.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch(e){ mainEl.scrollTop = 0; }
  }

  /* Page navigation */
  function showPage(id){
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
    scrollMainTop();
    pages.forEach(p=> p.id===id ? p.classList.add('active') : p.classList.remove('active'));
    stopConfetti();
    if (id==='home') startConfetti();
    // reset music when leaving homepage
    if(id!=='home' && bgAudio){ bgAudio.pause(); bgAudio.currentTime=0; musicPlaying=false; }
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=> showPage(btn.dataset.target));
    btn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();btn.click();} });
  });
  logoBtn.addEventListener('click', ()=> showPage('home'));

  /* Hero tap: play/pause music */
  heroTap.addEventListener('click', ()=>{
    if(!bgAudio) return;
    if(!musicPlaying){ bgAudio.play(); musicPlaying=true; }
    else{ bgAudio.pause(); musicPlaying=false; }
    const home = document.getElementById('home');
    if(home && home.classList.contains('active')) startConfetti();
  });
  heroTap.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault(); heroTap.click(); } });
  heroTap.addEventListener('touchstart', ()=>{ if(!musicPlaying && bgAudio){ bgAudio.play(); musicPlaying=true;} }, {once:true});

  /* Cake flame popup */
  const flameGroup = document.getElementById('flameGroup');
  const cakeMessage = document.getElementById('cakeMessage');
  const closeBtn = cakeMessage ? cakeMessage.querySelector('.closeBtn') : null;
  if(flameGroup){
    flameGroup.addEventListener('click', ()=>{ if(cakeMessage) cakeMessage.classList.remove('hidden'); });
    flameGroup.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); flameGroup.click(); }});
  }
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ cakeMessage.classList.add('hidden'); addClickFeedback(closeBtn); });

  /* Typing animation */
  const textEl = document.getElementById('typeText');
  const pencil = document.getElementById('pencilSvg');
  const follow = document.getElementById('messageFollow');
  const message = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
  const followMsg = "And one more thing — you're the best part of my every day. 💖";

  function typeWrite(target,text,onDone){
    if(!target) return;
    target.textContent='';
    let i=0, total=text.length;
    function step(){
      if(i<total){
        target.textContent+=text[i++];
        if(pencil) pencil.style.transform=`translateX(${Math.min(140,i)}px) rotate(${Math.min(8,i/2)}deg)`;
        setTimeout(step, 30 + (Math.random()*40));
      }else{ if(pencil) pencil.style.transform='translateX(0) rotate(0)'; if(onDone) onDone(); }
    }
    step();
  }
  const observer = new MutationObserver(()=> {
    const active = document.querySelector('.page.active');
    if(active && active.id==='message' && textEl && textEl.textContent.trim()===''){
      typeWrite(textEl,message,()=>{ setTimeout(()=>{ textEl.style.transition='opacity 700ms'; textEl.style.opacity=0; setTimeout(()=>{ textEl.style.opacity=1; textEl.textContent=followMsg; if(follow) follow.classList.remove('hidden'); },700); },800); });
    }
  });
  observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});

  /* Playlist player */
  const playlistItems = document.querySelectorAll('.playlist-item');
  const playerWrap = document.getElementById('playlistPlayer');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerClose = document.getElementById('playerClose');
  const playlistList = document.getElementById('playlistList');

  function showPlayer(title,url){
    if(!playerWrap||!playerIframe) return;
    playerTitle.textContent = title||'Playing';
    playerIframe.src = url+'?autoplay=1&rel=0';
    playerWrap.setAttribute('aria-hidden','false');
    const page=document.getElementById('playlist');
    if(page){ try{ page.scrollTo({top:0,behavior:'smooth'}); }catch(e){ page.scrollTop=0;}}
    if(playerClose) playerClose.focus();
  }
  function hidePlayer(){ if(!playerWrap||!playerIframe) return; playerWrap.setAttribute('aria-hidden','true'); try{ playerIframe.src=''; }catch(e){} }

  playlistItems.forEach(li=>{ li.addEventListener('click',()=>{ showPlayer(li.textContent.trim(), li.dataset.youtube); }); li.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault(); li.click();}}); });
  if(playerClose) playerClose.addEventListener('click',()=>{ hidePlayer();
