// -------------------------
// Typing animation + paper crumple + "I LOVE YOU ❤️" + hearts
// -------------------------
const textEl = document.getElementById('typeText');
const pencil = document.getElementById('pencilSvg');
const paper = document.querySelector('.paper');

const firstMessage = "Dear you,\n\nToday I celebrate you — your smile, your warmth,\nand every little thing that makes you special.\n\nLove you always.";
const loveMessage = "I LOVE YOU ❤️";

function typeWriter(msg,target,callback){
  target.textContent='';
  let i=0;
  function step(){
    if(i<msg.length){
      target.textContent+=msg[i++];
      if(pencil) pencil.style.transform = `translateX(${Math.min(140,i)}px) rotate(${Math.min(8,i/2)}deg)`;
      setTimeout(step, 30 + Math.random()*40);
    } else {
      if(pencil) pencil.style.transform='translateX(0) rotate(0)';
      if(callback) callback();
    }
  }
  step();
}

function createHearts(count){
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

// Observe when message page becomes active
const observer = new MutationObserver(()=>{
  const active = document.querySelector('.page.active');
  if(active && active.id==='message' && textEl.textContent.trim()===''){
    typeWriter(firstMessage,textEl,()=>{
      setTimeout(()=>{
        paper.classList.add('crumbled');
        paper.addEventListener('animationend',()=>{
          // Hide typed text
          textEl.textContent='';

          // SHOW FULL-PAGE I LOVE YOU ❤️
          const iloveyou = document.getElementById('iloveyou');
          if(iloveyou){
            iloveyou.style.display='block';
            iloveyou.style.opacity=1;
          }

          // Hearts animation
          createHearts(40);
        },{once:true});
      },1000);
    });
  }
});
observer.observe(document.querySelector('main'), {attributes:true, subtree:true, attributeFilter:['class']});
