//==============================
// DYNAMIC DATA RENDERING
//==============================

function renderHero() {
  const c = document.getElementById('hero-content');
  if(!c) return;
  const d = ABOUT_DATA.hero;
  
  let chipsHtml = d.chips.map(chip => `<span class="chip ${chip.class}">${chip.text}</span>`).join('<span class="chip-sep">/</span>');
  
  let socialsHtml = `
    <a href="${d.socials.github}" target="_blank" rel="noopener" class="soc" title="GitHub"><svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg></a>
    <a href="${d.socials.linkedin}" target="_blank" rel="noopener" class="soc" title="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>
    <a href="${d.socials.twitter}" target="_blank" rel="noopener" class="soc" title="Twitter / X"><svg viewBox="0 0 24 24"><path d="M18.9 1h3.7l-8 9.2L24 23h-7.4l-5.8-7.5L4.5 23H.8l8.6-9.8L0 1h7.6l5.2 6.8L18.9 1zm-1.3 19.7h2L6.5 3H4.3L17.6 20.7z"/></svg></a>
  `;

  c.innerHTML = `
    <div class="h-eye">${d.eyeText}</div>
    <h1 class="h-name">
      <span class="l1">${d.firstName}</span>
      <span class="l2">${d.lastName}<span class="fill">${d.lastName}</span></span>
    </h1>
    <div class="h-chips">
      ${chipsHtml}
      <span class="avail"><span class="dot"></span>${d.availability}</span>
    </div>
    <p class="h-desc">${d.description}</p>
    <div class="h-btns">
      <a href="#work" class="btn-o">View Projects</a>
      <a href="${d.resumeLink}" target="_blank" class="btn-g">Resume / CV</a>
    </div>
    <div class="h-soc">${socialsHtml}</div>
  `;

  // Keep hero name visible after animation ends
  const heroName = document.querySelector('.h-name');
  if (heroName) {
    heroName.addEventListener('animationend', () => {
      heroName.style.opacity = '1';
    }, { once: true });
  }
}

