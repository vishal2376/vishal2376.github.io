// blog.js — two-view: home (cards) / post (reading + TOC)

let currentTag = 'All';
let currentSort = 'new';
let searchQuery = '';
let tocScrollHandler = null;

const viewHome = document.getElementById('view-home');
const viewPost = document.getElementById('view-post');
const postsGrid = document.getElementById('posts-grid');
const postArticle = document.getElementById('post-article');
const tocNav = document.getElementById('toc-nav');
const backBtn = document.getElementById('back-btn');

// ── Render home: post cards ──
function renderHome() {
  if (!postsGrid) return;

  // Filter & Sort
  let filtered = BLOGS_DATA.filter(b => {
    const matchTag = currentTag === 'All' || b.tags.some(t => t.text === currentTag);
    const matchSearch = b.title.toLowerCase().includes(searchQuery) || b.description.toLowerCase().includes(searchQuery);
    return matchTag && matchSearch;
  });
  
  filtered.sort((a, b) => {
    const aIdx = BLOGS_DATA.indexOf(a);
    const bIdx = BLOGS_DATA.indexOf(b);
    return currentSort === 'new' ? (aIdx - bIdx) : (bIdx - aIdx);
  });

  if (filtered.length === 0) {
    postsGrid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--dim);font-family:var(--mono);font-size:12px;">No matching writeups found.</div>`;
    return;
  }

  postsGrid.innerHTML = filtered.map((b, idx) => {
    const tagsHtml = b.tags.map(t =>
      `<span class="pc-tag ${t.class}" onclick="clickTag('${t.text}', event)">${t.text}</span>`
    ).join('');
    return `
      <div class="post-card" style="animation-delay: ${idx * 0.06}s" onclick="navigateTo('${b.id}')">
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

  // Note: Tag menu is now populated implicitly in initFilters()
}

// ── Custom Dropdown Handlers ──
document.addEventListener('click', e => {
  document.querySelectorAll('.custom-sel').forEach(sel => {
    if (sel.contains(e.target)) {
      sel.classList.toggle('open');
    } else {
      sel.classList.remove('open');
    }
  });
});

window.setSort = function(val, lbl, e) {
  if (e) e.stopPropagation();
  currentSort = val;
  document.getElementById('sort-lbl').innerText = lbl;
  const wrap = document.getElementById('sort-sel-wrap');
  if (wrap) {
    wrap.querySelectorAll('.s-opt').forEach(el => el.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    wrap.classList.remove('open');
  }
  renderHome();
};

window.setFilter = function(tag, e) {
  if (e) e.stopPropagation();
  currentTag = tag;
  document.getElementById('tag-lbl').innerText = 'Tag: ' + tag;
  const wrap = document.getElementById('tag-sel-wrap');
  if (wrap) {
    wrap.querySelectorAll('.tag-opt').forEach(el => {
      if (el.innerText.trim() === tag) el.classList.add('active');
      else el.classList.remove('active');
    });
    wrap.classList.remove('open');
  }
  renderHome();
};

window.clickTag = function(tag, e) {
  if (e) e.stopPropagation();
  if (!viewPost.classList.contains('hidden')) {
    viewPost.classList.add('hidden');
    viewHome.classList.remove('hidden');
    window.history.pushState(null, null, window.location.pathname);
  }
  setFilter(tag);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
  const headings = Array.from(postArticle.querySelectorAll('h2, h3'));
  if (headings.length === 0) { tocNav.innerHTML = ''; return; }

  tocNav.innerHTML = headings.map((h, i) => {
    // Give each heading a stable ID for anchor linking
    if (!h.id) h.id = 'h-' + i;
    const isH3 = h.tagName === 'H3';
    return `<a href="#" class="toc-link ${isH3 ? 'toc-h3' : ''}" data-target="${h.id}">${h.textContent}</a>`;
  }).join('');

  const links = tocNav.querySelectorAll('.toc-link');
  // Click handlers — smooth scroll without URL change
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.target);
      // Adjust scroll offset to account for sticky header
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // Sticky TOC scroll listener
  if (tocScrollHandler) {
    window.removeEventListener('scroll', tocScrollHandler);
  }
  
  tocScrollHandler = () => {
    let currentId = '';
    for (let i = 0; i < headings.length; i++) {
        const top = headings[i].getBoundingClientRect().top;
        if (top < 150) {
            currentId = headings[i].id;
        } else {
            break;
        }
    }
    if (!currentId && headings.length) currentId = headings[0].id;
    
    links.forEach(l => {
      if (l.dataset.target === currentId) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  };
  
  window.addEventListener('scroll', tocScrollHandler);
  tocScrollHandler();
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
      `<span class="pc-tag ${t.class}" style="font-size:11px;padding:3px 10px;cursor:pointer;" onclick="clickTag('${t.text}', event)">${t.text}</span>`
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

    // Make all content links open in new tab
    postArticle.querySelectorAll('a[href^="http"]').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener';
    });

    // Add Next / Previous Post
    const currentIndex = BLOGS_DATA.findIndex(b => b.id === id);
    let navHtml = '<div class="post-nav">';
    if (currentIndex < BLOGS_DATA.length - 1) {
      const prev = BLOGS_DATA[currentIndex + 1];
      navHtml += `<a href="#${prev.id}" class="post-nav-prev"><span class="nav-lbl">← Previous Post</span><span class="nav-tit">${prev.title}</span></a>`;
    } else {
      navHtml += `<div></div>`;
    }
    if (currentIndex > 0) {
      const next = BLOGS_DATA[currentIndex - 1];
      navHtml += `<a href="#${next.id}" class="post-nav-next"><span class="nav-lbl">Next Post →</span><span class="nav-tit">${next.title}</span></a>`;
    } else {
      navHtml += `<div></div>`;
    }
    navHtml += '</div>';

    postArticle.innerHTML += navHtml;

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
function initFilters() {
  const tagMenu = document.getElementById('tag-menu');
  if (!tagMenu) return;
  const allTags = new Set();
  BLOGS_DATA.forEach(b => b.tags.forEach(t => allTags.add(t.text)));
  const tagsArr = ['All', ...Array.from(allTags)];
  
  tagMenu.innerHTML = tagsArr.map(t => 
    `<div class="tag-opt ${t === currentTag ? 'active' : ''}" onclick="setFilter('${t}', event)">${t}</div>`
  ).join('');

  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderHome();
    });
  }
}

if (backBtn) backBtn.addEventListener('click', showHome);
window.addEventListener('hashchange', handleRoute);
initFilters();
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
