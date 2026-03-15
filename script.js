// ─── Cursor ───
const cur=document.getElementById('cur'),ring=document.getElementById('cur-r');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function tick(){rx+=(mx-rx)*.13;ry+=(my-ry)*.13;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(tick)})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('on-link'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('on-link'));
});

// ─── Progress bar ───
const prog=document.getElementById('prog');
window.addEventListener('scroll',()=>{
  const pct=window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;
  prog.style.width=Math.min(pct,100)+'%';
});

// ─── Nav stuck state ───
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',window.scrollY>20));

// ─── Active nav link on scroll ───
const secs=document.querySelectorAll('section[id]');
const nls=document.querySelectorAll('.nav-links a');
const navIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      nls.forEach(a=>a.classList.remove('active'));
      const m=document.querySelector('.nav-links a[href="#'+e.target.id+'"]');
      if(m) m.classList.add('active');
    }
  });
},{threshold:0.3,rootMargin:'-60px 0px -40% 0px'});
secs.forEach(s=>navIO.observe(s));

// ─── Scroll reveal ───
const rvIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:0.1});
document.querySelectorAll('.rv').forEach(r=>rvIO.observe(r));

// ─── Staggered skill reveal ───
const skillIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('revealed'); });
},{threshold:0.15});
document.querySelectorAll('.skills-grid, .sec-skills-grid').forEach(g=>skillIO.observe(g));

// ─── Achievements reveal ───
const achIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('revealed'); });
},{threshold:0.15});
document.querySelectorAll('.ach-row').forEach(a=>achIO.observe(a));

// ─── Hamburger ───
const ham=document.getElementById('ham'),mob=document.getElementById('mob');
ham.addEventListener('click',()=>{
  const o=mob.classList.toggle('open');
  const s=ham.querySelectorAll('span');
  s[0].style.transform=o?'rotate(45deg) translateY(8px)':'';
  s[1].style.opacity=o?'0':'1';
  s[2].style.transform=o?'rotate(-45deg) translateY(-8px)':'';
});
mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mob.classList.remove('open');
  ham.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='1'});
}));

// ─── GitHub live stats ───
async function fetchGHStats(){
  try {
    const [user, repos] = await Promise.all([
      fetch('https://api.github.com/users/vishal2376').then(r=>r.json()),
      fetch('https://api.github.com/users/vishal2376/repos?per_page=100').then(r=>r.json())
    ]);
    const stars = Array.isArray(repos) ? repos.reduce((s,r)=>s+r.stargazers_count,0) : 0;
    const forks = Array.isArray(repos) ? repos.reduce((s,r)=>s+r.forks_count,0) : 0;
    countUp('gh-repos', user.public_repos||0);
    countUp('gh-stars', stars);
    countUp('gh-followers', user.followers||0);
    countUp('gh-forks', forks);
  } catch(e){ /* silently fail, dashes stay */ }
}
function countUp(id, target){
  const el=document.getElementById(id); if(!el) return;
  let cur=0; const step=Math.ceil(target/40);
  const t=setInterval(()=>{
    cur=Math.min(cur+step,target);
    el.textContent=cur;
    if(cur>=target) clearInterval(t);
  },30);
}
fetchGHStats();
const cform=document.getElementById('cform'),fok=document.getElementById('fok');
cform.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=cform.querySelector('.btn-send');
  btn.textContent='Sending...';btn.disabled=true;
  try{
    const r=await fetch(cform.action,{method:'POST',body:new FormData(cform),headers:{'Accept':'application/json'}});
    if(r.ok){cform.reset();fok.style.display='block';btn.textContent='Sent ✓';}
    else{btn.textContent='Error - try again';btn.disabled=false;}
  }catch{btn.textContent='Error - try again';btn.disabled=false;}
});

// ─── EASTER EGG 1: Konami Code ───
const konami=[38,38,40,40,37,39,37,39,66,65];
let ki=0;
document.addEventListener('keydown',e=>{
  if(e.keyCode===konami[ki]){ki++;if(ki===konami.length){document.getElementById('konami-overlay').classList.add('show');ki=0;}}
  else ki=0;
});

// ─── EASTER EGG 2: Logo click counter ───
const logo=document.getElementById('nav-logo');
const tip=document.getElementById('logo-tip');
const msgs=['🔍 Inspecting element...','🪝 Frida attached...','💉 Injecting script...','🎯 args[1] = ptr(0); // god mode','🎉 You think like Vishal. You\'re hired.'];
let lc=0,lt=null;
logo.addEventListener('click',e=>{
  if(lc===0)e.preventDefault();
  lc++;
  tip.textContent=msgs[Math.min(lc-1,msgs.length-1)];
  tip.classList.add('show');
  clearTimeout(lt);
  lt=setTimeout(()=>{tip.classList.remove('show');if(lc>=msgs.length)lc=0;},2200);
});

// ─── EASTER EGG 3: Hover name 3s glitch ───
const heroName=document.querySelector('.h-name');
let ht=null;
if(heroName){
  heroName.addEventListener('mouseenter',()=>{
    ht=setTimeout(()=>{
      heroName.style.animation='none';
      heroName.style.textShadow='-3px 0 #ff3860, 3px 0 #00cfff';
      setTimeout(()=>{heroName.style.textShadow='';},600);
    },2000);
  });
  heroName.addEventListener('mouseleave',()=>clearTimeout(ht));
}

// ─── EASTER EGG 4: Type "frida" anywhere ───
let typed='';
document.addEventListener('keypress',e=>{
  typed=(typed+e.key).slice(-5);
  if(typed==='frida'){
    const fl=document.createElement('div');
    fl.style.cssText='position:fixed;bottom:24px;right:24px;background:#0f1318;border:1px solid rgba(0,255,136,.3);padding:14px 20px;font-family:var(--mono);font-size:12px;color:#00ff88;z-index:9999;border-radius:2px;animation:fi .3s ease';
    fl.innerHTML='// <span style="color:#00cfff">Frida</span> detected 👀<br><span style="color:#4a5568">nice try - hook detection active</span>';
    document.body.appendChild(fl);
    setTimeout(()=>fl.remove(),3500);
    typed='';
  }
});

// ─── IMAGE ZOOM OVERLAY ───
const zoomOverlay = document.getElementById('img-zoom');
const zoomImg = document.getElementById('zoom-img');
const zoomClose = document.getElementById('zoom-close');

if(zoomOverlay && zoomImg) {
  // Open zoom on image click
  document.querySelectorAll('.p-vis img').forEach(img => {
    img.addEventListener('click', () => {
      zoomImg.src = img.src;
      zoomOverlay.classList.add('active');
    });
  });

  // Close zoom on button click or background click
  const closeZoom = () => {
    zoomOverlay.classList.remove('active');
    setTimeout(() => { zoomImg.style.transform = ''; }, 400); // reset pan on close
  };
  zoomClose.addEventListener('click', closeZoom);
  zoomOverlay.addEventListener('click', (e) => {
    if(e.target === zoomOverlay) closeZoom();
  });

  // Smooth pan effect with mouse
  zoomOverlay.addEventListener('mousemove', (e) => {
    if(!zoomOverlay.classList.contains('active')) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 10px shift
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    zoomImg.style.transform = `scale(1.05) translate(${-x}px, ${-y}px)`;
  });
}