function renderAbout() {
  const c = document.getElementById('about-container');
  if(!c) return;
  const idData = ABOUT_DATA.identityCard;
  const infoCards = ABOUT_DATA.infoCards;
  
  let badgesHtml = idData.badges.map(b => `<span class="id-badge ${b.class}">${b.text}</span>`).join('');
  let idCardHtml = `
    <div class="id-card">
      <div class="avatar">${idData.avatar}</div>
      <div class="id-name">${idData.name}</div>
      <div class="id-role">${idData.role}</div>
      <div class="id-badges">${badgesHtml}</div>
      <div class="gh-stats-label"><div class="dot"></div> <span>Live</span> GitHub Stats</div>
      <div class="gh-stats" id="gh-stats" style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:2px">
        <div class="gh-stat"><div class="gh-stat-icon">📦</div><div class="gh-stat-n" id="gh-repos">-</div><div class="gh-stat-l">public repos</div></div>
        <div class="gh-stat"><div class="gh-stat-icon">⭐</div><div class="gh-stat-n" id="gh-stars">-</div><div class="gh-stat-l">total stars</div></div>
        <div class="gh-stat"><div class="gh-stat-icon">👥</div><div class="gh-stat-n" id="gh-followers">-</div><div class="gh-stat-l">followers</div></div>
        <div class="gh-stat"><div class="gh-stat-icon">🔀</div><div class="gh-stat-n" id="gh-forks">-</div><div class="gh-stat-l">total forks</div></div>
      </div>
    </div>
  `;

  let infoCardsHtml = infoCards.map(ic => `
    <div class="info-card ${ic.cardClass}">
      <div class="ic-head">
        <div class="ic-icon ${ic.iconClass}">${ic.icon}</div>
        <div><div class="ic-title">${ic.title}</div><div class="ic-sub">${ic.subtitle}</div></div>
      </div>
      <div class="ic-body">${ic.body}</div>
      <ul class="ic-list">
        ${ic.list.map(li => `<li>${li}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  c.innerHTML = `
    ${idCardHtml}
    <div class="about-info">${infoCardsHtml}</div>
  `;
}

function renderExperience() {
  const c = document.getElementById('experience-timeline');
  if(!c) return;
  
  let html = `<div class="tl-line"></div>`;
  
  EXPERIENCE_DATA.forEach((exp, i) => {
    let badgesHtml = exp.badges.map(b => `<span class="tl-badge ${b.class}">${b.text}</span>`).join('');
    let bulletsHtml = exp.bullets.map(b => `<li>${b}</li>`).join('');
    let tagsHtml = exp.tags.map(t => `<span class="tl-tag ${t.class}">${t.text}</span>`).join('');
    
    html += `
      <div class="tl-item ${exp.isActive ? 'active-role' : ''} rv" style="transition-delay:.${i}s">
        <div class="tl-date">
          <span class="tl-year">${exp.year}</span>
          <span class="tl-month">${exp.month}</span>
          <span class="tl-duration">${exp.duration}</span>
        </div>
        <div class="tl-card">
          <div class="tl-top">
            <div>
              <div class="tl-role">${exp.role}</div>
              <div class="tl-company">${exp.company}</div>
              <div class="tl-loc">${exp.location}</div>
            </div>
            <div class="tl-badges">${badgesHtml}</div>
          </div>
          <ul class="tl-bullets">${bulletsHtml}</ul>
          <div class="tl-tags">${tagsHtml}</div>
        </div>
      </div>
    `;
  });
  
  c.innerHTML = html;
}

function renderAchievements() {
  const c = document.getElementById('achievements-row');
  if(!c) return;
  
  c.innerHTML = ACHIEVEMENTS_DATA.map(a => `
    <div class="ach-card">
      <div class="ach-icon">${a.icon}</div>
      <div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.description}</div>
      </div>
    </div>
  `).join('');
}

function renderProjects() {
  const c = document.getElementById('projects-container');
  if(!c) return;
  
  c.innerHTML = PROJECTS_DATA.map(p => `
    <div class="proj rv">
      <div class="p-info">
        <div class="p-idx"><span>PROJECT_${p.id}</span></div>
        <h3 class="p-name">${p.name}</h3>
        <span class="p-badge ${p.badge.class}">${p.badge.text}</span>
        <div class="proj-metrics">
          ${p.metrics.map(m => `<span class="pmet">${m.label} <span class="mv">${m.value}</span></span>`).join('')}
        </div>
        <p class="p-desc">${p.description}</p>
        <div class="p-tags">
          ${p.tags.map(t => `<span class="ptag ${t.class}">${t.text}</span>`).join('')}
        </div>
        <div class="p-links">
          ${p.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="${l.class}">${l.text}</a>`).join('')}
        </div>
      </div>
      <div class="p-vis">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="pnum">${p.id}</div>
      </div>
    </div>
  `).join('');
}

function renderSkills() {
  const c = document.getElementById('skills-container');
  if(!c) return;
  
  let devSkills = SKILLS_DATA.development.map(s => `
    <div class="skill" ${s.title ? `title="${s.title}"` : ''}>
      <img src="${s.icon}" class="skill-icon" alt="${s.name}" loading="lazy" ${s.filter ? `style="filter:${s.filter}"` : ''}>
      <span class="skill-name">${s.name}</span>
    </div>
  `).join('');
  
  let secSkills = SKILLS_DATA.security.map(s => `
    <div class="sec-skill">
      <div class="sec-skill-icon">
        <img src="${s.icon}" alt="${s.name}" loading="lazy" ${s.filter ? `style="filter:${s.filter}"` : ''}>
      </div>
      <div class="sec-skill-info">
        <div class="sec-skill-name">${s.name}</div>
        <div class="sec-skill-cat">${s.category}</div>
      </div>
    </div>
  `).join('');

  c.innerHTML = `
    <div class="rv">
      <div class="skill-section-label">Development Stack</div>
      <div class="skills-grid">${devSkills}</div>
    </div>
    <div class="rv">
      <div class="skill-section-label sec-label-r">Security &amp; Reverse Engineering</div>
      <div class="sec-skills-grid">${secSkills}</div>
    </div>
  `;
}

function renderContact() {
  const c = document.getElementById('contact-left');
  if(!c) return;
  const d = ABOUT_DATA.contact;
  
  let paragraphs = d.paragraphs.map(p => `<p>${p}</p>`).join('');
  let links = d.links.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener" class="c-link"><span class="ci">${l.icon}</span> ${l.text}</a>
  `).join('');

  c.innerHTML = `
    <div class="hire-tag"><span class="hire-dot"></span>${d.availabilityText}</div>
    <h3>${d.heading}</h3>
    ${paragraphs}
    <div class="c-links">${links}</div>
  `;
}

