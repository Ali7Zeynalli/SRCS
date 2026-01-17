document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 23, 42, 0.9)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
            } else {
                navbar.style.background = 'rgba(30, 41, 59, 0.7)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Simple Animation on Scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card').forEach(el => observer.observe(el));

    // Lightbox Implementation
    const featureRows = document.querySelectorAll('.feature-row');
    if (featureRows.length > 0) {
        // Create Lightbox DOM
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-close">&times;</div>
            <div class="lightbox-nav lightbox-prev"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="lightbox-nav lightbox-next"><i class="fa-solid fa-chevron-right"></i></div>
            <div class="lightbox-content">
                <div class="lightbox-image-container">
                    <img src="" alt="" class="lightbox-image">
                </div>
                <div class="lightbox-text">
                    <h2></h2>
                    <p></p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const lightboxTitle = lightbox.querySelector('.lightbox-text h2');
        const lightboxDesc = lightbox.querySelector('.lightbox-text p');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        let currentIndex = 0;
        const galleryItems = [];

        // Build Gallery Array
        featureRows.forEach((row, index) => {
            const img = row.querySelector('img');
            const title = row.querySelector('h2').textContent;
            const desc = row.querySelector('p').textContent;

            if (img) {
                galleryItems.push({
                    src: img.src,
                    alt: img.alt,
                    title: title,
                    desc: desc
                });

                img.addEventListener('click', () => {
                    openLightbox(index);
                });
            }
        });

        function updateLightbox(index) {
            const item = galleryItems[index];
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxTitle.textContent = item.title;
            lightboxDesc.textContent = item.desc;
            currentIndex = index;
        }

        function openLightbox(index) {
            updateLightbox(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function nextImage() {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= galleryItems.length) nextIndex = 0;
            updateLightbox(nextIndex);
        }

        function prevImage() {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = galleryItems.length - 1;
            updateLightbox(prevIndex);
        }

        // Event Listeners
        closeBtn.addEventListener('click', closeLightbox);
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });

        // Close on outside click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }

    // --- Shared Header & Footer Logic ---
    const renderSharedComponents = async () => {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Helper to set active link
        const setActiveLink = () => {
            const links = document.querySelectorAll('.nav-links a');
            links.forEach(link => {
                const linkPath = link.getAttribute('href');
                if (linkPath === currentPage || (currentPage === 'index.html' && linkPath === 'index.html')) {
                    link.style.color = 'var(--primary)';
                    link.classList.add('active-link');
                }
            });
            // Update Footer links if needed (e.g. highlight changelog)
            const footerLinks = document.querySelectorAll('.footer-content a');
            footerLinks.forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.style.color = 'var(--primary)';
                }
            });
        };

        // Fetch and Render Header
        // Fetch and Render Header
        if (navbarPlaceholder) {
            try {
                // Add timestamp to prevent caching
                const response = await fetch('components/header.html?v=' + new Date().getTime());
                const html = await response.text();
                navbarPlaceholder.innerHTML = html;
                setActiveLink();
                // Update Language UI if i18n is ready
                // Update Language UI if i18n is ready
                if (window.i18n) {
                    // Double-check localStorage to ensure persistence
                    const savedLang = localStorage.getItem('s-rcs-lang');
                    if (savedLang && window.i18n.language !== savedLang) {
                        console.log('Restoring saved language:', savedLang);
                        window.i18n.setLanguage(savedLang);
                    } else {
                        window.i18n.updateActiveFlag(window.i18n.language);
                        window.i18n.translatePage();
                    }
                }
            } catch (error) {
                console.error('Error loading header:', error);
            }
        }

        // Fetch and Render Footer
        if (footerPlaceholder) {
            try {
                const response = await fetch('components/footer.html?v=' + new Date().getTime());
                const html = await response.text();
                footerPlaceholder.innerHTML = html;
                setActiveLink(); // Call again for footer links
            } catch (error) {
                console.error('Error loading footer:', error);
            }
        }
        
        // Re-initialize Navbar Scroll Effect (after insertion)
        const navbar = document.querySelector('.navbar');
        if(navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.style.background = 'rgba(15, 23, 42, 0.9)';
                    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                } else {
                    navbar.style.background = 'rgba(30, 41, 59, 0.7)';
                    navbar.style.boxShadow = 'none';
                }
            });
        }
    };
    
    // Render Components Immediate
    renderSharedComponents();

    // --- Documentation SPA Logic ---
    if (window.location.pathname.includes('docs.html')) {
        const sections = document.querySelectorAll('.doc-section');
        const sidebarLinks = document.querySelectorAll('.docs-sidebar a');
        const navContainerClass = '.nav-buttons-container';

        function showSection(id) {
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === id) section.classList.add('active');
            });

            // Update sidebar active state
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                    // Scroll sidebar to active link if needed
                    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });

            // Update URL hash without scrolling
            history.pushState(null, null, '#' + id);
            
            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });

            renderNavButtons(id);
        }

        function renderNavButtons(currentId) {
            const currentSection = document.getElementById(currentId);
            if (!currentSection) return;

            const container = currentSection.querySelector(navContainerClass);
            if (!container) return;

            // Find current index in sidebar links order
            let currentIndex = -1;
            const linkIds = Array.from(sidebarLinks).map(link => link.getAttribute('href').substring(1));
            currentIndex = linkIds.indexOf(currentId);

            let prevBtn = '';
            let nextBtn = '';

            if (currentIndex > 0) {
                const prevId = linkIds[currentIndex - 1];
                const prevName = sidebarLinks[currentIndex - 1].innerText;
                prevBtn = `<button class="btn-nav prev" onclick="navigateTo('${prevId}')"><i class="fa-solid fa-arrow-left"></i> ${prevName}</button>`;
            }

            if (currentIndex < linkIds.length - 1) {
                const nextId = linkIds[currentIndex + 1];
                const nextName = sidebarLinks[currentIndex + 1].innerText;
                nextBtn = `<button class="btn-nav next" onclick="navigateTo('${nextId}')">${nextName} <i class="fa-solid fa-arrow-right"></i></button>`;
            }

            container.innerHTML = prevBtn + nextBtn;
        }

        // Expose to global scope for button onclicks
        window.navigateTo = function(id) {
            showSection(id);
        };

        // Handle initial load
        const hash = window.location.hash.substring(1);
        if (hash) {
            showSection(hash);
        } else {
            showSection('intro'); // Default
        }

        // Handle Sidebar Clicks
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href').substring(1);
                showSection(id);
            });
        });
    }
});
