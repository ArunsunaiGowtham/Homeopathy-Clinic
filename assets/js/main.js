/**
 * AuraPure Homeopathy Clinic - Master Interactive Script
 * Handles: Theme Mode (Light/Dark), RTL Toggle, Active Nav State, 
 * Blog Search & Filtering, Appointment Form Validation & Modals, Counters & Countdown.
 */

function initAuraPureApp() {
  'use strict';

  // ==========================================
  // 1. Light / Dark Theme Mode Management
  // ==========================================
  const THEME_KEY = 'aurapure_theme';
  const htmlElement = document.documentElement;

  function initTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam === 'light' || themeParam === 'dark') {
      setTheme(themeParam);
      return;
    }
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleIcons(theme);
  }

  function updateThemeToggleIcons(theme) {
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
      const icon = btn.querySelector('i');
      const text = btn.querySelector('.theme-text');
      // Ensure no browser tooltip notification is shown on click or hover
      btn.removeAttribute('title');
      if (text) {
        text.textContent = '';
        text.style.display = 'none';
      }
      if (theme === 'dark') {
        if (icon) icon.className = 'bi bi-sun-fill text-warning';
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        if (icon) icon.className = 'bi bi-moon-stars-fill text-success';
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });

    // Ensure direction toggle buttons remain clearly visible and synced on theme change
    const currentDir = htmlElement.getAttribute('dir') || 'ltr';
    updateDirToggleIcons(currentDir);
  }

  // Attach theme toggle listeners
  document.addEventListener('click', function (e) {
    const target = e.target.closest('.theme-toggle-btn');
    if (target) {
      const currentTheme = htmlElement.getAttribute('data-bs-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    }
  });

  initTheme();

  // ==========================================
  // 2. RTL / LTR Direction Management
  // ==========================================
  const DIR_KEY = 'aurapure_dir';

  function initDirection() {
    const savedDir = localStorage.getItem(DIR_KEY);
    if (savedDir) {
      setDirection(savedDir);
    } else {
      setDirection('ltr');
    }
  }

  function setDirection(dir) {
    htmlElement.setAttribute('dir', dir);
    htmlElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    localStorage.setItem(DIR_KEY, dir);
    updateDirToggleIcons(dir);
  }

  function updateDirToggleIcons(dir) {
    const dirButtons = document.querySelectorAll('.rtl-toggle-btn');
    dirButtons.forEach(btn => {
      const text = btn.querySelector('.dir-text');
      if (text) {
        text.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
        text.style.display = 'inline-block';
      }
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      btn.setAttribute('title', dir === 'rtl' ? 'Switch to LTR (English)' : 'Switch to RTL (العربية)');
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR Direction' : 'Switch to RTL Direction');
    });
  }

  document.addEventListener('click', function (e) {
    const target = e.target.closest('.rtl-toggle-btn');
    if (target) {
      const currentDir = htmlElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      setDirection(newDir);
    }
  });

  initDirection();

  // ==========================================
  // 3. Active Navigation State Detection
  // ==========================================
  function highlightActiveNavLink() {
    // Extract clean filename from current location, stripping queries, hashes, and leading slashes
    let currentPath = window.location.pathname.split('/').pop() || '';
    currentPath = currentPath.split('?')[0].split('#')[0].trim();
    if (!currentPath || currentPath === '') currentPath = 'index.html';

    const cleanCurrent = currentPath.toLowerCase().replace(/\.html$/, '');

    // Map sub-pages / detail pages to main navbar sections
    let mappedPage = cleanCurrent;
    if (cleanCurrent === 'service-details' || cleanCurrent.startsWith('service-')) {
      mappedPage = 'services';
    } else if (cleanCurrent === 'blog-details' || cleanCurrent.startsWith('blog-')) {
      mappedPage = 'blog';
    }

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle), .dropdown-menu .dropdown-item');
    const homeDropdownToggle = document.getElementById('homeDropdown');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const linkFile = href.split('/').pop().split('?')[0].split('#')[0].trim();
      const cleanLink = linkFile.toLowerCase().replace(/\.html$/, '');

      // Check if this link matches current page or mapped parent section
      const isMatch = (cleanLink === cleanCurrent) || (cleanLink === mappedPage);

      if (isMatch) {
        link.classList.add('active');

        // If it's a dropdown item, also highlight parent dropdown toggle
        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
          if (dropdownToggle) dropdownToggle.classList.add('active');
        }
      } else {
        link.classList.remove('active');
      }
    });

    // If on home pages, ensure Home dropdown toggle is highlighted
    if (cleanCurrent === 'index' || cleanCurrent === 'home-2' || cleanCurrent === '') {
      if (homeDropdownToggle) homeDropdownToggle.classList.add('active');
    } else {
      // If we are on an internal page, ensure Home dropdown is not active
      if (homeDropdownToggle) homeDropdownToggle.classList.remove('active');
    }
  }

  highlightActiveNavLink();

  // Auto-close mobile navigation when non-dropdown links are clicked
  const navbarContent = document.getElementById('navbarContent');
  if (navbarContent && typeof bootstrap !== 'undefined') {
    const navClickables = navbarContent.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item, .btn-clinic-primary');
    navClickables.forEach(item => {
      item.addEventListener('click', function () {
        if (window.innerWidth < 992 && navbarContent.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarContent) || new bootstrap.Collapse(navbarContent, { toggle: false });
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  // ==========================================
  // Sticky Navbar Scroll Elevation & State
  // ==========================================
  function initStickyNavbar() {
    const navbar = document.querySelector('.navbar-clinic');
    if (!navbar) return;

    function handleScroll() {
      if (window.scrollY > 15) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  initStickyNavbar();

  // ==========================================
  // 4. Working Blog Search & Category Filtering
  // ==========================================
  const blogSearchInput = document.getElementById('blogSearchInput');
  const blogPills = document.querySelectorAll('.blog-cat-pill');
  const blogSidebarBtns = document.querySelectorAll('.blog-category-btn');
  const blogCards = document.querySelectorAll('.blog-item-col');
  const noBlogResults = document.getElementById('noBlogResults');
  const blogVisibleCount = document.getElementById('blogVisibleCount');

  let currentBlogCategory = 'all';

  function filterBlogPosts() {
    if (!blogCards.length) return;

    const searchTerm = blogSearchInput ? blogSearchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    blogCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const excerpt = (card.getAttribute('data-excerpt') || '').toLowerCase();
      const author = (card.getAttribute('data-author') || '').toLowerCase();
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();

      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        excerpt.includes(searchTerm) || 
        category.includes(searchTerm) || 
        author.includes(searchTerm) || 
        keywords.includes(searchTerm);

      const matchesCategory = currentBlogCategory === 'all' || category === currentBlogCategory.toLowerCase();

      if (matchesSearch && matchesCategory) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (blogVisibleCount) {
      blogVisibleCount.textContent = visibleCount;
    }

    if (noBlogResults) {
      noBlogResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  function setActiveBlogCategory(cat) {
    currentBlogCategory = cat;

    // Synchronize top pills
    blogPills.forEach(pill => {
      if (pill.getAttribute('data-category') === cat) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Synchronize sidebar links
    blogSidebarBtns.forEach(btn => {
      if (btn.getAttribute('data-category') === cat) {
        btn.classList.add('active', 'text-success', 'fw-bold');
        btn.classList.remove('text-secondary');
      } else {
        btn.classList.remove('active', 'text-success', 'fw-bold');
        btn.classList.add('text-secondary');
      }
    });

    filterBlogPosts();
  }

  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', filterBlogPosts);
  }

  const resetBlogBtn = document.getElementById('resetBlogBtn');
  if (resetBlogBtn) {
    resetBlogBtn.addEventListener('click', function () {
      if (blogSearchInput) {
        blogSearchInput.value = '';
      }
      setActiveBlogCategory('all');
    });
  }

  if (blogPills.length > 0) {
    blogPills.forEach(pill => {
      pill.addEventListener('click', function () {
        const cat = this.getAttribute('data-category') || 'all';
        setActiveBlogCategory(cat);
      });
    });
  }

  if (blogSidebarBtns.length > 0) {
    blogSidebarBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const cat = this.getAttribute('data-category') || 'all';
        setActiveBlogCategory(cat);
      });
    });
  }

  // Check URL parameters on initial load (e.g. blog.html?cat=skin or blog.html?q=remedies)
  const initialUrlParams = new URLSearchParams(window.location.search);
  const initialCat = initialUrlParams.get('cat');
  const initialQ = initialUrlParams.get('q');
  if (initialQ && blogSearchInput) {
    blogSearchInput.value = initialQ;
  }
  if (initialCat) {
    setActiveBlogCategory(initialCat);
  } else if (blogCards.length > 0) {
    filterBlogPosts();
  }

  // ==========================================
  // 4.1 Dynamic Blog Details Loader (blog-details.html)
  // ==========================================
  const BLOG_ARTICLES_DATA = {
    '1': {
      id: '1',
      title: 'Understanding Constitutional Homeopathy: How Your Unique Vital Force Guides Healing',
      shortTitle: 'Constitutional Homeopathy',
      category: 'Chronic Care & Philosophy',
      categorySlug: 'chronic',
      readTime: '6 min read',
      author: 'Dr. Eleanor Vance, MD (Homeopathy)',
      authorRole: 'MD (Homeopathy), Senior Physician at AuraPure',
      authorImg: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on October 12, 2026 • Clinical Review Board',
      image: 'assets/images/header-blog-bg.jpg',
      imageAlt: 'Classical homeopathic tinctures, amber bottles, and pure sugar globules',
      authorBio: 'Over 22 years of clinical classical practice specializing in autoimmune conditions, thyroid disorders, and constitutional analysis.',
      lead: 'When a modern patient enters a conventional clinic with a recurring migraine, the diagnostic outcome is almost invariably identical: a prescription for a vasoconstrictor or pain reliever. Yet, in classical homeopathy, no two migraines are considered identical.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Principle of the Vital Force (Dynamis)</h3>
        <p class="text-secondary">
          In paragraph 9 of the <em>Organon of Medicine</em>, Dr. Samuel Hahnemann introduced the concept of the <strong>Vital Force</strong> — the invisible, self-regulating energetic principle that animates the material organism and preserves physiological harmony.
        </p>
        <p class="text-secondary">
          When an individual falls ill, it is not merely an isolated tissue or organ that has failed. It is the Vital Force that has been disturbed by emotional trauma, chronic stress, climatic exposure, or genetic predispositions (Miasms). The physical symptoms — whether skin eruptions, migraines, or gastrointestinal spasms — are not the disease itself, but the organism's best attempt to express and resolve that internal disturbance.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "The physician's high and only mission is to restore the sick to health, to cure, as it is termed... gently, rapidly, and permanently."
          </p>
          <small class="fw-bold text-success">— Dr. Samuel Hahnemann, Aphorism 1</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Why Individualization Matters: A Clinical Comparison</h3>
        <p class="text-secondary">
          Consider two real patients who recently sought care at AuraPure for recurring unilateral migraines:
        </p>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Patient A (Natrum Muriaticum)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Pain throbbing like "little hammers" over the right eye.</li>
                <li>Worse from 10:00 AM to 3:00 PM and from direct sunshine.</li>
                <li>Prefers solitude; aggravated by consolation or sympathy.</li>
                <li>Strong craving for salty foods; dry lips.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Patient B (Belladonna)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Violent, sudden-onset congestive pounding with red, flushed cheeks.</li>
                <li>Worse from light, noise, and the slightest jar of the bed.</li>
                <li>Pupils dilated; head feels intensely hot while extremities are cold.</li>
                <li>Craves cold lemonade; sudden departure of pain.</li>
              </ul>
            </div>
          </div>
        </div>
        <p class="text-secondary">
          Giving Natrum Muriaticum to Patient B would yield no therapeutic benefit, just as Belladonna would fail for Patient A. By respecting each patient’s unique constitutional totality, classical homeopathy stimulates a true self-healing response.
        </p>

        <h3 class="fw-bold mt-4 mb-3">Practical Rules for Taking Homeopathic Remedies</h3>
        <p class="text-secondary">
          To ensure optimal remedy absorption through the sublingual mucosal receptors:
        </p>
        <ol class="text-secondary small ps-3 mb-4">
          <li class="mb-2"><strong>Clean Mouth:</strong> Avoid eating, drinking coffee, or brushing teeth for 20 to 30 minutes before and after taking your globules.</li>
          <li class="mb-2"><strong>Avoid Strong Aromatics:</strong> Camphor, menthol, eucalyptus rubs, and strong peppermint toothpastes can occasionally antidote delicate high potencies.</li>
          <li class="mb-2"><strong>Dispensing:</strong> Tap the prescribed globules directly into the vial cap or onto a clean porcelain spoon without touching them with fingers.</li>
          <li><strong>Storage:</strong> Keep remedies away from strong direct sunlight, microwaves, and intense chemical fragrances.</li>
        </ol>
      `,
      relatedIds: ['2', '3']
    },
    '2': {
      id: '2',
      title: 'Steroid-Free Relief: Reversing Atopic Eczema Through Internal Cellular Purification',
      shortTitle: 'Steroid-Free Eczema Relief',
      category: 'Skin & Dermatology',
      categorySlug: 'skin',
      readTime: '5 min read',
      author: 'Dr. Maya Lin, BHMS',
      authorRole: 'BHMS, Specialist in Pediatric & Dermatological Homeopathy',
      authorImg: 'assets/images/dr-maya-lin.jpg',
      publishDate: 'Published on October 08, 2026 • Clinical Dermatology Board',
      image: 'assets/images/header-about-bg.jpg',
      imageAlt: 'Natural botanical skincare and soothing chamomile',
      authorBio: 'Specializes in recalcitrant atopic eczema, psoriasis, and pediatric dermatological disorders through deep-acting constitutional potencies.',
      lead: 'Topical corticosteroids offer fast temporary suppression for itchy atopic plaques, but at a severe physiological cost: steroid dependency, thinning of the dermis, and eventual internalization into allergic asthma. Classical homeopathy treats the skin as an organ of elimination, restoring dermal vitality from the core outwards.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Miasmatic Root of Cutaneous Eruptions</h3>
        <p class="text-secondary">
          In Hahnemannian pathology, suppression of external skin symptoms without neutralizing the underlying internal dyscrasia (traditionally termed the <em>Psora miasm</em>) forces inflammatory burden inward toward vital visceral organs — often manifesting as pediatric asthma or allergic rhinitis.
        </p>
        <p class="text-secondary">
          At AuraPure, our dermatological protocol focuses on gentle detoxification and cellular re-education. Rather than locking inflammation under steroid barriers, constitutional potencies encourage the skin barrier (stratum corneum) to rebuild lipid integrity from within.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Never suppress that which nature seeks to throw off onto the periphery. Cleanse the vital root, and the exterior blossom flourishes effortlessly."
          </p>
          <small class="fw-bold text-success">— Dr. Maya Lin, Clinical Dermatology Symposium</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Key Homeopathic Remedies in Clinical Dermatology</h3>
        <p class="text-secondary">
          Specific remedies are matched to cutaneous symptom modalities and metabolic thermal types:
        </p>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Graphites (Natural Carbon)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Honey-like, sticky, thick golden exudate behind ears and joint flexures.</li>
                <li>Dry, rough skin prone to deep cracking and fissures in cold weather.</li>
                <li>Aggravated by warmth of the bed and during menstrual cycles.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Sulphur &amp; Mezereum</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Intense voluptuous itching with severe burning after scratching.</li>
                <li>Intolerant of water or bathing; skin looks unwashed and red.</li>
                <li>Thick, leathery crusts under which chalky purulent exudate collects.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Navigating Topical Steroid Withdrawal (TSW) Safely</h3>
        <p class="text-secondary">
          When transitioning off synthetic cortisone, patients often experience an initial flare or rebound. Our physicians employ low-potency drainage remedies (such as Berberis Aquifolium, Sarsaparilla, and Calendula mother tincture compresses) alongside the constitutional simillimum to cushion this delicate detox period.
        </p>
      `,
      relatedIds: ['9', '10']
    },
    '3': {
      id: '3',
      title: 'Building Juvenile Immunity: Safe Homeopathic Solutions for Recurrent Tonsillitis',
      shortTitle: 'Juvenile Natural Immunity',
      category: 'Pediatric Care',
      categorySlug: 'pediatric',
      readTime: '4 min read',
      author: 'Dr. Julian Thorne, D.H.M.S.',
      authorRole: 'D.H.M.S., Classical Homeopath & Pediatric Specialist',
      authorImg: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 29, 2026 • Pediatric Care Group',
      image: 'assets/images/header-treatments-bg.jpg',
      imageAlt: 'Happy healthy child outdoors in nature',
      authorBio: 'Renowned for gentle, non-invasive pediatric interventions that eliminate recurring ENT infections, allergies, and childhood immune deficiencies.',
      lead: 'Breaking the repetitive cycle of antibiotics in early childhood requires strengthening the child’s natural vital force. Gentle, pleasant milk-sugar globules stimulate lymphatic vitality without side effects or gut flora disruption.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Tonsils as Essential Immune Gatekeepers</h3>
        <p class="text-secondary">
          Waldeyer’s lymphatic ring — comprising the palatine tonsils and adenoids — is a child\'s first protective shield against respiratory pathogens. Surgically removing them simply eliminates the symptom alarm while leaving the underlying vulnerability unaddressed.
        </p>
        <p class="text-secondary">
          Repeated antibiotic cycles further erode the infant microbiome, leading to food intolerances and secondary fungal overgrowth. Homeopathy gently desensitizes lymphatic tissues and builds robust immune memory.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Children respond with unmatched vitality to constitutional potencies. What took months to heal in an adult often clears in days in a vibrant young organism."
          </p>
          <small class="fw-bold text-success">— Dr. Julian Thorne, Pediatric Clinical Notes</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Cornerstone Pediatric Remedies</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Baryta Carbonica</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Chronically hypertrophied tonsils that almost meet in the midline.</li>
                <li>Extreme susceptibility to cold drafts; catch tonsillitis after any damp weather.</li>
                <li>Shy, hesitant disposition with slow physical or cognitive milestones.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Calcarea Carbonica</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Chubby, fair, easily sweating around head and neck during sleep.</li>
                <li>Enlarged cervical and mesenteric lymph glands.</li>
                <li>Cravings for boiled eggs and dairy; sensitive to damp weather.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Child-Friendly Administration</h3>
        <p class="text-secondary">
          Our remedies are prepared on organic sucrose and lactose pilules that dissolve instantly under the tongue with a sweet, agreeable taste. There is zero resistance, nausea, or medicinal trauma, turning each dose into an easy, peaceful ritual.
        </p>
      `,
      relatedIds: ['14', '15']
    },
    '4': {
      id: '4',
      title: 'The Gut-Brain Axis: Relieving IBS and Restoring Deep Sleep Naturally',
      shortTitle: 'Gut-Brain Axis & Sleep',
      category: 'Holistic Lifestyle & Wellness',
      categorySlug: 'wellness',
      readTime: '7 min read',
      author: 'Dr. Arthur Pendelton, M.D. (Hom)',
      authorRole: 'M.D. (Hom), Clinical Gastroenterology & Neuro-Wellness',
      authorImg: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 18, 2026 • Neuro-Gastroenterology Panel',
      image: 'assets/images/header-testimonials-bg.jpg',
      imageAlt: 'Serene herbal tea and mindful relaxation',
      authorBio: 'Pioneering research into psychosomatic medicine, neuro-enteric communication, and constitutional remedies for stress-induced visceral disorders.',
      lead: 'Emotional anxiety and visceral spasms share common neuro-chemical messengers. By restoring harmony between the central and enteric nervous systems, constitutional care resolves both IBS and chronic insomnia naturally.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Enteric Nervous System: Your Second Brain</h3>
        <p class="text-secondary">
          Over 90% of the body\'s serotonin is synthesized not in the cranial brain, but in the mucosal enterochromaffin cells of the digestive tract. When chronic psychological tension triggers high cortisol, peristalsis becomes erratic, causing alternating constipation, diarrhea, and nocturnal wakefulness.
        </p>
        <p class="text-secondary">
          Homeopathy recognizes this psychosomatic intimacy, prescribing remedies that address both mental temperament and gut symptomatology simultaneously.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "You cannot treat the agitated intestine while ignoring the agitated mind. Mind and microbiome speak one single biological language."
          </p>
          <small class="fw-bold text-success">— Dr. Arthur Pendelton, Mind-Body Medicine Review</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Distinct Constitutional Profiles in Gut Care</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Nux Vomica (Sedentary Overachiever)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Driven, ambitious, irritable; consumes excess coffee and rich foods.</li>
                <li>Ineffectual urge for stool; spasmodic cramps relieved after evacuation.</li>
                <li>Wakes at 3:00 AM ruminating over work, unable to fall back asleep.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Argentum Nitricum (Anticipatory Anxiety)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Urgent diarrhea and stomach rumbling right before meetings or flights.</li>
                <li>Craves sweets which disagree severely and cause excessive bloating.</li>
                <li>Restless, hurried mind accompanied by visceral flutterings.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Restoring Restorative Sleep Architecture</h3>
        <p class="text-secondary">
          Unlike synthetic sedatives that induce artificial non-REM unconsciousness, remedies like Passiflora Incarnata mother tincture and Coffea Cruda high potencies quiet neuro-sensory hypersensitivity, allowing natural delta-wave regenerative sleep cycles to unfold.
        </p>
      `,
      relatedIds: ['20', '21']
    },
    '5': {
      id: '5',
      title: 'Natural Defenses Against Seasonal Rhinitis and Bronchial Allergies',
      shortTitle: 'Seasonal Rhinitis Defenses',
      category: 'Respiratory Care',
      categorySlug: 'respiratory',
      readTime: '5 min read',
      author: 'Dr. Alistair Sterling, MD (Hom)',
      authorRole: 'MD (Hom), Classical Homeopath & Respiratory Specialist',
      authorImg: 'assets/images/dr-alistair-sterling.jpg',
      publishDate: 'Published on September 10, 2026 • Respiratory Health Panel',
      image: 'assets/images/header-pricing-bg.jpg',
      imageAlt: 'Blowing dandelion seeds in seasonal air',
      authorBio: 'Clinical authority on seasonal desensitization protocols, allergic asthma, and non-drowsy natural allergy modulation.',
      lead: 'Antihistamines mask allergy symptoms while causing daytime lethargy and rebound mucosal dryness. Potentized classical remedies re-educate the immune threshold, desensitizing mucosal linings to airborne allergens permanently.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Re-Educating Hypersensitive Mucous Membranes</h3>
        <p class="text-secondary">
          When airborne pollen or dust mites trigger IgE antibody cascades, histamine release engorges nasal turbinates and inflames conjunctival membranes. Classical homeopathy uses micro-dilutions to teach the immune system that innocuous environmental proteins are harmless.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Like cures like: the substance capable of producing tearing eyes in crude form, when potentized, stops allergic tearing immediately."
          </p>
          <small class="fw-bold text-success">— Dr. Alistair Sterling, Classical Immunology Lectures</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Acute Rhinitis Remedy Differentiation</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Allium Cepa (Red Onion)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Acrid, burning nasal discharge that corrodes the upper lip.</li>
                <li>Profuse, bland, non-irritating lachrymation (tears).</li>
                <li>Markedly improved out in the open, fresh, cool air.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Euphrasia (Eyebright) &amp; Sabadilla</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Acrid, scalding tears with bland, watery nasal running (opposite of Allium).</li>
                <li>Paroxysmal sneezing fits provoked by floral perfumes or cold air.</li>
                <li>Itching of the soft palate and deep in the Eustachian tubes.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Pre-Seasonal Constitutional Prophylaxis</h3>
        <p class="text-secondary">
          Beginning constitutional care 6 to 8 weeks before high-pollen seasons dramatically diminishes reactivity. By elevating vital resistance with remedies like Arsenicum Album or Natrum Muriaticum, patients enjoy spring and autumn without carrying antihistamine nasal sprays.
        </p>
      `,
      relatedIds: ['16', '17']
    },
    '6': {
      id: '6',
      title: 'Hormonal Equilibrium: Managing PCOS & Menopause Through Classical Care',
      shortTitle: 'Hormonal Equilibrium & PCOS',
      category: 'Women\'s Health',
      categorySlug: 'women',
      readTime: '6 min read',
      author: 'Dr. Ananya Sharma, MD (Hom)',
      authorRole: 'MD (Hom), Specialist in Women\'s Endocrine & Reproductive Wellness',
      authorImg: 'assets/images/dr-ananya-sharma.jpg',
      publishDate: 'Published on August 28, 2026 • Women’s Health Circle',
      image: 'assets/images/header-contact-bg.jpg',
      imageAlt: 'Herbal medicine and natural balancing botanicals for women\'s health',
      authorBio: 'Over 16 years guiding women through cycle irregularities, polycystic ovarian syndrome, and smooth menopausal transitions without synthetic hormones.',
      lead: 'Forcing the female reproductive cycle with synthetic progestins or artificial hormone replacement therapy often silences vital biological cues. Classical homeopathy works in harmony with organic endocrine feedback loops to restore smooth ovulatory cycles and ease menopausal transitions.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Hypothalamic-Pituitary-Ovarian (HPO) Axis</h3>
        <p class="text-secondary">
          Polycystic Ovarian Syndrome (PCOS) is not merely a gynecological complaint — it is a systemic metabolic, neuro-endocrine imbalance characterized by insulin resistance and elevated luteinizing hormone (LH). Artificial birth control pills create withdrawal bleeds rather than natural physiological ovulation.
        </p>
        <p class="text-secondary">
          Homeopathy stimulates pituitary feedback sensitivity, assisting ovarian follicles to mature naturally, while clearing cystic congestion.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "A woman’s endocrine rhythm is an orchestra. Synthetic hormones silence the instruments; classical homeopathy re-tunes the entire ensemble."
          </p>
          <small class="fw-bold text-success">— Dr. Ananya Sharma, Endocrine Classical Care</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Key Endocrine Remedies</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Pulsatilla Pratensis (Wind Flower)</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Late, scanty, delayed or suppressed menses after exposure to cold or wet feet.</li>
                <li>Gentle, affectionate, yielding disposition; cries easily when explaining symptoms.</li>
                <li>Relief in cool open air; thirstless even with hormonal heat flares.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Sepia Officinalis &amp; Lachesis</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Bearing-down sensation in the pelvic basin; emotional indifference to loved ones.</li>
                <li>Extreme physical exhaustion; relief from vigorous aerobic exercise.</li>
                <li>Sudden suffocative hot flashes at menopause, worse from tight clothing around the neck.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Comprehensive Wellness and Cycle Tracking</h3>
        <p class="text-secondary">
          Alongside constitutional remedies, our practitioners integrate basal body temperature charting, low-glycemic Mediterranean nutrition, and adaptogenic botanical support to solidify endocrine vitality at every stage of life.
        </p>
      `,
      relatedIds: ['18', '19']
    },
    '7': {
      id: '7',
      title: 'Restoring Gut Microbiome Balance & Acid Reflux Relief Naturally',
      shortTitle: 'Gut Microbiome & Acid Reflux',
      category: 'Digestive Health',
      categorySlug: 'digestive',
      readTime: '5 min read',
      author: 'Dr. Henrik Sorensen, BHMS',
      authorRole: 'BHMS, Dip. Clinical Gastroenterology Specialist',
      authorImg: 'assets/images/dr-henrik-sorensen.jpg',
      publishDate: 'Published on August 15, 2026 • Digestive Health Forum',
      image: 'assets/images/treatment-chronic-remedies.jpg',
      imageAlt: 'Nutritional and botanical digestive wellness',
      authorBio: 'Specializing in inflammatory bowel conditions, gastroesophageal reflux, and natural gut mucosal regeneration.',
      lead: 'Chronic acid reflux is rarely a condition of excessive acid; it is almost always an issue of esophageal sphincter tonicity, gastric emptying motility, and mucosal inflammation. Discover how constitutional potencies heal the digestive lining without long-term proton pump inhibitor dependency.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Fallacy of Long-Term Acid Suppression</h3>
        <p class="text-secondary">
          Stomach acid (hydrochloric acid) is necessary for protein denaturation, vitamin B12 absorption, and defense against ingested bacteria. Prolonged suppression with antacids or PPIs impairs digestion, leading to small intestinal bacterial overgrowth (SIBO) and systemic nutrient deficiencies.
        </p>
        <p class="text-secondary">
          Homeopathy strengthens the lower esophageal sphincter (LES) muscular tone and accelerates gastric emptying, ensuring acid remains where it belongs.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Acid is our biological friend for digestion; the goal of medicine is not to suppress it, but to restore the mucosal fortitude that houses it."
          </p>
          <small class="fw-bold text-success">— Dr. Henrik Sorensen, Clinical Digestive Studies</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Remedies for Reflux, Bloating &amp; Gastritis</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Robinia &amp; Iris Versicolor</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Intensely sour eructations and regurgitation that sets teeth on edge.</li>
                <li>Frontal migraines preceded by visual auras and nausea during reflux peaks.</li>
                <li>Burning distress extending from epigastrium up into the pharynx.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Carbo Vegetabilis &amp; Lycopodium</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Enormous upper abdominal distension and fermentation after lightest meal.</li>
                <li>Desire to be fanned; relief from belching or loosening tight clothing.</li>
                <li>Fullness after a few mouthfuls, aggravated between 4:00 PM and 8:00 PM.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Gut Mucosal Repair Protocol</h3>
        <p class="text-secondary">
          We combine constitutional potencies with soothing natural demulcents like deglycyrrhizinated licorice (DGL), slippery elm, and fermented prebiotics to repair leaky cellular tight junctions and restore peaceful digestive transit.
        </p>
      `,
      relatedIds: ['12', '13']
    },
    '8': {
      id: '8',
      title: 'Managing Autoimmune Thyroiditis (Hashimoto\'s) with Constitutional Potencies',
      shortTitle: 'Autoimmune Thyroiditis Care',
      category: 'Chronic Care & Immunology',
      categorySlug: 'chronic',
      readTime: '6 min read',
      author: 'Dr. Sarah Jenkins, MD (Hom)',
      authorRole: 'MD (Hom), Functional Medicine & Autoimmune Thyroid Specialist',
      authorImg: 'assets/images/dr-sarah-jenkins.jpg',
      publishDate: 'Published on August 02, 2026 • Clinical Immunology Board',
      image: 'assets/images/treatment-homeopathy-remedies.jpg',
      imageAlt: 'Constitutional homeopathic potencies, dropper bottles and lactose globules',
      authorBio: 'Pioneering integrative constitutional homeopathy protocols for autoimmune thyroiditis, regulating anti-TPO levels, and restoring cellular stamina.',
      lead: 'Elevated anti-TPO and anti-thyroglobulin antibodies signal immune disorientation rather than an isolated thyroid gland defect. Discover the multi-tiered classical approach to dampening autoimmune reactivity, elevating cellular vitality, and mitigating chronic systemic fatigue.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Why Hashimoto's is an Immune Disease First</h3>
        <p class="text-secondary">
          Conventional management of Hashimoto's thyroiditis primarily monitors TSH levels and supplements exogenous synthetic levothyroxine when damage is already extensive. However, replacement hormones do nothing to halt antibody-mediated follicular destruction.
        </p>
        <p class="text-secondary">
          Constitutional homeopathy addresses the central immune hyper-reactivity, aiming to preserve thyroid parenchyma, regulate antibody titers, and reverse chronic cellular stagnation.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "We do not treat a thyroid in a jar; we treat the complex, sentient human being whose immune system has turned inward upon itself."
          </p>
          <small class="fw-bold text-success">— Dr. Sarah Jenkins, Classical Autoimmune Protocols</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Constitutional Remedies in Thyroid Care</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Calcarea Carbonica &amp; Graphites</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Profound metabolic sluggishness, unexplained weight gain, and chilliness.</li>
                <li>Chronic constipation, brittle nails, and hair thinning along outer eyebrows.</li>
                <li>Mental fatigue, overwhelm, and sensation of sluggish processing.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Thyroidinum &amp; Iodum Potencies</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Potentized sarcodes to support cellular responsiveness to available T3/T4.</li>
                <li>Sudden heart palpitations alternating with profound exhaustion.</li>
                <li>Regulates glandular enlargement, throat constriction, and emotional lability.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Integrated Monitoring and Quality of Life</h3>
        <p class="text-secondary">
          Patients undergo serial quarterly thyroid antibody profiling and clinical vitality scorecards. Over 80% of AuraPure patients report marked reductions in brain fog, cold intolerance, and muscular heaviness within the first three months of constitutional care.
        </p>
      `,
      relatedIds: ['1', '6']
    },
    '9': {
      id: '9',
      title: 'Overcoming Plaque Psoriasis: Restoring Dermal Harmony from Within',
      shortTitle: 'Overcoming Plaque Psoriasis',
      category: 'Skin & Dermatology',
      categorySlug: 'skin',
      readTime: '6 min read',
      author: 'Dr. Chloe Laurent, ND, Dip. Hom',
      authorRole: 'ND, Dip. Hom, Specialist in Integrative Dermatology',
      authorImg: 'https://images.unsplash.com/photo-1594824813629-9e875df0709a?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 22, 2026 • Clinical Dermatology Board',
      image: 'assets/images/treatment-skin-psoriasis.jpg',
      imageAlt: 'Natural homeopathic skin soothing therapy with herbal tinctures and gentle care',
      authorBio: 'Specializes in recalcitrant atopic eczema, psoriasis, and pediatric dermatological disorders through deep-acting constitutional potencies.',
      lead: 'Psoriasis is not merely a superficial epidermal malfunction; it is an immune-mediated signal of accelerated cellular turnover. Classical constitutional homeopathy addresses the deeper metabolic and emotional triggers, restoring normal skin maturation without immunosuppressive biologics.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Understanding the Autoimmune Dynamics of Psoriasis</h3>
        <p class="text-secondary">
          In healthy skin, epidermal keratinocytes mature and shed over approximately 28 to 30 days. In plaque psoriasis, hyperactive T-lymphocytes accelerate this turnover cycle to just 3 to 4 days, resulting in silvery, thick, erythematous plaques on extensor surfaces such as elbows, knees, and scalp.
        </p>
        <p class="text-secondary">
          Conventional biologics and coal tar preparations suppress this accelerated turnover, yet when discontinued, rebound exacerbations are commonplace. Classical homeopathy works to calm the systemic immune hyper-drive at its biological source.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Skin symptoms are the outward mirror of internal metabolic and vital equilibrium. Heal the foundation, and the dermal barrier restores itself."
          </p>
          <small class="fw-bold text-success">— Dr. Chloe Laurent, Clinical Dermatology Group</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Constitutional Remedies for Psoriatic Plaques</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Arsenicum Album &amp; Petroleum</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Dry, scaly, silvery plaques worse in cold, damp winter conditions.</li>
                <li>Intense burning relieved temporarily by warm applications.</li>
                <li>Deep fissures and painful cracking along finger tips and knuckles.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Sepia &amp; Graphites</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Circinate, rounded plaques around the flexures and hairline.</li>
                <li>Associated with hormonal shifts, postpartum periods, or chronic fatigue.</li>
                <li>Rough, thickened skin with slow healing and tendency to lichenification.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Integrated Barrier Recovery and Lifestyle Care</h3>
        <p class="text-secondary">
          Alongside constitutional remedies, our protocol incorporates pure calendula and hypericum compresses, anti-inflammatory omega fatty acid optimization, and mindful stress reduction to promote deep, sustained remission.
        </p>
      `,
      relatedIds: ['2', '10']
    },
    '10': {
      id: '10',
      title: 'Hormonal & Adult Acne: The Gentle Path to Clear, Radiant Skin',
      shortTitle: 'Hormonal & Adult Acne Relief',
      category: 'Skin & Dermatology',
      categorySlug: 'skin',
      readTime: '5 min read',
      author: 'Dr. Marcus Bennett, BHMS, CCH',
      authorRole: 'BHMS, CCH, Clinical Facial Dermatology & Endocrine Health',
      authorImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 14, 2026 • Integrative Dermatology Panel',
      image: 'assets/images/treatment-skin-clear-healing.jpg',
      imageAlt: 'Radiant, healthy clear skin and natural botanical remedies',
      authorBio: 'Over 15 years of clinical practice specializing in persistent adult cystic acne, hormonal clearance, and constitutional vitality.',
      lead: 'Persistent adult acne and cystic flare-ups along the jawline are direct messengers of endocrine imbalance, liver clearance sluggishness, and systemic lymphatic overload. Discover how classical homeopathy clears chronic acne gently from the inside out without antibiotics or harsh retinoids.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Why Topical Treatments Frequently Fail Adult Acne</h3>
        <p class="text-secondary">
          Aggressive benzoyl peroxide washes, synthetic retinoids, and oral antibiotics treat the skin as an enemy to be sterilized and dried out. In reality, persistent adult acne—particularly cystic lesions around the chin, jawline, and neck—is driven by androgen receptor sensitivity, impaired hepatic estrogen conjugation, and digestive dysbiosis.
        </p>
        <p class="text-secondary">
          By stimulating physiological lymphatic drainage and regulating hormonal receptor sensitivity, homeopathy supports genuine cellular clearance rather than cosmetic suppression.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Acne is never a surface deficiency of antibacterial chemicals. It is a sign of internal metabolic congestion seeking a physiological exit."
          </p>
          <small class="fw-bold text-success">— Dr. Marcus Bennett, Integrative Dermatology Studies</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Key Homeopathic Remedies for Clear Dermal Vitality</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Berberis Aquifolium &amp; Pulsatilla</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Known as the premier homeopathic skin tonic for clearing blotchy, congested complexions.</li>
                <li>Cyclical pre-menstrual acne flare-ups in mild, sensitive constitutions.</li>
                <li>Aids post-inflammatory hyperpigmentation and clears lingering red marks.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Hepar Sulph &amp; Silicea</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Deep, painful cystic bumps that are intensely sensitive to the lightest touch.</li>
                <li>Promotes rapid, sterile reabsorption and prevents pitted scarring.</li>
                <li>Excellence in constitutions prone to slow healing and skin hypersensitivity.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Gentle Holistic Skin Protocol</h3>
        <p class="text-secondary">
          We combine individualized constitutional potencies with mild botanical cleansers, chamomile mists, and a balanced whole-food diet low in refined inflammatory sugars to nourish the natural dermal lipid barrier and ensure lasting clarity.
        </p>
      `,
      relatedIds: ['2', '9']
    },
    '11': {
      id: '11',
      title: 'Overcoming Chronic Fatigue & Fibromyalgia: The Miasmatic Roadmap to Vitality',
      shortTitle: 'Chronic Fatigue & Fibromyalgia',
      category: 'Chronic Care & Immunology',
      categorySlug: 'chronic',
      readTime: '7 min read',
      author: 'Dr. Evelyn Hartmann, MD (Hom), PhD',
      authorRole: 'MD (Hom), PhD, Miasmatic Immunology & Chronic Care Specialist',
      authorImg: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on August 20, 2026 • Chronic Care Board',
      image: 'assets/images/treatment-chronic-constitutional.jpg',
      imageAlt: 'Classical homeopathic repertory case taking and potentized remedies',
      authorBio: 'Pioneering researcher in post-viral exhaustion syndromes, mitochondrial restoration, and miasmatic immunology.',
      lead: 'Chronic fatigue syndrome (ME/CFS) and fibromyalgia are not phantom conditions; they are profound states of vital force depletion and neuro-inflammatory hypersensitivity. Classical homeopathy restores cellular vitality at the foundational miasmatic level.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Beyond Symptom Suppression: Revitalizing the Cellular Core</h3>
        <p class="text-secondary">
          Patients suffering from chronic fatigue or fibromyalgia are frequently told that their routine laboratory bloodwork is "unremarkable," yet they experience debilitating post-exertional malaise, unrefreshing sleep, and wandering myofascial pain.
        </p>
        <p class="text-secondary">
          Conventional prescriptions of antidepressants or synthetic stimulants mask the exhaustion while driving mitochondrial exhaustion deeper. In classical homeopathy, we view chronic fatigue as an energetic block in the vital force—often seeded by an unresolved viral infection, prolonged grief, or severe metabolic overextension.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "When the vital dynamis is exhausted, stimulating it with caffeine or chemicals is like whipping an overworked horse. What the body cries out for is gentle constitutional nourishment."
          </p>
          <small class="fw-bold text-success">— Dr. Evelyn Hartmann, Senior Physician at AuraPure</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Key Constitutional Remedies for Deep Vital Depletion</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Carbo Vegetabilis &amp; Phosphoric Acid</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Known classically as the 'great restorer' for collapsed vital energy following acute illness.</li>
                <li>Profound mental and physical apathy with brain fog and sensation of heaviness in limbs.</li>
                <li>Air hunger, sluggish venous circulation, and digestive bloating.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Kali Phosphoricum &amp; Arnica</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Nerve nutrient remedy for intellectual exhaustion, nervous insomnia, and muscle aches.</li>
                <li>Bruised, sore, tender-to-touch feeling throughout the spine and soft tissues.</li>
                <li>Restores restorative deep-wave sleep and stabilizes emotional resilience.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">The Path to Sustained Recovery</h3>
        <p class="text-secondary">
          Through serialized potency pacing, patients gradually witness their energy reserve expanding. Daily tasks no longer trigger multi-day crashes, restorative sleep returns, and the body's self-healing mechanisms re-engage with quiet confidence.
        </p>
      `,
      relatedIds: ['1', '8']
    },
    '12': {
      id: '12',
      title: 'Irritable Bowel Syndrome & The Gut-Brain Axis: Calming Visceral Hypersensitivity',
      shortTitle: 'IBS & The Gut-Brain Axis',
      category: 'Digestive Health',
      categorySlug: 'digestive',
      readTime: '6 min read',
      author: 'Dr. Tobias Lindqvist, LCH',
      authorRole: 'LCH, Dip. Hom, Enteric Homeopathy & Visceral Motility Specialist',
      authorImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 02, 2026 • Digestive Health Forum',
      image: 'assets/images/treatment-digestive-ibs.jpg',
      imageAlt: 'Woman experiencing peaceful digestive comfort and abdominal relief with herbal tea and natural homeopathic remedy',
      authorBio: 'Focuses on autonomic enteric regulation, irritable bowel syndrome, and stress-induced visceral hyperalgesia.',
      lead: 'Visceral hypersensitivity, chronic abdominal cramping, and erratic bowel habits are deeply tied to autonomic nervous system tension. Classical constitutional remedies soothe the enteric nervous system, breaking the vicious cycle of gut-brain stress and restoring calm, predictable digestion.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Enteric Nervous System: The Body's Second Brain</h3>
        <p class="text-secondary">
          With more than 500 million neurons lining the gastrointestinal tract, the gut produces over 90% of the body's serotonin. In patients with Irritable Bowel Syndrome (IBS), stress and emotional tension translate almost immediately into smooth muscle spasms, visceral hyperalgesia, and fluctuating motility.
        </p>
        <p class="text-secondary">
          Conventional antispasmodics and laxatives merely attempt to force motility in one direction or deaden muscular receptors. Classical homeopathy approaches IBS as a systemic neuro-vegetative dysregulation, seeking out the individual constitutional pattern that triggers enteric hyper-reactivity.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "The gut does not ache in isolation; it mirrors the inner tension of the mind. By easing the vital hypersensitivity, the digestive tract naturally regains its innate rhythm."
          </p>
          <small class="fw-bold text-success">— Dr. Tobias Lindqvist, Enteric Homeopathy Specialist</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Targeted Remedies for Spasmodic Pain &amp; Nervous Digestion</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Colocynthis &amp; Magnesia Phosphorica</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Violent, cutting abdominal cramping that forces the patient to bend double.</li>
                <li>Dramatic relief from firm hard pressure, warm compresses, and hot sips of water.</li>
                <li>Spasmodic colicky pain triggered or aggravated by sudden emotional distress or vexation.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Argentum Nitricum &amp; Lycopodium</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Anticipatory anxiety leading immediately to urgent diarrhea before events or travel.</li>
                <li>Sensations of immense abdominal distension, loud rumbling, and excessive flatulence.</li>
                <li>Craving for sweets and warm drinks, even though sweets worsen bloating and gas.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Restoring Rhythmic Peristalsis</h3>
        <p class="text-secondary">
          Through serialized potency pacing, the enteric nervous system desensitizes. Patients experience a gradual easing of visceral hypersensitivity, normal bowel regularity without reliance on laxatives, and the freedom to enjoy wholesome meals without fear of sudden flare-ups.
        </p>
      `,
      relatedIds: ['7', '13']
    },
    '13': {
      id: '13',
      title: 'Microbiome Restoration & Chronic Bloating: The Classical Approach to Gut Dysbiosis',
      shortTitle: 'Microbiome & Bloating Recovery',
      category: 'Digestive Health',
      categorySlug: 'digestive',
      readTime: '6 min read',
      author: 'Dr. Serena Patel, MD (Hom), MSc (Nutr)',
      authorRole: 'MD (Hom), MSc (Nutr), Functional Microbiome & Gut Rehabilitation Specialist',
      authorImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on September 05, 2026 • Integrative Gut Science',
      image: 'assets/images/treatment-digestive-microbiome.jpg',
      imageAlt: 'Authentic homeopathic dispensary workspace with mortar, pestle, herbs, Nux Vomica and Lycopodium remedies, and case records',
      authorBio: 'Expert in gut microbial ecology, functional motility rehabilitation, and gentle constitutional therapeutics.',
      lead: 'Small intestinal bacterial overgrowth (SIBO), post-meal fermentation, and lingering food intolerances are rarely cured by probiotics alone. Classical homeopathy restores healthy digestive secretions, bile flow, and migrating motor complex (MMC) motility to permanently rebalance gut flora.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Beyond Probiotic Overload: Restoring the Microbiome Soil</h3>
        <p class="text-secondary">
          When patients suffer from persistent bloating, gas, and food sensitivities, the standard modern reflex is to consume high-dose multi-strain probiotics. Yet in many cases—particularly with SIBO—dumping billions of foreign bacterial colonies into a sluggish digestive tract only accelerates fermentation, exacerbating bloating and brain fog.
        </p>
        <p class="text-secondary">
          Healthy intestinal flora depend on adequate hydrochloric acid, proper biliary excretion, and regular cleansing waves of the migrating motor complex (MMC). When constitutional remedies restore these upstream digestive secretions, the gut microbiome self-regulates naturally.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "You cannot cultivate a lush garden by tossing seeds onto barren soil. Homeopathy enriches the internal terrain so beneficial gut ecology flourishes on its own."
          </p>
          <small class="fw-bold text-success">— Dr. Serena Patel, MD (Hom), MSc (Nutr)</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Constitutional Remedies for Fermentation &amp; Dysbiosis</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Nux Vomica &amp; Pulsatilla</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Toxic post-meal fullness, constant ineffectual urging, and morning sluggishness.</li>
                <li>Aggravation from rich, fatty, creamy foods, with dryness of mouth and desire for open fresh air.</li>
                <li>Re-establishes healthy hepatic detoxification and gastric motor reflexes.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">China Officinalis &amp; Carbo Vegetabilis</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Entire abdomen feels packed tight with fermentation gas; belching provides no lasting relief.</li>
                <li>Post-infectious intestinal dysbiosis following food poisoning or courses of broad-spectrum antibiotics.</li>
                <li>Relieves cold clamminess, lethargy, and intestinal mucosa permeability.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">A Personalized Roadmap to Food Freedom</h3>
        <p class="text-secondary">
          Coupled with gentle whole-food prebiotic nutrition and mindful meal pacing, constitutional homeopathic care restores digestive resilience so patients can gradually reintroduce diverse nutrient-dense foods without discomfort.
        </p>
      `,
      relatedIds: ['7', '12']
    },
    '14': {
      id: '14',
      title: 'Gentle Infant & Toddler Care: Soothing Teething Distress, Colic & Sleep Disturbances',
      shortTitle: 'Infant Teething & Colic Relief',
      category: 'Pediatric Care',
      categorySlug: 'pediatric',
      readTime: '5 min read',
      author: 'Dr. Hannah Whitmore, D.H.M.S., CCH',
      authorRole: 'D.H.M.S., CCH, Neonatal & Infant Care Homeopath',
      authorImg: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on October 04, 2026 • Pediatric Wellness Circle',
      image: 'assets/images/treatment-pediatric-infant.jpg',
      imageAlt: 'Loving mother holding baby in gentle consultation with female pediatric homeopath offering Chamomilla remedy',
      authorBio: 'Dedicated to gentle holistic pediatric care, neonatal comfort, and supporting maternal-infant emotional bonds through natural therapeutics.',
      lead: 'Infancy is characterized by rapid neurological maturation, making babies especially sensitive to teething inflammation, gastric spasms, and sleep disruptions. Classical pediatric homeopathy provides swift, non-toxic comfort without sedatives or synthetic numbing gels.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Sensitivity of the Developing Infant Organism</h3>
        <p class="text-secondary">
          An infant's nervous and digestive systems are undergoing exponential development. When teething arrives or gut flora shifts, symptoms often manifest intensely: red-cheeked crying fits, colicky knee-pulling, and sleepless nights that exhaust the entire family.
        </p>
        <p class="text-secondary">
          Conventional pain relievers like acetaminophen or ibuprofen burden the young immature liver and kidneys. Homeopathic micro-doses operate on the child's vital regulatory mechanism, initiating swift physiological relaxation without chemical sedation.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "A crying, teething infant does not require heavy numbing agents. Nature provided gentle plant potencies that soothe irritation within minutes, restoring smiles and peaceful sleep."
          </p>
          <small class="fw-bold text-success">— Dr. Hannah Whitmore, D.H.M.S., CCH</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Cornerstone Remedies for Infant &amp; Toddler Comfort</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Chamomilla &amp; Belladonna</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>One cheek hot and flushed, the other pale; intense irritability where the child demands to be carried constantly.</li>
                <li>Sudden high febrile spikes with radiant hot head, glassy eyes, and throbbing restlessness.</li>
                <li>Incomparable remedy for acutely inflamed gums and irritable teething tantrums.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Colocynthis &amp; Pulsatilla</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Infant bends double or pulls knees tightly up to chest to relieve severe gas pains and griping.</li>
                <li>Clingy, tearful toddler who wants constant cuddles, worse in stuffy rooms and improved in fresh air.</li>
                <li>Swift relief for evening colic attacks occurring like clockwork after feeding.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Peace of Mind for Loving Parents</h3>
        <p class="text-secondary">
          Dissolved effortlessly in a teaspoon of warm breastmilk or purified water, these sweet remedies make administration completely stress-free. Parents enjoy total peace of mind knowing their little ones are receiving clean, side-effect-free comfort that respects their developing bodies.
        </p>
      `,
      relatedIds: ['3', '15']
    },
    '15': {
      id: '15',
      title: 'Childhood Allergies & Respiratory Resilience: Strengthening the Young Vital Force',
      shortTitle: 'Childhood Allergy Resilience',
      category: 'Pediatric Care',
      categorySlug: 'pediatric',
      readTime: '5 min read',
      author: 'Dr. Daniel Cavanaugh, BHMS',
      authorRole: 'BHMS, Pediatric Allergies & Chronic Upper Respiratory Specialist',
      authorImg: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on October 10, 2026 • Pediatric Care Group',
      image: 'assets/images/treatment-pediatric-immunity.jpg',
      imageAlt: 'Joyful smiling schoolboy in pediatric consultation room with caring doctor, wellness book, and Calcarea Carb remedy',
      authorBio: 'Renowned for gentle, non-invasive pediatric interventions that eliminate recurring ENT infections, allergies, and childhood immune deficiencies.',
      lead: 'Recurrent seasonal allergic rhinitis, wheezing, and chronic adenoid hypertrophy during early school years are signals of an over-reactive, hyper-sensitized juvenile immune system. Constitutional homeopathic remedies desensitize mucosal membranes and establish lasting immune equilibrium.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Why Children Outgrow Allergies Faster with Homeopathy</h3>
        <p class="text-secondary">
          Standard pediatric management often relies on antihistamine syrups or steroid nasal sprays. While these may temporarily dry a runny nose, they suppress immune expression, frequently driving the inflammatory diathesis deeper into the bronchi as asthma.
        </p>
        <p class="text-secondary">
          Homeopathy instead views allergic hypersensitivity as an uncalibrated immune threshold. By administering constitutional remedies matched to the child’s unique physical and emotional constitution, the immune system learns to tolerate harmless environmental pollen, dust mites, and pet dander.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "A resilient child plays freely in the grass and embraces every season without puffers or drowsy antihistamines. That true constitutional freedom is our clinical goal."
          </p>
          <small class="fw-bold text-success">— Dr. Daniel Cavanaugh, BHMS</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Constitutional Remedies for Young Respiratory Vitality</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Calcarea Carbonica &amp; Silicea</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Chronic swollen lymph glands, recurring head colds from cold damp weather, and profuse night head-sweats.</li>
                <li>Silicea resolves chronic non-draining ear effusion, blocked Eustachian tubes, and low stamina.</li>
                <li>Fortifies mucosal resistance and accelerates natural recovery between colds.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Allium Cepa &amp; Euphrasia</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Acrid, excoriating nasal discharge with bland tearing eyes and violent paroxysmal sneezing.</li>
                <li>Bland nasal discharge accompanied by burning, acrid lacrimation and photo-sensitivity.</li>
                <li>Provides rapid comfort during peak springtime pollen and grass exposures.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Nurturing Lifelong Robust Health</h3>
        <p class="text-secondary">
          When addressed early in childhood, constitutional homeopathy rewires immune reactivity, preventing chronic adult allergies and setting the foundation for robust, joyful lifelong health.
        </p>
      `,
      relatedIds: ['3', '14']
    },
    '16': {
      id: '16',
      title: 'Chronic Asthma & Bronchial Spasms: Constitutional Approaches to Deep Lung Vitality',
      shortTitle: 'Asthma & Bronchial Vitality',
      category: 'Respiratory Care',
      categorySlug: 'respiratory',
      readTime: '6 min read',
      author: 'Dr. Robert MacIntyre, MD (Hom), FCCP (Hon)',
      authorRole: 'MD (Hom), FCCP (Hon), Pulmonary Vitality & Chronic Bronchial Care',
      authorImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on October 18, 2026 • Pulmonary Care Society',
      image: 'assets/images/treatment-respiratory-asthma.jpg',
      imageAlt: 'Man breathing freely and deeply in clinical wellness room with homeopathic respiratory remedies',
      authorBio: 'Clinical authority on seasonal desensitization protocols, allergic asthma, and non-drowsy natural allergy modulation.',
      lead: 'Bronchial asthma is not merely a constriction of airway smooth muscle; it is a systemic expression of autonomic dysregulation, cold-air hypersensitivity, and repressed vital energy. Classical constitutional remedies widen airway diameter and reduce bronchial hyper-responsiveness safely without steroid dependence.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Beyond Inhaler Dependency: Expanding Baseline Lung Capacity</h3>
        <p class="text-secondary">
          While rescue bronchodilators provide vital acute symptom management, repetitive reliance on synthetic beta-agonists can desensitize airway receptors and fail to prevent nocturnal exacerbations.
        </p>
        <p class="text-secondary">
          In classical homeopathy, our objective is to heal the hyper-reactive terrain. By prescribing the simillimum that matches the patient\\'s unique modality triggers—whether aggravated by cold damp air, midnight paroxysms, or exertion—the lungs progressively regain flexible elastic recoil.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "True respiratory health is not about suppressing a wheeze; it is about freeing the vital breath so every alveolar cell oxygenates with effortless ease."
          </p>
          <small class="fw-bold text-success">— Dr. Robert MacIntyre, MD (Hom)</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Cornerstone Remedies for Bronchial Spasms &amp; Dyspnea</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Arsenicum Album &amp; Ipecacuanha</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Severe nocturnal asthma attacks occurring between midnight and 2:00 AM, forcing the patient to sit bent forward.</li>
                <li>Persistent spasmodic constriction with relentless nausea, loose rattling mucus in the chest that cannot be expectorated.</li>
                <li>Relief from sipping warm liquids and warm room air.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Natrum Sulphuricum &amp; Blatta Orientalis</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Humid asthma triggered by damp basements, rainy weather, or sea fog; morning diarrhea with lung congestion.</li>
                <li>Suffocative cough with thick yellow expectoration and soreness in the lower left chest.</li>
                <li>Quick relief for acute bronchial swelling from dust and mold exposures.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Restoring Deep Unconstrained Breathing</h3>
        <p class="text-secondary">
          Through serialized constitutional potencies, patients observe their frequency of inhaler usage steadily tapering down. Physical stamina increases, night-time waking ceases, and deep diaphragmatic breath flows freely.
        </p>
      `,
      relatedIds: ['5', '17']
    },
    '17': {
      id: '17',
      title: 'Overcoming Chronic Sinusitis & Nasal Polyps: Clearing Airways from Within',
      shortTitle: 'Chronic Sinusitis & Polyps',
      category: 'Respiratory Care',
      categorySlug: 'respiratory',
      readTime: '5 min read',
      author: 'Dr. Fiona Gallagher, ND, CCH',
      authorRole: 'ND, CCH, Mucosal Regeneration & Non-Invasive ENT Specialist',
      authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on October 24, 2026 • Integrative ENT Forum',
      image: 'assets/images/treatment-respiratory-sinus.jpg',
      imageAlt: 'Apothecary table with steaming herbal sinus inhalation bowl, Kali Bich and Pulsatilla remedies, and case records',
      authorBio: 'Expert in mucosal regeneration, lymphatic drainage, and non-invasive homeopathic ENT management.',
      lead: 'Chronic frontal headaches, post-nasal drip, loss of smell, and recurring sinus infections persist because standard decongestant sprays cause rebound mucosal hypertrophy. Classical homeopathy re-establishes natural sinus ostia drainage and dissolves mucosal swelling permanently.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Sinus Drainage Pathways: Restoring Natural Ciliary Function</h3>
        <p class="text-secondary">
          The paranasal sinuses are lined with microscopic cilia that sweep protective mucus toward the nasal cavities. Chronic inflammation causes mucosal hypertrophy, effectively locking the narrow drainage ostia and creating stagnant pockets where bacterial and fungal biofilms thrive.
        </p>
        <p class="text-secondary">
          Conventional surgical polypectomies frequently see recurrences because the underlying miasmatic congestion remains untreated. Homeopathic medicines activate natural lymphatic drainage and mucosal resorption without surgical intervention.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "When the ostia drain freely and mucosal cilia oscillate with natural rhythm, chronic sinus pressure and facial heaviness dissolve spontaneously."
          </p>
          <small class="fw-bold text-success">— Dr. Fiona Gallagher, ND, CCH</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Targeted Remedies for Stubborn Sinus Pressure &amp; Polyps</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Kali Bichromicum &amp; Pulsatilla</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Tenacious, ropy, stringy yellow-green discharges; severe pain localized to a small spot at the root of the nose.</li>
                <li>Thick, bland yellowish-green discharge with loss of taste and smell; worse in warm stuffy rooms, better in cool fresh air.</li>
                <li>Rapidly decongests blocked ethmoid and frontal sinus sinuses.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Silicea &amp; Teucrium Marum Teucrium</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Specific affinity for clearing chronic post-nasal drip, sinus fistulae, and indurated glands.</li>
                <li>Specific classical remedy for benign nasal polyps with chronic obstruction and loss of olfactory sensation.</li>
                <li>Fortifies mucosal barrier against recurring winter viral infections.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Long-Term Freedom from Sinus Pressure</h3>
        <p class="text-secondary">
          Combined with gentle saline lavages and anti-inflammatory nutrition, constitutional homeopathic care eradicates stubborn sinus inflammation, restoring clear unobstructed nasal airflow and revitalizing restful sleep.
        </p>
      `,
      relatedIds: ['5', '16']
    },
    '18': {
      id: '18',
      title: 'Gentle Homeopathy for Pregnancy & Postpartum Vitality: Safe Maternal Care',
      shortTitle: 'Pregnancy & Postpartum Care',
      category: 'Women\'s Health',
      categorySlug: 'women',
      readTime: '6 min read',
      author: 'Dr. Miriam Rosencrantz, MD (Obstetrics & Hom)',
      authorRole: 'MD (Obstetrics & Hom), Perinatal & Maternal Wellness Specialist',
      authorImg: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on November 02, 2026 • Maternal Health Forum',
      image: 'assets/images/treatment-womens-prenatal.jpg',
      imageAlt: 'Pregnant woman in gentle clinical consultation with female obstetric homeopath with Sepia remedy',
      authorBio: 'Over 18 years guiding women through prenatal vitality, labor preparation, and serene postpartum recovery.',
      lead: 'Pregnancy is a state of accelerated physiological transformation. From persistent morning nausea and pelvic ligament relaxation to postpartum emotional baby blues, classical homeopathy provides safe, potentized, toxin-free remedies that nurture both mother and developing baby.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Safe, Non-Toxic Therapeutics During Gestation</h3>
        <p class="text-secondary">
          Expecting mothers are rightfully cautious about pharmaceutical interventions during pregnancy and lactation. Because homeopathic medicines are prepared through serialized micro-dilutions, they carry zero chemical toxicity, teratogenic risk, or organ burden.
        </p>
        <p class="text-secondary">
          Instead of suppressing symptoms, constitutional care fortifies maternal vitality, resolves hyperemesis gravidarum, aligns uterine tonicity for gentle delivery, and supports emotional equilibrium during the tender fourth trimester.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Caring for an expectant mother with homeopathy is a profound privilege. When the mother\\'s vital force is serene and nourished, the unborn child flourishes in gentle harmony."
          </p>
          <small class="fw-bold text-success">— Dr. Miriam Rosencrantz, MD (Obstetrics & Hom)</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Remedies for Morning Sickness, Labor Prep &amp; Postnatal Healing</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Sepia &amp; Ipecacuanha</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Nausea provoked by the smell or thought of food; empty sinking feeling in the pit of the stomach.</li>
                <li>Persistent continuous nausea with a clean tongue, not relieved even by vomiting.</li>
                <li>Eases postpartum fatigue, pelvic heaviness, and emotional baby blues.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Caulophyllum &amp; Arnica Montana</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Strengthens coordinated uterine contractions and softens a rigid cervix during labor.</li>
                <li>Incomparable trauma remedy following childbirth to resolve pelvic soreness and perineal bruising.</li>
                <li>Supports healthy breast milk flow and accelerates postpartum tissue repair.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Nurturing the Maternal-Infant Bond</h3>
        <p class="text-secondary">
          With balanced hormones and rapid physical recovery, new mothers can focus entirely on bonding with their newborn, secure in the knowledge that natural constitutional care supports every step of maternal wellness.
        </p>
      `,
      relatedIds: ['6', '19']
    },
    '19': {
      id: '19',
      title: 'Endometriosis & Pelvic Pain Recovery: Natural Endocrine Balance from Within',
      shortTitle: 'Endometriosis & Pelvic Pain',
      category: 'Women\'s Health',
      categorySlug: 'women',
      readTime: '6 min read',
      author: 'Dr. Clara Eisenberg, BHMS, Dip. Gynaecology',
      authorRole: 'BHMS, Dip. Gynaecology, Pelvic Endocrinology & Ovarian Health',
      authorImg: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on November 08, 2026 • Integrative Gynecological Studies',
      image: 'assets/images/treatment-womens-hormone.jpg',
      imageAlt: 'Homeopathic apothecary setup for female endocrine balance with Lachesis and Pulsatilla remedies',
      authorBio: 'Clinical leader in natural endometriosis management, pelvic circulation optimization, and pain-free menstrual cycle restoration.',
      lead: 'Debilitating dysmenorrhea, cyclic pelvic pain, and endometrial tissue proliferation are rooted in estrogen dominance, hepatic clearance stagnation, and pelvic venous congestion. Classical constitutional homeopathy addresses the underlying terrain to soothe inflammation and restore pain-free cycles.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">Understanding Pelvic Stagnation &amp; Estrogen Dominance</h3>
        <p class="text-secondary">
          Endometriosis is an estrogen-fueled, neuro-inflammatory condition where endometrial-like implants trigger pelvic adhesions, severe cramping, and chronic exhaustion. Conventional options—surgical ablation or medical menopause via GnRH agonists—frequently offer temporary relief accompanied by severe side effects.
        </p>
        <p class="text-secondary">
          Classical homeopathy approaches pelvic pathology by resolving venous engorgement, optimizing liver clearance of excess xenoestrogens, and calming localized prostaglandin synthesis.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Painful periods are not an inevitable female burden; they are a sign of internal stasis. Homeopathy dissolves the congestion so the menstrual cycle flows as nature intended."
          </p>
          <small class="fw-bold text-success">— Dr. Clara Eisenberg, BHMS</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Key Constitutional Remedies for Endometriosis &amp; Dysmenorrhea</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Lachesis Mutus &amp; Sabina</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Severe left-sided ovarian pain; dramatic relief as soon as menstrual flow begins.</li>
                <li>Violent bearing down and paroxysmal pain extending from sacrum to pubes with heavy clots.</li>
                <li>Relieves vascular pelvic engorgement and intolerance to tight waistbands.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Magnesia Phosphorica &amp; Cimicifuga</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Severe colicky pelvic cramping relieved by warmth, hot water bottles, and bending double.</li>
                <li>Wandering uterine and ovarian neuralgias shooting across the pelvis and down thighs.</li>
                <li>Dispels premenstrual gloom, irritability, and muscular tension.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">A Gentle Long-Term Path to Pain-Free Living</h3>
        <p class="text-secondary">
          Over 3 to 6 cycles of personalized constitutional care, patients witness a dramatic reduction in menstrual pain, elimination of reliance on NSAIDs, and a return of peaceful, regular, predictable cycles.
        </p>
      `,
      relatedIds: ['6', '18']
    },
    '20': {
      id: '20',
      title: 'Circadian Alignment & Restorative Sleep: Resetting the Biological Clock with Homeopathy',
      shortTitle: 'Circadian Alignment & Sleep',
      category: 'Holistic Lifestyle & Wellness',
      categorySlug: 'wellness',
      readTime: '6 min read',
      author: 'Dr. Liam Gallagher, MD (Hom)',
      authorRole: 'MD (Hom), Chronobiology & Natural Sleep Medicine Specialist',
      authorImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on November 15, 2026 • Sleep & Circadian Medicine',
      image: 'assets/images/treatment-holistic-sleep.jpg',
      imageAlt: 'Cozy bedtime setting with woman in linen bedding enjoying herbal infusion, Passiflora remedy, and lavender',
      authorBio: 'Pioneering research into circadian chronobiology, autonomic regulation, and constitutional remedies for sleep disorders.',
      lead: 'Chronic insomnia, fragmented sleep, and morning unrefreshing fatigue stem from disrupted circadian rhythmicity and evening cortisol spikes. Rather than chemically sedating the cortex, classical homeopathy gently balances neuro-endocrine feedback loops, allowing deep slow-wave delta sleep to return naturally.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Neuro-Biology of True Restorative Sleep</h3>
        <p class="text-secondary">
          Sleep is not merely the cessation of conscious activity; it is an active metabolic maintenance cycle where the brain\\'s glymphatic system clears neurotoxic waste products and cellular mitochondria regenerate.
        </p>
        <p class="text-secondary">
          Prescription hypnotic sedatives suppress rapid eye movement (REM) and slow-wave delta sleep, creating an artificial blackout that leaves individuals groggy and unrefreshed. Classical homeopathy quenches hyperactive autonomic tone without chemical grogginess or physiological dependency.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Sedatives force the nervous system into a coma; homeopathy invites the natural rhythm of peaceful twilight rest. True healing happens only in natural delta sleep."
          </p>
          <small class="fw-bold text-success">— Dr. Liam Gallagher, Sleep &amp; Circadian Medicine</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Homeopathic Remedies for an Overactive Evening Mind</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Coffea Cruda &amp; Passiflora Incarnata</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Mind flooded with rapid ideas, excessive joy, or racing thoughts preventing sleep onset.</li>
                <li>Hyperacute hearing and sensory hypersensitivity where every distant noise startles awake.</li>
                <li>Passiflora mother tincture quietens restless physical fidgeting and visceral nervous spasms.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Kali Phosphoricum &amp; Cocculus Indicus</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Profound mental exhaustion from prolonged intellectual work, grief, or caregiving burnout.</li>
                <li>Insomnia caused by night shifts or nursing sick family members; waking with dizziness and brain fog.</li>
                <li>Re-establishes cellular vitality and restful neurological parasympathetic tone.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Creating an Evening Wind-Down Sanctuary</h3>
        <p class="text-secondary">
          Combined with digital screen curfews, warm herbal infusions, and room darkening, constitutional care permanently retrains the pineal gland, transforming bedtime into a cherished sanctuary of peace.
        </p>
      `,
      relatedIds: ['4', '21']
    },
    '21': {
      id: '21',
      title: 'Cellular Vitality & Adaptogenic Nutrition: The Foundations of Mindful Daily Living',
      shortTitle: 'Cellular Vitality & Daily Living',
      category: 'Holistic Lifestyle & Wellness',
      categorySlug: 'wellness',
      readTime: '5 min read',
      author: 'Dr. Genevieve Dupont, ND, D.H.M.S.',
      authorRole: 'ND, D.H.M.S., Cellular Nutrition & Biochemic Tissue Salt Specialist',
      authorImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      publishDate: 'Published on November 22, 2026 • Integrative Lifestyle Journal',
      image: 'assets/images/treatment-holistic-vitality.jpg',
      imageAlt: 'Sunlit kitchen table with infused fruit water, fresh berries, Avena Sativa and Kali Phos remedies, and daily vitality journal',
      authorBio: 'Specializes in cellular energy recovery, Schüssler biochemic mineral salts, and whole-body lifestyle medicine.',
      lead: 'Real vitality is not built on temporary stimulants or synthetic multivitamins; it thrives on cellular hydration, micro-nutrient assimilation, and harmonious autonomic tone. Discover how combining biochemic tissue salts with mindful daily rhythms nurtures enduring life force and mental clarity.',
      contentHtml: `
        <h3 class="fw-bold mt-4 mb-3">The Vital Dynamics of Daily Living</h3>
        <p class="text-secondary">
          Modern existence often resembles a relentless sprint that drains vitality reserves faster than the body can replenish them. Artificial energy drinks and refined sugars borrow energy from tomorrow, plunging cellular mitochondria into deeper chronic exhaustion.
        </p>
        <p class="text-secondary">
          In the homeopathic philosophy of Dr. Samuel Hahnemann, the "Vital Force" requires harmonious physical support: live enzymatic hydration, seasonal mineral-dense nutrition, and micro-dose mineral biochemic salts that facilitate cellular membrane transport.
        </p>

        <div class="card-wellness border-start border-4 border-success my-4 p-4" style="background-color: var(--bg-surface-secondary);">
          <i class="bi bi-quote fs-2 text-success"></i>
          <p class="fs-5 fst-italic text-primary mb-2">
            "Vitality is not something you purchase in a bottle of caffeine; it is the natural radiance of cellular harmony, clean hydration, and emotional serenity."
          </p>
          <small class="fw-bold text-success">— Dr. Genevieve Dupont, ND, D.H.M.S.</small>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Biochemic Tissue Salts &amp; Nervous System Tonics</h3>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Avena Sativa &amp; Kali Phosphoricum 6X</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Nutritive nerve restorative derived from organic green oats to soothe nervous depletion.</li>
                <li>Key brain and nerve mineral salt that clears mental fatigue, brain fog, and low motivation.</li>
                <li>Revitalizes neuromuscular stamina without heart palpitations or spikes in blood pressure.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 border rounded-3 bg-body-tertiary h-100">
              <h6 class="fw-bold text-success mb-1">Ferrum Phos &amp; Magnesia Phos 6X</h6>
              <ul class="small text-secondary ps-3 mb-0">
                <li>Oxygen-carrier cell salt supporting red blood cell hemoglobin and daily vitality.</li>
                <li>Cellular antispasmodic salt that relieves muscular tightness, neck tension, and tension headaches.</li>
                <li>Ideal micro-nutrition for active professionals and holistic athletes.</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 class="fw-bold mt-4 mb-3">Designing a Sustainable Daily Wellness Rhythm</h3>
        <p class="text-secondary">
          By aligning morning sunlight exposure, mindful breathwork, whole-food hydration, and targeted biochemic support, daily wellness transitions from a chore into an uplifting celebration of life.
        </p>
      `,
      relatedIds: ['4', '20']
    }
  };

  function initBlogDetails() {
    const heroTitleEl = document.getElementById('articleHeroTitle');
    if (!heroTitleEl) return; // Not on blog-details.html

    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id') || '1';
    const article = BLOG_ARTICLES_DATA[articleId] || BLOG_ARTICLES_DATA['1'];

    // Update document title
    document.title = `${article.title} | AuraPure Homeopathy Clinic`;

    // Breadcrumb
    const breadcrumbEl = document.getElementById('articleBreadcrumb');
    if (breadcrumbEl) breadcrumbEl.textContent = article.shortTitle;

    // Category Badge & Reading time
    const catBadgeEl = document.getElementById('articleCategoryBadge');
    if (catBadgeEl) catBadgeEl.innerHTML = `<i class="bi bi-tag-fill"></i> ${article.category}`;

    const readTimeEl = document.getElementById('articleReadingTime');
    if (readTimeEl) readTimeEl.textContent = `• ${article.readTime}`;

    // Hero title
    heroTitleEl.textContent = article.title;

    // Author Info in Hero
    const authorImgEl = document.getElementById('articleAuthorImg');
    if (authorImgEl) {
      authorImgEl.src = article.authorImg;
      authorImgEl.alt = article.author;
    }

    const authorNameEl = document.getElementById('articleAuthorName');
    if (authorNameEl) authorNameEl.textContent = article.author;

    const publishDateEl = document.getElementById('articlePublishDate');
    if (publishDateEl) publishDateEl.textContent = article.publishDate;

    // Featured Image
    const featuredImgEl = document.getElementById('articleFeaturedImg');
    if (featuredImgEl) {
      featuredImgEl.src = article.image;
      featuredImgEl.alt = article.imageAlt;
    }

    // Lead paragraph
    const leadEl = document.getElementById('articleLead');
    if (leadEl) leadEl.textContent = article.lead;

    // Body Content
    const bodyContentEl = document.getElementById('articleBodyContent');
    if (bodyContentEl && article.contentHtml) {
      bodyContentEl.innerHTML = article.contentHtml;
    }

    // Author Bio Card at Bottom
    const authorBioImgEl = document.getElementById('authorBioImg');
    if (authorBioImgEl) {
      authorBioImgEl.src = article.authorImg;
      authorBioImgEl.alt = article.author;
    }

    const doctorSimpleName = article.author.split(',')[0];

    const authorBioNameEl = document.getElementById('authorBioName');
    if (authorBioNameEl) authorBioNameEl.textContent = doctorSimpleName;

    const authorBioRoleEl = document.getElementById('authorBioRole');
    if (authorBioRoleEl) authorBioRoleEl.textContent = article.authorRole;

    const authorBioDescEl = document.getElementById('authorBioDesc');
    if (authorBioDescEl) authorBioDescEl.textContent = article.authorBio;

    // Book consultation button
    const consultBtnEl = document.getElementById('articleConsultBtn');
    if (consultBtnEl) {
      consultBtnEl.innerHTML = `<i class="bi bi-calendar-check me-1"></i> Book Consultation with ${doctorSimpleName}`;
    }

    // Related Articles Widget in Sidebar
    const relatedListEl = document.getElementById('sidebarRelatedList');
    if (relatedListEl && article.relatedIds) {
      let relatedHtml = '';
      article.relatedIds.forEach(relId => {
        const rel = BLOG_ARTICLES_DATA[relId];
        if (rel) {
          const dateStr = rel.publishDate.split('•')[0].replace('Published on', '').trim();
          relatedHtml += `
            <a href="blog-details.html?id=${rel.id}" class="sidebar-related-item">
              <img src="${rel.image}" 
                   onerror="this.onerror=null; this.src='assets/images/placeholder.svg'"
                   class="sidebar-related-img" alt="${rel.title}">
              <div>
                <h6 class="sidebar-related-title">${rel.title}</h6>
                <small class="text-muted"><i class="bi bi-calendar3 me-1"></i> ${dateStr}</small>
              </div>
            </a>
          `;
        }
      });
      relatedListEl.innerHTML = relatedHtml;
    }
  }

  initBlogDetails();

  // ==========================================
  // 5. Testimonial Filtering (testimonials.html)
  // ==========================================
  const testimonialFilterBtns = document.querySelectorAll('.testimonial-filter-btn');
  const testimonialItems = document.querySelectorAll('.testimonial-item-col');

  if (testimonialFilterBtns.length > 0) {
    testimonialFilterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        testimonialFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        testimonialItems.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (filter === 'all' || itemCat === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // 6. Interactive Appointment Booking Form
  // ==========================================
  const appointmentForms = document.querySelectorAll('.appointment-form');

  appointmentForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Check form validity
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Book Appointment';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirming Appointment...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Extract submitted data for modal receipt
        const nameVal = form.querySelector('[name="patient_name"]')?.value || 'Valued Patient';
        const emailVal = form.querySelector('[name="patient_email"]')?.value || '';
        const phoneVal = form.querySelector('[name="patient_phone"]')?.value || '';
        const dateVal = form.querySelector('[name="appointment_date"]')?.value || 'Selected Date';
        const timeVal = form.querySelector('[name="appointment_time"]')?.value || 'Selected Time';
        const treatmentVal = form.querySelector('[name="treatment_type"]')?.value || 'General Consultation';
        const doctorVal = form.querySelector('[name="doctor_preference"]')?.value || 'First Available Specialist';

        // Populate receipt modal elements if present
        const receiptModalEl = document.getElementById('appointmentSuccessModal');
        if (receiptModalEl) {
          document.getElementById('receiptName').textContent = nameVal;
          document.getElementById('receiptDate').textContent = dateVal + ' at ' + timeVal;
          document.getElementById('receiptTreatment').textContent = treatmentVal;
          document.getElementById('receiptDoctor').textContent = doctorVal;
          document.getElementById('receiptContact').textContent = phoneVal + ' (' + emailVal + ')';

          const modalInstance = new bootstrap.Modal(receiptModalEl);
          modalInstance.show();
        } else {
          alert(`Thank you, ${nameVal}!\nYour homeopathic consultation for ${treatmentVal} on ${dateVal} (${timeVal}) has been reserved. Our clinical receptionist will contact you shortly at ${phoneVal}.`);
        }

        form.reset();
        form.classList.remove('was-validated');
      }, 700);
    });
  });

  // Set minimum date for appointment date inputs to today
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const todayStr = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.setAttribute('min', todayStr);
    if (!input.value) {
      input.value = todayStr;
    }
  });

  // ==========================================
  // 7. Interactive Newsletter Subscription
  // ==========================================
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        alert(`🌿 Thank you for subscribing to AuraPure Gazette!\nA welcome guide to natural wellness has been sent to ${emailInput.value}.`);
        form.reset();
      }
    });
  });

  // ==========================================
  // 8. Countdown Timer (coming-soon.html)
  // ==========================================
  const countdownEl = document.getElementById('clinicCountdown');
  if (countdownEl) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 28); // 28 days from now

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        countdownEl.innerHTML = '<h3 class="text-success">Now Open & Welcoming Patients!</h3>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const dEl = document.getElementById('countDays');
      const hEl = document.getElementById('countHours');
      const mEl = document.getElementById('countMinutes');
      const sEl = document.getElementById('countSeconds');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ==========================================
  // 9. Back to Top Button
  // ==========================================
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 350) {
        backToTopBtn.classList.remove('d-none');
        backToTopBtn.classList.add('d-flex');
      } else {
        backToTopBtn.classList.add('d-none');
        backToTopBtn.classList.remove('d-flex');
      }
    });

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 10. Dynamic Treatment / Service Details (service-details.html)
  // ==========================================
  const TREATMENTS_DATA = {
    chronic: {
      id: 'chronic',
      shortTitle: 'Chronic Conditions',
      badgeIcon: 'bi-shield-plus',
      badgeText: 'Classical Constitutional Chronic Care',
      title: 'Deep Constitutional Therapy for Chronic Illness',
      heroLead: 'Resolving autoimmune disorders, persistent pain, and chronic metabolic fatigue through individualized, non-toxic miasmatic homeopathy.',
      image: 'assets/images/treatment-chronic-new.jpg',
      imageAlt: 'Classical homeopathic constitutional remedies, amber dropper bottles, and pure milk-sugar globules',
      overviewTag: 'Constitutional Methodology',
      overviewTitle: 'Treating the Root Miasm, Not Merely Suppressing Symptoms',
      overviewP1: 'Chronic disease represents an ongoing breakdown in the organism’s Vital Force, resulting in persistent autoimmune reactivity, joint degradation, or systemic endocrine imbalance. In classical homeopathy, long-standing pathologies are approached through Samuel Hahnemann’s miasmatic doctrine, tracing genetic predispositions and deep constitutional susceptibilities.',
      overviewP2: 'Conventional therapeutics often rely on lifelong immunosuppressive agents or pain-relieving NSAIDs that palliate symptoms while straining renal and hepatic function. Our constitutional methodology stimulates your body’s innate cellular restorative intelligence, gradually tapering inflammatory markers and rebuilding long-term vitality.',
      conditions: [
        { title: "Rheumatoid Arthritis & Osteoarthritis", desc: "Alleviating joint inflammation, synovial stiffness, and nocturnal aching with Bryonia, Rhus Tox, and Causticum." },
        { title: "Hashimoto's & Autoimmune Thyroiditis", desc: "Modulating hyperactive anti-TPO antibodies, regulating metabolism, and resolving systemic exhaustion." },
        { title: "Fibromyalgia & Chronic Fatigue Syndrome", desc: "Mitochondrial energy revitalization, soothing diffuse musculoskeletal pain, and clearing post-viral malaise." },
        { title: "Hypertension & Vascular Endocrine Imbalance", desc: "Strengthening arterial tone, calming autonomic nervous surges, and improving cardiovascular resilience." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Comprehensive Constitutional Case Taking", desc: "A meticulous 90-minute analysis assessing thermal preferences, physical modalities, emotional patterns, and family medical pedigree." },
        { stage: "Stage 2", title: "Miasmatic Analysis & Simillimum Selection", desc: "Precision repertorization to uncover the unique constitutional simillimum that resonates with your holistic symptom totality." },
        { stage: "Stage 3", title: "Centisimal & Q-Potency Administration", desc: "Gentle, non-toxic micro-dosed potencies that stimulate deep biological self-regulation without drug interactions or toxicity." },
        { stage: "Stage 4", title: "Vital Force Maintenance & Relapse Shield", desc: "High-potency spacing and constitutional follow-ups every 4-6 weeks to ensure permanent remission and elevated stamina." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "Zero Drug Interactions with Existing Medications" },
        { icon: "bi-activity", text: "Addresses Deep Cellular & Genetic Predispositions" },
        { icon: "bi-heart-pulse", text: "Safe for Multi-Organ & Elderly Care" },
        { icon: "bi-infinity", text: "Sustainable Long-Term Vitality Remission" }
      ],
      specialist: {
        name: "Dr. Eleanor Vance",
        degree: "MD (Hom), Senior Classical Physician (20+ Yrs)",
        role: "Chronic & Autoimmune Lead Physician",
        image: "assets/images/dr-sarah-jenkins.jpg",
        bio: "Senior Fellow of the Faculty of Homeopathy with over two decades of clinical experience reversing complex autoimmune and degenerative chronic disorders."
      },
      price: "$150",
      priceDesc: "Includes initial 90-minute constitutional appraisal, detailed repertory analysis, and 1 month supply of customized potentized remedies.",
      faqs: [
        { q: "Can I take homeopathic remedies alongside my prescription medications?", a: "Yes. Homeopathic remedies act on an informational, biophysical level and have zero biochemical interactions with allopathic pharmaceuticals. You can safely take them alongside your ongoing medications." },
        { q: "How quickly can I expect improvement in chronic ailments?", a: "Most patients notice improvements in sleep, digestion, and daily stamina within 3 to 6 weeks. Complete stabilization of deep chronic autoimmune conditions typically progresses over 6 to 12 months." },
        { q: "What is a homeopathic constitutional intake?", a: "It is an unhurried, 90-minute exploration of your entire health narrative—including physical sensations, food cravings, thermals, sleep patterns, emotional history, and hereditary factors." },
        { q: "Are chronic care remedies safe for long-term usage?", a: "Absolutely. Homeopathic remedies are non-habit forming, ultra-diluted, non-toxic, and cause no damage to liver, kidneys, or gastrointestinal lining." }
      ],
      ctaTitle: "Reclaim Your Daily Vitality with Constitutional Care",
      ctaLead: "Let our senior physicians uncover your constitutional simillimum and restore your body's innate regenerative power.",
      ctaBtn: "Book Chronic Care Consultation"
    },
    skin: {
      id: 'skin',
      shortTitle: 'Skin Ailments',
      badgeIcon: 'bi-flower2',
      badgeText: 'Classical Constitutional Dermatology',
      title: 'Holistic Healing for Chronic Skin Conditions',
      heroLead: 'Restoring the skin’s natural microbiome and cellular integrity from within — without topical steroids, immunosuppressants, or harsh chemical washes.',
      image: 'assets/images/treatment-skin-dermatology.jpg',
      imageAlt: 'Holistic dermatology, radiant healthy skin, and natural soothing botanical healing',
      overviewTag: 'Clinical Overview',
      overviewTitle: 'Why the Skin Reflects Internal Imbalance',
      overviewP1: 'In classical homeopathic pathology, the skin is never considered an isolated organ. It is the body’s outermost protective mirror, reflecting deep metabolic, lymphatic, immunological, and emotional states.',
      overviewP2: 'Conventional treatments frequently rely on topical hydrocortisone or oral antihistamines. While they offer temporary respite, they drive the inflammatory burden deeper into interior organs — a phenomenon classical homeopaths observe when eczema suppression triggers childhood asthma. Our protocol seeks systemic balance so the skin heals permanently.',
      conditions: [
        { title: "Atopic Dermatitis & Eczema", desc: "Nocturnal itching, flexural fissures, lichenified plaques, and allergic flare-ups." },
        { title: "Plaque & Guttate Psoriasis", desc: "Hyper-keratinization, silvery scales on elbows, knees, scalp, and nail pitting." },
        { title: "Chronic Urticaria & Dermographism", desc: "Unpredictable wheals, burning sensation, and histamine hyper-reactivity." },
        { title: "Stubborn Cystic & Hormonal Acne", desc: "Deep nodules, jawline pustules linked to androgen or digestive disharmony." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Detoxification & Elimination Support", desc: "Gently assisting hepatic and renal drainage pathways with low-potency remedies (e.g., Berberis Aquifolium, Sarsaparilla) to ease toxic skin venting." },
        { stage: "Stage 2", title: "Constitutional Repertorization", desc: "Identifying your deep constitutional simile (e.g., Sulphur, Graphites, Arsenicum Album, Psorinum) based on thermal sensitivity, emotional nature, and itch modalities." },
        { stage: "Stage 3", title: "Epidermal Barrier Reconstruction", desc: "As pruritus subsides, skin cellular cohesion re-establishes, dryness gives way to supple skin, and pigment irregularities steadily normalize." },
        { stage: "Stage 4", title: "Miasmatic Consolidation & Relapse Shield", desc: "High-potency constitutional spacing to eradicate chronic latent tendencies (Psora miasm) and ensure weather changes no longer provoke relapses." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "100% Free from Corticosteroids" },
        { icon: "bi-heart-pulse", text: "Treats Internal Root Causes" },
        { icon: "bi-person-check", text: "Safe for Infants, Children & Seniors" },
        { icon: "bi-infinity", text: "Sustained Long-Term Remission" }
      ],
      specialist: {
        name: "Dr. Maya Lin",
        degree: "BHMS, CCH (14+ Yrs)",
        role: "Holistic Dermatology Specialist",
        image: "assets/images/dr-maya-lin.jpg",
        bio: "Specialized in non-steroidal eczema, psoriasis, and pediatric dermatological recovery with over 4,000 documented cases."
      },
      price: "$140",
      priceDesc: "Includes initial 90-minute constitutional case taking, repertory analysis, and 1 month supply of tailored remedies.",
      faqs: [
        { q: "How long does it typically take to see improvement in chronic eczema or psoriasis?", a: "While acute itching often softens within the first 2 to 4 weeks of starting your constitutional remedy, deep chronic conditions like plaque psoriasis typically require 4 to 8 months of systematic treatment to rebuild healthy skin layers from beneath." },
        { q: "Can I safely taper off topical steroid creams while taking homeopathic medicine?", a: "Yes. We never recommend abrupt steroid cessation, which can trigger acute rebound dermatitis. Our homeopaths collaborate with you to gradually taper topical creams as your constitutional remedy strengthens your natural skin barrier." },
        { q: "Is there a temporary aggravation of skin symptoms when beginning treatment?", a: "In classical homeopathy, a slight, transient physiological response (homeopathic aggravation) can occur in sensitive constitutions as the vital force begins clearing toxins. When it occurs, it is mild and quickly followed by substantial, sustained improvement." },
        { q: "Are the remedies safe for infants and toddlers with severe cradle cap or baby eczema?", a: "Completely safe. Homeopathic remedies are ultra-diluted, non-toxic, and free from synthetic preservatives. They can easily be dissolved in breastmilk, pure water, or given as pleasant sweet pellets." }
      ],
      ctaTitle: "Experience Peaceful, Steroid-Free Skin Healing",
      ctaLead: "Let our specialists understand your constitutional totality and restore your skin's serenity.",
      ctaBtn: "Book Skin Consultation"
    },
    pediatric: {
      id: 'pediatric',
      shortTitle: 'Pediatric Care',
      badgeIcon: 'bi-emoji-smile',
      badgeText: 'Gentle Pediatric Constitutional Care',
      title: 'Gentle, Sweet Homeopathy for Growing Children',
      heroLead: 'Strengthening juvenile immune resilience, calming recurrent respiratory infections, and easing childhood developmental challenges with sweet, pleasant globules.',
      image: 'assets/images/treatment-pediatric-care.jpg',
      imageAlt: 'Gentle pediatric homeopathic care with sweet milk-sugar globules loved by children',
      overviewTag: 'Pediatric Focus',
      overviewTitle: 'Nurturing Juvenile Immunity Without Chemical Overload',
      overviewP1: 'A child’s developing immune system requires delicate, non-suppressive support. Frequent courses of antibiotics or antipyretics can deplete gut flora, weaken mucosal defenses, and lead to recurrent ENT infections or chronic allergies.',
      overviewP2: 'Classical pediatric homeopathy uses micro-diluted remedies presented as delightful sweet lactose pellets. Children eagerly take their medicine without tears, while the remedies stimulate natural lymphatic drainage and mucosal resilience.',
      conditions: [
        { title: "Recurrent Tonsillitis & Ear Infections (Otitis)", desc: "Clearing chronic middle ear fluid, inflamed adenoids, and frequent throat infections with Pulsatilla, Belladonna, and Baryta Carb." },
        { title: "Infant Colic, Teething & Reflux", desc: "Soothing painful gum eruptions, nocturnal crying spells, and gastrointestinal distress with Chamomilla and Colocynthis." },
        { title: "Childhood Asthma & Bronchial Wheezing", desc: "Desensitizing hyper-reactive airways and building lung vitality naturally without corticosteroid inhaler dependence." },
        { title: "Behavioral Dysregulation & Sleep Nightmares", desc: "Restoring emotional equilibrium, reducing sensory overwhelm, and resolving night terrors with gentle constitutional potencies." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Gentle Developmental Case Evaluation", desc: "Reviewing pregnancy history, birth milestones, sleep patterns, dietary quirks, and behavioral temperaments in a joyful setting." },
        { stage: "Stage 2", title: "Pediatric Constitutional Simillimum", desc: "Selecting sweet, pleasant remedies matched to the child’s unique physical build, thermals, and emotional disposition." },
        { stage: "Stage 3", title: "Mucosal Barrier & Immunity Strengthening", desc: "Regulating lymphatic tissue (adenoids, tonsils) and restoring strong mucosal defenses against nursery viruses." },
        { stage: "Stage 4", title: "Long-Term Growth & Resilience Shield", desc: "Periodic seasonal check-ins to support growth spurts, academic focus, and continuous viral resistance throughout school years." }
      ],
      benefits: [
        { icon: "bi-emoji-smile", text: "Delicious Sweet Globules Children Adore" },
        { icon: "bi-shield-check", text: "Zero Toxic Side Effects or Drowsiness" },
        { icon: "bi-flower1", text: "Reduces Frequent Antibiotic Dependency" },
        { icon: "bi-infinity", text: "Supports Lifelong Robust Natural Immunity" }
      ],
      specialist: {
        name: "Dr. Julian Thorne",
        degree: "D.H.M.S., Classical Pediatric Specialist (16+ Yrs)",
        role: "Pediatric Wellness Director",
        image: "assets/images/dr-alistair-sterling.jpg",
        bio: "Dedicated pediatric practitioner having treated thousands of infants and children with chronic ear infections, asthma, and developmental sensitivities."
      },
      price: "$120",
      priceDesc: "Includes initial 75-minute child intake, gentle play observation, and 1 month supply of sweet organic remedies.",
      faqs: [
        { q: "Will my child enjoy taking homeopathic remedies?", a: "Children love our remedies! They are administered as tiny sweet pellets made from pharmaceutical-grade organic milk sugar that dissolve effortlessly on the tongue." },
        { q: "Can homeopathy replace antibiotics for ear infections?", a: "Homeopathy effectively resolves recurrent otitis media and chronic fluid accumulation, dramatically reducing the frequency of infections and the need for repeated antibiotic cycles." },
        { q: "How young can a child begin homeopathic treatment?", a: "Homeopathy is completely safe from birth. We frequently treat newborns for birth trauma, jaundice support, infant colic, and painful reflux." },
        { q: "Does homeopathy treat childhood behavioral anxiety or ADHD?", a: "Yes. By identifying constitutional imbalances, homeopathic remedies help soothe sensory hypersensitivity, hyperactivity, and academic focus challenges naturally." }
      ],
      ctaTitle: "Give Your Child the Gift of Gentle, Non-Toxic Healing",
      ctaLead: "Schedule an unhurried, child-friendly consultation with our compassionate pediatric homeopathy team.",
      ctaBtn: "Book Pediatric Session"
    },
    digestive: {
      id: 'digestive',
      shortTitle: 'Digestive Health',
      badgeIcon: 'bi-cup-hot',
      badgeText: 'Enteric & Microbiome Homeopathy',
      title: 'Restoring Gut Equilibrium & The Gut-Brain Axis',
      heroLead: 'Healing irritable bowel syndrome, chronic acid reflux, gastroparesis, and systemic food sensitivities without permanent dependence on antacids.',
      image: 'assets/images/treatment-digestive-health.jpg',
      imageAlt: 'Digestive health, gut equilibrium, fresh herbs, and soothing botanical infusion',
      overviewTag: 'Gastroenterological Balance',
      overviewTitle: 'Rebalancing Enteric Motility and Mucosal Integrity',
      overviewP1: 'The human digestive tract contains over 500 million neurons forming the enteric nervous system. Stress, antibiotic overuse, and dietary toxins destabilize gut motility, leading to chronic dysbiosis, visceral hypersensitivity, and persistent cramping.',
      overviewP2: 'Constitutional homeopathy addresses both the physical mucosa and the autonomic nerve signaling controlling peristalsis. Rather than neutralizing stomach acid with PPIs, our remedies modulate gastric acidity and repair mucosal gut junctions.',
      conditions: [
        { title: "Irritable Bowel Syndrome (IBS-D & IBS-C)", desc: "Calming enteric nerve spasms, painful bloating, and unpredictable bowel alternations with Colocynthis and Lycopodium." },
        { title: "Acid Reflux, GERD & Chronic Gastritis", desc: "Regulating lower esophageal sphincter tone, burning sensations, and regurgitation with Robinia and Nux Vomica." },
        { title: "SIBO, Microbial Dysbiosis & Chronic Gas", desc: "Restoring healthy enzymatic transit, fermentation control, and mucosal barrier repair without harsh synthetic antibiotics." },
        { title: "Ulcerative Colitis & Inflammatory Bowel Care", desc: "Reducing mucosal ulceration, bloody mucus discharge, and tenesmus with Mercurius Corrosivus and Phosphorus." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Enteric Reactivity & Diet Intake", desc: "Detailed case taking evaluating stool frequency, food intolerances, emotional stressors, and visceral pain triggers." },
        { stage: "Stage 2", title: "Gut-Brain Simillimum Prescribing", desc: "Prescribing personalized constitutional potencies that rebalance autonomic enteric nerve tone and digestive secretions." },
        { stage: "Stage 3", title: "Mucosal Healing & Motility Restoration", desc: "Stimulating healthy peristaltic rhythm, soothing inflamed mucous membranes, and restoring comfortable digestion." },
        { stage: "Stage 4", title: "Long-Term Food Tolerance Consolidation", desc: "Reintroducing trigger foods safely while maintaining robust digestive enzyme secretion and microbiome balance." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "No Long-Term PPI or Antacid Dependence" },
        { icon: "bi-cup-hot", text: "Restores Natural Digestive Motility & Enzymes" },
        { icon: "bi-heart-pulse", text: "Calms Stress-Induced Visceral Pain Spasms" },
        { icon: "bi-infinity", text: "Permanent Relief from Fermentative Bloating" }
      ],
      specialist: {
        name: "Dr. Henrik Sorensen",
        degree: "BHMS, Dip. Clinical Gastroenterology (15+ Yrs)",
        role: "Digestive & Enteric Health Lead",
        image: "assets/images/dr-henrik-sorensen.jpg",
        bio: "Renowned practitioner specialized in gut-brain axis disorders, severe IBS, and chronic inflammatory digestive syndromes."
      },
      price: "$135",
      priceDesc: "Includes initial 80-minute gastrointestinal intake, food trigger appraisal, and customized constitutional gut remedies.",
      faqs: [
        { q: "Can homeopathy cure long-standing acid reflux without PPIs?", a: "Yes. Homeopathy addresses the underlying gastric dysmotility and esophageal sphincter relaxation, allowing patients to heal permanently rather than relying on lifetime antacids." },
        { q: "How does homeopathy treat Irritable Bowel Syndrome (IBS)?", a: "By calming the visceral hypersensitivity of the enteric nervous system and regulating intestinal peristalsis through individual constitutional simillimum remedies." },
        { q: "Do I need to follow a restrictive low-FODMAP diet permanently?", a: "No. While temporary dietary calming is helpful, constitutional remedies heal the gut barrier so you can comfortably digest varied wholesome foods again." },
        { q: "Are digestive remedies safe for severe Crohn's or Colitis?", a: "Yes, our gentle constitutional therapeutics work harmoniously alongside gastroenterologist care to reduce flare intensity and sustain mucosal remission." }
      ],
      ctaTitle: "Restore Calm, Comfortable Digestion Naturally",
      ctaLead: "Schedule your comprehensive digestive consultation to heal your gut from the inside out.",
      ctaBtn: "Book Digestive Consultation"
    },
    respiratory: {
      id: 'respiratory',
      shortTitle: 'Respiratory Support',
      badgeIcon: 'bi-wind',
      badgeText: 'Mucosal & Pulmonary Homeopathy',
      title: 'Clear Breathing & Natural Lung Vitality',
      heroLead: 'Overcoming bronchial asthma, seasonal allergic rhinitis, chronic sinusitis, and reactive coughs through deep constitutional desensitization.',
      image: 'assets/images/treatment-respiratory-care.jpg',
      imageAlt: 'Respiratory support, free breathing, pine forest air, and homeopathic lung vitality remedies',
      overviewTag: 'Pulmonary Resilience',
      overviewTitle: 'Strengthening Bronchial Defenses Against Seasonal Sensitivities',
      overviewP1: 'Chronic respiratory ailments are rooted in hyper-reactive mucosal membranes that over-respond to cold drafts, pollen allergens, dust mites, or viral triggers. Repeated steroid inhalers provide short-term dilation but leave bronchial passages fragile.',
      overviewP2: 'Constitutional homeopathy calms the underlying bronchial spasms, thins tenaciously adhered mucus, and rebuilds healthy mucosal cilia without dependence on bronchodilator sprays.',
      conditions: [
        { title: "Bronchial Asthma & Wheezing", desc: "Relieving chest tightness, nocturnal dyspnea, and exercise-induced spasms with Arsenicum Album and Blatta Orientalis." },
        { title: "Allergic Rhinitis & Hay Fever", desc: "Desensitizing seasonal pollen reactivity, continuous sneezing fits, and lacrimation with Allium Cepa and Sabadilla." },
        { title: "Chronic Sinusitis & Nasal Polyps", desc: "Draining maxillary congestion, eliminating post-nasal drip, and shrinking benign polyps with Kali Bichromicum and Teucrium." },
        { title: "Post-Viral Bronchitis & Lingering Coughs", desc: "Clearing lingering chest rattling, dry spasmodic coughing spells, and mucosal irritation with Drosera and Antimonium Tart." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Mucosal Sensitivity & Trigger Profiling", desc: "Identifying individual weather sensitivities (humidity, drafts, pollen seasons), nocturnal cough timings, and chest modalities." },
        { stage: "Stage 2", title: "Acute Bronchial Relief & Drainage", desc: "Prescribing low-potency botanical and mineral drainage remedies to clear nasal passages and open constricted bronchi." },
        { stage: "Stage 3", title: "Constitutional Pulmonary Desensitization", desc: "Administering deep constitutional potencies to desensitize the immune response to environmental allergens." },
        { stage: "Stage 4", title: "Seasonal Relapse Shield", desc: "Pre-season constitutional booster protocols ensuring spring and winter weather changes provoke no airway reactivity." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "Zero Jitters, Palpitations, or Inhaler Dependency" },
        { icon: "bi-wind", text: "Expands Deep, Unrestricted Lung Capacity" },
        { icon: "bi-flower1", text: "Desensitizes Histamine Allergen Over-Reactivity" },
        { icon: "bi-infinity", text: "Safe for Childhood Asthma & Senior Bronchitis" }
      ],
      specialist: {
        name: "Dr. Alistair Sterling",
        degree: "MD (Hom), Classical Respiratory Specialist (18+ Yrs)",
        role: "Pulmonary & Allergy Care Lead",
        image: "assets/images/dr-alistair-sterling.jpg",
        bio: "Distinguished classical respiratory homeopath specializing in bronchial asthma, allergic rhinitis, and pulmonary regeneration."
      },
      price: "$135",
      priceDesc: "Includes initial 85-minute respiratory evaluation, peak flow baseline review, and individualized lung remedies.",
      faqs: [
        { q: "Can homeopathy cure asthma permanently?", a: "Yes. By addressing the constitutional allergen hypersensitivity and bronchial smooth muscle reactivity, patients gradually experience fewer attacks and achieve sustained remission." },
        { q: "Should I stop using my emergency inhaler during treatment?", a: "No. Never discontinue prescribed rescue bronchodilators abruptly. As your constitutional remedy strengthens your airways, your need for rescue inhalers will naturally decline under clinical supervision." },
        { q: "How effective is homeopathy for chronic sinusitis and nasal polyps?", a: "Remarkably effective. Remedies such as Kali Bichromicum and Teucrium drain congested frontal sinuses and safely shrink nasal polyps without surgery." },
        { q: "Can seasonal hay fever be treated before the pollen season starts?", a: "Yes! Starting pre-seasonal constitutional desensitization 4 to 6 weeks before pollen bloom yields optimal preventative protection." }
      ],
      ctaTitle: "Breathe Deeply and Freely Every Day",
      ctaLead: "Discover non-steroidal, long-term relief from asthma, allergies, and chronic respiratory congestion.",
      ctaBtn: "Book Respiratory Consultation"
    },
    stress: {
      id: 'stress',
      shortTitle: 'Stress & Wellness',
      badgeIcon: 'bi-moon-stars',
      badgeText: 'Neuro-Endocrine Homeopathy',
      title: 'Serenity, Emotional Balance & Restorative Sleep',
      heroLead: 'Non-habit forming constitutional remedies that soothe chronic nervous tension, mental burnout, panic surges, and stubborn insomnia.',
      image: 'assets/images/treatment-stress-wellness.jpg',
      imageAlt: 'Mindful stress relief, serenity, calming botanicals, and nervous system balance',
      overviewTag: 'Emotional Well-Being',
      overviewTitle: 'Harmonizing The Autonomic Nervous System & Adrenal Axis',
      overviewP1: 'Chronic professional stress, emotional grief, and relentless sensory stimulation lock the autonomic nervous system in hyper-vigilant sympathetic dominance. Elevated cortisol exhausts the adrenal glands, resulting in visceral anxiety, brain fog, and chronic sleep disruption.',
      overviewP2: 'Constitutional homeopathy treats the indivisible mind-body connection. Remedies derived from natural minerals and calming botanicals restore parasympathetic tone and rejuvenate the pineal circadian rhythm without drowsiness or chemical addiction.',
      conditions: [
        { title: "Generalized Anxiety & Anticipatory Panic", desc: "Soothing rapid heartbeat, tremulousness, and overwhelming panic attacks with Gelsemium, Argentum Nitricum, and Aconitum." },
        { title: "Chronic Insomnia & Restless Sleep", desc: "Quieting mental racing thoughts, nocturnal waking at 3 AM, and unrefreshing sleep with Coffea Cruda and Passiflora." },
        { title: "Adrenal Burnout & Mental Exhaustion", desc: "Revitalizing neuromuscular stamina, cognitive focus, and emotional resilience with Kali Phosphoricum and Phosphoric Acid." },
        { title: "Grief, Emotional Shock & Depressive Slumps", desc: "Processing suppressed grief, emotional heartbreak, and silent weeping spells naturally with Ignatia Amara and Natrum Muriaticum." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Empathetic Emotional Case Taking", desc: "A safe, confidential, unhurried 90-minute session exploring sleep architecture, emotional history, and stress triggers." },
        { stage: "Stage 2", title: "Psychosomatic Simillimum Matching", desc: "Identifying the precise remedy matching your unique emotional temperament, grief processing style, and somatic physical symptoms." },
        { stage: "Stage 3", title: "Nervous System Tonification", desc: "Gentle daily potencies supporting parasympathetic activation, melatonin rhythm, and peaceful nighttime sleep depth." },
        { stage: "Stage 4", title: "Emotional Resilience & Vital Equilibrium", desc: "Monthly constitutional maintenance ensuring future life challenges are met with calm clarity and stable emotional stamina." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "100% Non-Habit Forming & Non-Sedating" },
        { icon: "bi-moon-stars", text: "Restores Natural Deep Delta Sleep Cycles" },
        { icon: "bi-heart-pulse", text: "Calms Physical Palpitations & Nervous Spasms" },
        { icon: "bi-infinity", text: "Promotes Clear Daytime Mental Stamina" }
      ],
      specialist: {
        name: "Dr. Arthur Pendelton",
        degree: "M.D. (Hom), Neuro-Gastroenterology (17+ Yrs)",
        role: "Stress & Mind-Body Health Director",
        image: "assets/images/dr-alistair-sterling.jpg",
        bio: "Pioneering physician focused on autonomic nervous system balance, psychosomatic wellness, and restorative sleep medicine."
      },
      price: "$135",
      priceDesc: "Includes initial 90-minute emotional case taking, sleep assessment, and personalized non-drowsy nerve remedies.",
      faqs: [
        { q: "Are homeopathic anxiety remedies addictive or habit-forming?", a: "Not at all. Homeopathic medicines carry zero risk of chemical dependence, tolerance, or addiction. You can use them safely without worrying about withdrawal symptoms." },
        { q: "Will remedies for insomnia make me drowsy during work the next morning?", a: "No. Unlike synthetic sleeping pills, homeopathic remedies do not sedate the brain; they gently remove the nervous restlessness that blocks natural sleep, so you wake feeling clear and refreshed." },
        { q: "Can homeopathy help with physical symptoms of anxiety like heart palpitations?", a: "Yes. Homeopathy treats somatic manifestations of anxiety including rapid pulse, trembling, gastrointestinal nervous spasms, and tight throat sensations." },
        { q: "How does homeopathy address deep emotional grief or trauma?", a: "Remedies such as Ignatia Amara and Natrum Muriaticum gently unlock trapped sorrow, helping the vital force release emotional tension and restore inner calm." }
      ],
      ctaTitle: "Find Your Center of Calm and Restorative Peace",
      ctaLead: "Begin your journey toward tranquil sleep, emotional resilience, and relaxed daily clarity.",
      ctaBtn: "Book Wellness Consultation"
    },
    womens: {
      id: 'womens',
      shortTitle: "Women's Health",
      badgeIcon: 'bi-gender-female',
      badgeText: 'Endocrine & Gynaecological Homeopathy',
      title: 'Natural Hormonal Equilibrium & Reproductive Care',
      heroLead: 'Compassionate constitutional treatment for PCOS, irregular or painful cycles, menopausal vasomotor flushes, endometriosis, and prenatal vitality.',
      image: 'assets/images/treatment-womens-health.jpg',
      imageAlt: "Holistic women's hormonal wellness, restorative comfort, and gentle natural health",
      overviewTag: 'Endocrine Health',
      overviewTitle: 'Realigning The HPO Endocrine Axis Without Synthetic Hormones',
      overviewP1: 'Female endocrine physiology is an intricate hormonal symphony involving the hypothalamus, pituitary, thyroid, and ovaries (the HPO axis). Synthetic contraceptive pills or HRT frequently override natural cycles rather than correcting the deeper glandular signaling.',
      overviewP2: 'Classical homeopathy respects the cyclical nature of female vitality. Individualized constitutional remedies stimulate the pituitary-ovarian feedback loop, dissolve pelvic venous congestion, and restore smooth, comfortable hormonal transitions.',
      conditions: [
        { title: "PCOS & Irregular / Anovulatory Cycles", desc: "Regulating follicular maturation, balancing androgen levels, and restoring predictable menstrual rhythm with Pulsatilla and Sepia." },
        { title: "Dysmenorrhea & Endometriosis Pelvic Pain", desc: "Relieving severe cramping, pelvic congestion, and lower back spasms with Magnesia Phosphorica, Sabina, and Lachesis." },
        { title: "Perimenopause & Menopausal Hot Flashes", desc: "Balancing nocturnal vasomotor flushes, mood fluctuations, and vaginal dryness with Sepia, Cimicifuga, and Sulphur." },
        { title: "Safe Pregnancy & Postpartum Vitality", desc: "Soothing persistent morning nausea, pelvic ligament pain, and postpartum emotional depletion with Caulophyllum and Arnica." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Comprehensive Gynecological Profile", desc: "Reviewing cycle lengths, flow characteristics, emotional premenstrual shifts, thermal tendencies, and previous hormonal treatments." },
        { stage: "Stage 2", title: "Constitutional Endocrine Prescribing", desc: "Selecting the simillimum that resonates with your holistic symptom totality and glandular regulatory balance." },
        { stage: "Stage 3", title: "Pelvic Decongestion & Cycle Stabilization", desc: "Clearing pelvic venous congestion, regulating ovarian follicle development, and smoothing menstrual transitions." },
        { stage: "Stage 4", title: "Long-Term Hormonal Equilibrium", desc: "Spacing constitutional potencies to establish permanent regular cycles, joyful fertility, or graceful menopausal ease." }
      ],
      benefits: [
        { icon: "bi-shield-check", text: "100% Free from Synthetic Hormones" },
        { icon: "bi-gender-female", text: "Stimulates Natural Ovarian & Pituitary Signaling" },
        { icon: "bi-flower1", text: "Safe During Pregnancy, Nursing & Menopause" },
        { icon: "bi-infinity", text: "Eradicates Cyclic Cramps & Emotional Turbulence" }
      ],
      specialist: {
        name: "Dr. Ananya Sharma",
        degree: "MD (Hom), Women's Health Fellow (15+ Yrs)",
        role: "Women's Endocrine & Hormonal Specialist",
        image: "assets/images/dr-ananya-sharma.jpg",
        bio: "Distinguished practitioner dedicated to non-synthetic hormone balance, PCOS resolution, and holistic pregnancy wellness."
      },
      price: "$145",
      priceDesc: "Includes initial 90-minute women's hormonal appraisal, cycle history review, and 1 month of tailored constitutional remedies.",
      faqs: [
        { q: "Can homeopathy regulate cycles in severe PCOS without birth control pills?", a: "Yes. Constitutional remedies address the hypothalamic-pituitary-ovarian axis, encouraging natural spontaneous ovulation and reducing androgen excess without synthetic hormones." },
        { q: "How does homeopathy relieve severe menstrual cramps (dysmenorrhea)?", a: "Remedies such as Magnesia Phos and Colocynthis act as powerful natural antispasmodics that relax uterine muscle fibers and eliminate cyclic pelvic pain." },
        { q: "Are homeopathic remedies safe during pregnancy and nursing?", a: "Completely safe. Because remedies are ultra-diluted and non-toxic, they pose zero teratogenic danger to the baby while alleviating morning sickness, heartburn, and back strain." },
        { q: "What can homeopathy do for hot flashes and menopausal mood changes?", a: "Constitutional remedies like Sepia and Lachesis balance vasomotor instability, dramatically reducing hot flushes, night sweats, and irritability." }
      ],
      ctaTitle: "Experience Effortless, Natural Hormonal Harmony",
      ctaLead: "Schedule your personalized women's health consultation to restore your natural feminine rhythm.",
      ctaBtn: "Book Women's Health Session"
    },
    general: {
      id: 'general',
      shortTitle: 'General Consultation',
      badgeIcon: 'bi-person-check',
      badgeText: 'Holistic Preventative Foundation',
      title: 'Comprehensive Constitutional Homeopathic Consultation',
      heroLead: 'An unhurried 90-minute appraisal designed to understand your unique constitutional totality, strengthen biological vitality, and prevent future illness.',
      image: 'assets/images/treatment-consultation.jpg',
      imageAlt: 'Classical homeopathic constitutional consultation with materia medica and personalized care',
      overviewTag: 'Holistic Appraisal',
      overviewTitle: 'The Power of The Hahnemannian Constitutional Case Intake',
      overviewP1: 'Modern medicine often fragments the human body into isolated specialties—referring digestion to a gastroenterologist, skin to a dermatologist, and moods to a psychiatrist. Classical homeopathy takes the opposite approach: recognizing that every symptom in your body is connected to a singular underlying constitutional state.',
      overviewP2: 'During our foundation consultation, our physicians take 60 to 90 unhurried minutes to map your thermal traits, circadian energy cycles, past medical history, family pedigree, and emotional disposition. From this comprehensive map, we prescribe your constitutional simillimum.',
      conditions: [
        { title: "Preventative Vitality & Immune Fortification", desc: "Enhancing baseline stamina, optimizing resistance against seasonal viral outbreaks, and preventing degenerative tendencies." },
        { title: "Sub-Clinical Fatigue & Brain Fog", desc: "Overcoming unexplainable exhaustion, post-prandial slumps, and lack of focus when standard blood tests appear 'normal'." },
        { title: "Complex Multi-System Health Conditions", desc: "Untangling overlapping complaints spanning joints, digestion, skin, and sleep that have resisted conventional approaches." },
        { title: "Constitutional Health Optimization", desc: "Fine-tuning cellular energy, restorative sleep depth, and emotional equilibrium for holistic longevity." }
      ],
      protocol: [
        { stage: "Stage 1", title: "Unhurried 90-Minute Clinical Interview", desc: "Exploring your full personal health biography, emotional nature, physical thermals, sleep patterns, and food cravings." },
        { stage: "Stage 2", title: "Comprehensive Repertorization & Synthesis", desc: "Systematic cross-referencing of your unique symptoms across classical homeopathic repertories and Materia Medica." },
        { stage: "Stage 3", title: "Precision Potency Administration", desc: "Dispensing your individualized constitutional simillimum in hand-potentized amber dropper bottles or lactose globules." },
        { stage: "Stage 4", title: "Follow-Up Appraisal & Progress Tracking", desc: "Reviewing biological shifts, energy elevation, and symptom dissipation at 4-week check-ins to ensure lasting health." }
      ],
      benefits: [
        { icon: "bi-clock", text: "60 to 90 Unhurried Minutes with an Accredited Doctor" },
        { icon: "bi-shield-check", text: "Completely Non-Toxic & Zero Adverse Reactions" },
        { icon: "bi-person-check", text: "100% Tailored to Your Biological Uniqueness" },
        { icon: "bi-infinity", text: "Fosters Long-Term Preventative Self-Regulation" }
      ],
      specialist: {
        name: "Dr. Evelyn Hartmann",
        degree: "MD (Hom), PhD, Miasmatic Immunology (22+ Yrs)",
        role: "Senior Consultant & Chief Physician",
        image: "assets/images/dr-sarah-jenkins.jpg",
        bio: "Internationally published homeopath with extensive clinical experience conducting in-depth constitutional assessments for multi-system health conditions."
      },
      price: "$150",
      priceDesc: "Includes complete 90-minute constitutional appraisal, Materia Medica analysis, and 1 month supply of tailored remedies.",
      faqs: [
        { q: "What should I prepare before my first constitutional consultation?", a: "Bring a list of any current medications, past medical diagnoses, and notable family health history. Most importantly, come prepared to share your natural reactions to weather, foods, and daily stressors." },
        { q: "How does constitutional homeopathy differ from symptom-specific homeopathy?", a: "Constitutional homeopathy treats the whole person rather than just a localized symptom. The chosen remedy strengthens your entire vital force, resolving multiple concurrent symptoms simultaneously." },
        { q: "Are the consultation fees inclusive of medicine?", a: "Yes. All our initial consultation packages include a one-month supply of customized potentized remedies dispensed directly from our sterile in-house pharmacy." },
        { q: "Can consultations be held online or via video call?", a: "Yes. We offer secure, interactive telehealth consultations for out-of-town and international patients with remedies safely shipped to your doorstep." }
      ],
      ctaTitle: "Begin Your Journey to Whole-Person Vitality",
      ctaLead: "Schedule your comprehensive 90-minute constitutional consultation with our senior medical team today.",
      ctaBtn: "Book Foundation Consultation"
    }
  };

  function initServiceDetails() {
    const heroTitleEl = document.getElementById('treatmentHeroTitle');
    if (!heroTitleEl) return;

    const aliasMap = {
      'women': 'womens',
      'womens-health': 'womens',
      'women-health': 'womens',
      'chronic-care': 'chronic',
      'chronic-conditions': 'chronic',
      'skin-health': 'skin',
      'skin-ailments': 'skin',
      'pediatric-care': 'pediatric',
      'pediatric': 'pediatric',
      'digestive-health': 'digestive',
      'digestive': 'digestive',
      'respiratory-support': 'respiratory',
      'respiratory': 'respiratory',
      'stress-wellness': 'stress',
      'stress-management': 'stress',
      'stress': 'stress',
      'general-consultation': 'general',
      'general': 'general'
    };

    function parseTreatmentKey(candidate) {
      if (!candidate || typeof candidate !== 'string') return '';
      let key = candidate.trim().toLowerCase();
      if (key.includes('#')) {
        key = key.split('#')[1] || '';
      }
      if (key.includes('?')) {
        const tempParams = new URLSearchParams(key.split('?')[1]);
        key = tempParams.get('service') || tempParams.get('treatment') || tempParams.get('id') || key;
      }
      key = key.replace(/[^a-z0-9_-]/g, '');
      if (aliasMap[key]) {
        key = aliasMap[key];
      }
      return TREATMENTS_DATA[key] ? key : '';
    }

    function getSelectedKey() {
      // 1. Try URL Hash first (e.g. #skin)
      if (window.location.hash) {
        const hashCandidate = parseTreatmentKey(window.location.hash);
        if (hashCandidate) return hashCandidate;
      }

      // 2. Try URL Search Params (e.g. ?service=skin)
      if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const queryCandidate = urlParams.get('service') || urlParams.get('treatment') || urlParams.get('id');
        const parsedQuery = parseTreatmentKey(queryCandidate);
        if (parsedQuery) return parsedQuery;
      }

      return 'chronic';
    }

    function renderTreatment(isUserInteraction, overrideKey) {
      let key = overrideKey ? parseTreatmentKey(overrideKey) : '';
      if (!key) {
        key = getSelectedKey();
      }
      const t = TREATMENTS_DATA[key];
      if (!t) return;

      document.title = `${t.title} | AuraPure Homeopathy Clinic`;

      const breadcrumbEl = document.getElementById('treatmentBreadcrumb');
      if (breadcrumbEl) breadcrumbEl.textContent = t.shortTitle;

      const badgeEl = document.getElementById('treatmentHeroBadge');
      if (badgeEl) badgeEl.innerHTML = `<i class="bi ${t.badgeIcon}"></i> ${t.badgeText}`;

      if (heroTitleEl) heroTitleEl.textContent = t.title;

      const leadEl = document.getElementById('treatmentHeroLead');
      if (leadEl) leadEl.textContent = t.heroLead;

      const heroBtnEl = document.getElementById('treatmentHeroBtn');
      if (heroBtnEl) heroBtnEl.innerHTML = `<i class="bi bi-calendar-plus"></i> Book ${t.shortTitle} Consultation`;

      const overviewTagEl = document.getElementById('treatmentOverviewTag');
      if (overviewTagEl) overviewTagEl.textContent = t.overviewTag;

      const overviewTitleEl = document.getElementById('treatmentOverviewTitle');
      if (overviewTitleEl) overviewTitleEl.textContent = t.overviewTitle;

      const overviewBodyEl = document.getElementById('treatmentOverviewBody');
      if (overviewBodyEl) {
        overviewBodyEl.innerHTML = `
          <p class="lead text-secondary">${t.overviewP1}</p>
          <p class="text-secondary">${t.overviewP2}</p>
        `;
      }

      const mainImgEl = document.getElementById('treatmentMainImg');
      if (mainImgEl) {
        mainImgEl.src = t.image;
        mainImgEl.alt = t.imageAlt;
      }

      const conditionsListEl = document.getElementById('treatmentConditionsList');
      if (conditionsListEl) {
        conditionsListEl.innerHTML = t.conditions.map(c => `
          <div class="col-md-6">
            <div class="card-wellness p-3 h-100">
              <h6 class="fw-bold text-success mb-1"><i class="bi bi-check2-circle me-2"></i> ${c.title}</h6>
              <p class="small text-secondary mb-0">${c.desc}</p>
            </div>
          </div>
        `).join('');
      }

      const protocolListEl = document.getElementById('treatmentProtocolList');
      if (protocolListEl) {
        protocolListEl.innerHTML = t.protocol.map(p => `
          <div class="p-3 border rounded-3 bg-body-tertiary">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-success rounded-pill">${p.stage}</span>
              <h6 class="fw-bold mb-0">${p.title}</h6>
            </div>
            <p class="small text-secondary mb-0">${p.desc}</p>
          </div>
        `).join('');
      }

      const benefitsListEl = document.getElementById('treatmentBenefitsList');
      if (benefitsListEl) {
        benefitsListEl.innerHTML = t.benefits.map(b => `
          <div class="col-sm-6">
            <div class="d-flex align-items-center gap-3">
              <i class="bi ${b.icon} text-success fs-3"></i>
              <span class="small fw-semibold">${b.text}</span>
            </div>
          </div>
        `).join('');
      }

      const faqAccordionEl = document.getElementById('treatmentFaqAccordion');
      if (faqAccordionEl) {
        faqAccordionEl.innerHTML = t.faqs.map((f, idx) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="faqHeading${idx + 1}">
              <button class="accordion-button ${idx > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse${idx + 1}" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="faqCollapse${idx + 1}">
                ${f.q}
              </button>
            </h2>
            <div id="faqCollapse${idx + 1}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" aria-labelledby="faqHeading${idx + 1}" data-bs-parent="#treatmentFaqAccordion">
              <div class="accordion-body small text-secondary">
                ${f.a}
              </div>
            </div>
          </div>
        `).join('');
      }

      const docNameEl = document.getElementById('treatmentDocName');
      if (docNameEl) docNameEl.textContent = t.specialist.name;

      const docDegreeEl = document.getElementById('treatmentDocDegree');
      if (docDegreeEl) docDegreeEl.textContent = t.specialist.degree;

      const docRoleEl = document.getElementById('treatmentDocRole');
      if (docRoleEl) docRoleEl.textContent = t.specialist.role;

      const docBioEl = document.getElementById('treatmentDocBio');
      if (docBioEl) docBioEl.textContent = t.specialist.bio;

      const docImgEl = document.getElementById('treatmentDocImg');
      if (docImgEl) {
        docImgEl.src = t.specialist.image;
        docImgEl.alt = t.specialist.name;
      }

      const priceValEl = document.getElementById('treatmentPriceVal');
      if (priceValEl) priceValEl.textContent = t.price;

      const priceDescEl = document.getElementById('treatmentPriceDesc');
      if (priceDescEl) priceDescEl.textContent = t.priceDesc;

      // Update sidebar links active class and accessibility state
      const sidebarLinks = document.querySelectorAll('#treatmentOtherList a');
      sidebarLinks.forEach(link => {
        let linkKey = link.getAttribute('data-service');
        if (!linkKey) {
          const href = link.getAttribute('href') || '';
          linkKey = parseTreatmentKey(href);
        } else {
          linkKey = parseTreatmentKey(linkKey);
        }

        if (linkKey === key) {
          link.classList.add('active-treatment-item', 'fw-bold');
          link.classList.remove('text-secondary');
          link.setAttribute('aria-current', 'true');
        } else {
          link.classList.remove('active-treatment-item', 'fw-bold');
          link.classList.add('text-secondary');
          link.removeAttribute('aria-current');
        }
      });

      const ctaTitleEl = document.getElementById('treatmentCtaTitle');
      if (ctaTitleEl) ctaTitleEl.textContent = t.ctaTitle;

      const ctaLeadEl = document.getElementById('treatmentCtaLead');
      if (ctaLeadEl) ctaLeadEl.textContent = t.ctaLead;

      const ctaBtnEl = document.getElementById('treatmentCtaBtn');
      if (ctaBtnEl) ctaBtnEl.innerHTML = `<i class="bi bi-calendar2-check"></i> ${t.ctaBtn}`;

      if (isUserInteraction) {
        const headerEl = document.getElementById('treatmentHeroSection');
        if (headerEl) {
          headerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    function switchTreatment(targetKey) {
      const cleanKey = parseTreatmentKey(targetKey) || 'chronic';

      try {
        const newUrl = `service-details.html?service=${cleanKey}#${cleanKey}`;
        if (window.history && window.history.pushState) {
          window.history.pushState({ service: cleanKey }, '', newUrl);
        } else {
          window.location.hash = cleanKey;
        }
      } catch (err) {
        window.location.hash = cleanKey;
      }

      renderTreatment(true, cleanKey);
    }

    // Attach click listeners to "All Specialized Treatments" sidebar links
    const sidebarLinks = document.querySelectorAll('#treatmentOtherList a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        let targetKey = this.getAttribute('data-service');
        if (!targetKey) {
          const href = this.getAttribute('href') || '';
          targetKey = parseTreatmentKey(href);
        }
        switchTreatment(targetKey);
      });
    });

    // Also attach to footer treatment links on service-details.html for instant switching
    const footerLinks = document.querySelectorAll('footer a[href*="service-details.html"]');
    footerLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';
        const targetKey = parseTreatmentKey(href);
        if (targetKey) {
          e.preventDefault();
          switchTreatment(targetKey);
        }
      });
    });

    // Listen to browser Back / Forward buttons & Hash changes
    window.addEventListener('popstate', function () {
      renderTreatment(false);
    });

    window.addEventListener('hashchange', function () {
      renderTreatment(false);
    });

    // Initial render
    renderTreatment(false);
  }

  initServiceDetails();

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuraPureApp);
} else {
  initAuraPureApp();
}