// Render everything
renderHero();
renderAbout();
renderExperience();
renderAchievements();
renderProjects();
renderSkills();
renderContact();

// ── Custom cursor ──
const curDot = document.getElementById('cur');
const curRing = document.getElementById('cur-r');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curDot.style.left = mx + 'px';
  curDot.style.top = my + 'px';
});
(function tick() {
  rx += (mx - rx) * .13;
  ry += (my - ry) * .13;
  curRing.style.left = rx + 'px';
  curRing.style.top = ry + 'px';
  requestAnimationFrame(tick);
})();
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('on-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('on-link'));
});

// ── Progress bar ──
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  prog.style.width = Math.min(pct, 100) + '%';
});

// ── Nav stuck state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('stuck', window.scrollY > 20));

// ── Active nav link on scroll ──
const secs = document.querySelectorAll('section[id]');
const nls = document.querySelectorAll('.nav-links a');
const navIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      nls.forEach(a => a.classList.remove('active'));
      const m = document.querySelector('.nav-links a[href="#' + e.target.id + '"]');
      if (m) m.classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' });
secs.forEach(s => navIO.observe(s));

// ── Scroll reveal ──
const rvIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.rv').forEach(r => rvIO.observe(r));

// ── Staggered skill reveal ──
const skillIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.15 });
document.querySelectorAll('.skills-grid, .sec-skills-grid').forEach(g => skillIO.observe(g));

// ── Achievements reveal ──
const achIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.15 });
document.querySelectorAll('.ach-row').forEach(a => achIO.observe(a));

// ── Hamburger menu ──
const ham = document.getElementById('ham');
const mob = document.getElementById('mob');
ham.addEventListener('click', () => {
  const open = mob.classList.toggle('open');
  const spans = ham.querySelectorAll('span');
  spans[0].style.transform = open ? 'rotate(45deg) translateY(8px)' : '';
  spans[1].style.opacity = open ? '0' : '1';
  spans[2].style.transform = open ? 'rotate(-45deg) translateY(-8px)' : '';
});
mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mob.classList.remove('open');
  ham.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
}));

// ── GitHub live stats ──
async function fetchGHStats() {
  try {
    const [user, repos] = await Promise.all([
      fetch('https://api.github.com/users/vishal2376').then(r => r.json()),
      fetch('https://api.github.com/users/vishal2376/repos?per_page=100').then(r => r.json())
    ]);
    const stars = Array.isArray(repos) ? repos.reduce((s, r) => s + r.stargazers_count, 0) : 0;
    const forks = Array.isArray(repos) ? repos.reduce((s, r) => s + r.forks_count, 0) : 0;
    countUp('gh-repos', user.public_repos || 0);
    countUp('gh-stars', stars);
    countUp('gh-followers', user.followers || 0);
    countUp('gh-forks', forks);
  } catch(err) { /* silently fail */ }
}
function countUp(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.ceil(target / 40);
  const t = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n;
    if (n >= target) clearInterval(t);
  }, 30);
}
fetchGHStats();

// ── Contact form ──
const cform = document.getElementById('cform');
const fok = document.getElementById('fok');
cform.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = cform.querySelector('.btn-send');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  try {
    const r = await fetch(cform.action, { method: 'POST', body: new FormData(cform), headers: { 'Accept': 'application/json' } });
    if (r.ok) { cform.reset(); fok.style.display = 'block'; btn.textContent = 'Sent'; }
    else { btn.textContent = 'Error - try again'; btn.disabled = false; }
  } catch { btn.textContent = 'Error - try again'; btn.disabled = false; }
});

// ── Project image hover zoom ──
const hoverPreview = document.createElement('div');
hoverPreview.id = 'img-hover-preview';
hoverPreview.innerHTML = '<img id="hover-preview-img" src="" alt="">';
document.body.appendChild(hoverPreview);

const hoverImg = document.getElementById('hover-preview-img');

document.querySelectorAll('.p-vis img').forEach(img => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    hoverImg.src = img.src;
    hoverPreview.classList.add('show');
  });
});

hoverPreview.addEventListener('click', () => {
  hoverPreview.classList.remove('show');
});

// ── Go to top button ──
const btnTop = document.getElementById('btn-top');
if (btnTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btnTop.classList.add('show');
    else btnTop.classList.remove('show');
  });
  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
