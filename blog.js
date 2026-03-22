// blog.js — two-view: home (cards) / post (reading + TOC)

const viewHome = document.getElementById('view-home');
const viewPost = document.getElementById('view-post');
const postsGrid = document.getElementById('posts-grid');
const postArticle = document.getElementById('post-article');
const tocNav = document.getElementById('toc-nav');
const backBtn = document.getElementById('back-btn');

// ── Render home: post cards ──
function renderHome() {
  if (!postsGrid) return;
  postsGrid.innerHTML = BLOGS_DATA.map(b => {
    const tagsHtml = b.tags.map(t =>
      `<span class="pc-tag ${t.class}">${t.text}</span>`
    ).join('');
    return `
      <div class="post-card" onclick="navigateTo('${b.id}')">
        <div class="pc-top">
          <div class="pc-title">${b.title}</div>
          <div class="pc-arrow">↗</div>
        </div>
        <div class="pc-desc">${b.description}</div>
        <div class="pc-foot">
          <span class="pc-date">${b.date}</span>
          <span class="pc-dot">·</span>
          <span class="pc-time">${b.readTime}</span>
          <span class="pc-dot">·</span>
          ${tagsHtml}
        </div>
      </div>
    `;
  }).join('');
}

// ── Navigate to a post ──
function navigateTo(id) {
  window.location.hash = '#' + id;
}

// ── Go back to home ──
function showHome() {
  viewPost.classList.add('hidden');
  viewHome.classList.remove('hidden');
  window.history.pushState(null, null, window.location.pathname);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Build table of contents from rendered headings ──
function buildTOC() {
  if (!tocNav) return;
  const headings = postArticle.querySelectorAll('h2, h3');
  if (headings.length === 0) { tocNav.innerHTML = ''; return; }

  tocNav.innerHTML = Array.from(headings).map((h, i) => {
    // Give each heading a stable ID for anchor linking
    if (!h.id) h.id = 'h-' + i;
    const isH3 = h.tagName === 'H3';
    return `<a href="#" class="toc-link ${isH3 ? 'toc-h3' : ''}" data-target="${h.id}">${h.textContent}</a>`;
  }).join('');

  // Click handlers — smooth scroll without URL change
  tocNav.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Highlight active section on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = tocNav.querySelector(`[data-target="${entry.target.id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { rootMargin: '-64px 0px -70% 0px', threshold: 0 });

  headings.forEach(h => observer.observe(h));
}

// ── Load and display a post ──
async function loadPost(id) {
  const blog = BLOGS_DATA.find(b => b.id === id);
  if (!blog) {
    viewHome.classList.remove('hidden');
    viewPost.classList.add('hidden');
    return;
  }

  viewHome.classList.add('hidden');
  viewPost.classList.remove('hidden');
  window.scrollTo(0, 0);

  // Show loading state
  postArticle.innerHTML = `
    <div class="post-hero">
      <p style="color:var(--dim);font-family:var(--mono);font-size:13px;">// loading...</p>
    </div>
  `;

  try {
    const res = await fetch(`blogs/${blog.filename}`);
    if (!res.ok) throw new Error(`${res.status} - could not fetch post`);
    const md = await res.text();
    const rawHtml = marked.parse(md);
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    // Build tags
    const tagsHtml = blog.tags.map(t =>
      `<span class="pc-tag ${t.class}" style="font-size:11px;padding:3px 10px;">${t.text}</span>`
    ).join('');

    postArticle.innerHTML = `
      <div class="post-hero">
        <div class="post-hero-tags">${tagsHtml}</div>
        <h1>${blog.title}</h1>
        <div class="post-hero-meta">
          <span>${blog.date}</span>
          <span>·</span>
          <span class="cyan">${blog.readTime}</span>
        </div>
      </div>
      ${cleanHtml}
    `;

    // Syntax highlight and add language/copy header
    postArticle.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;
      
      const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'text';
      
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      
      const header = document.createElement('div');
      header.className = 'code-header';
      
      // Determine icon based on language
      let iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
      if (lang === 'bash' || lang === 'sh') {
        iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>';
      } else if (lang === 'javascript' || lang === 'js') {
        iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
      }
      
      header.innerHTML = `
        <div class="code-lang">
          ${iconHtml}
          <span>${lang}</span>
        </div>
        <button class="code-copy" aria-label="Copy code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span class="copy-text">Copy</span>
        </button>
      `;
      
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      
      const copyBtn = header.querySelector('.code-copy');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(code.innerText);
        const textSpan = copyBtn.querySelector('.copy-text');
        textSpan.textContent = 'Copied!';
        setTimeout(() => textSpan.textContent = 'Copy', 2000);
      });
      
      hljs.highlightElement(code);
    });

    // Build TOC
    buildTOC();

  } catch (err) {
    postArticle.innerHTML = `
      <div class="post-hero">
        <h1 style="color:#ff3860">Failed to load</h1>
        <p style="color:var(--dim);font-family:var(--mono);font-size:13px;">${err.message}</p>
      </div>
    `;
  }
}

// ── Router ──
function handleRoute() {
  const id = window.location.hash.substring(1);
  if (id && BLOGS_DATA.find(b => b.id === id)) {
    loadPost(id);
  } else {
    viewPost.classList.add('hidden');
    viewHome.classList.remove('hidden');
  }
}

// ── Init ──
if (backBtn) backBtn.addEventListener('click', showHome);
window.addEventListener('hashchange', handleRoute);
renderHome();
handleRoute();

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
