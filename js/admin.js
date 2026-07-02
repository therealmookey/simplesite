// ========================================
// ADMIN JAVASCRIPT - MET PREVIEW
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // 1. NAVIGATIE
    // ========================================
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            
            const sectionId = this.getAttribute('data-section');
            const target = document.getElementById(`section-${sectionId}`);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    // ========================================
    // 2. ALGEMEEN OPSLAAN
    // ========================================
    const saveGeneralBtn = document.getElementById('save-general');
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', function() {
            const title = document.getElementById('site-title').value;
            const description = document.getElementById('site-description').value;
            
            const settings = getSettings();
            settings.title = title;
            settings.description = description;
            saveSettings(settings);
            
            showFeedback(this, '✓ Opgeslagen!');
            updatePreview();
        });
    }

    // ========================================
    // 3. PAGINA'S TOEVOEGEN
    // ========================================
    const addPageBtn = document.getElementById('add-page');
    if (addPageBtn) {
        addPageBtn.addEventListener('click', function() {
            const input = document.getElementById('page-name');
            const name = input.value.trim();
            
            if (name) {
                const list = document.getElementById('page-list');
                const pageId = name.toLowerCase().replace(/\s/g, '-');
                
                // Controleer of pagina al bestaat
                if (document.querySelector(`[data-page="${pageId}"]`)) {
                    alert('Deze pagina bestaat al!');
                    return;
                }
                
                const item = document.createElement('div');
                item.className = 'page-item';
                item.dataset.page = pageId;
                item.innerHTML = `
                    <span>📄 ${name}</span>
                    <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
                    <button class="btn-delete-page" data-page="${pageId}">✕</button>
                `;
                list.appendChild(item);
                
                // Voeg toe aan select dropdown
                const select = document.getElementById('page-select');
                const option = document.createElement('option');
                option.value = pageId;
                option.textContent = name;
                select.appendChild(option);
                
                input.value = '';
                
                // Verwijder functionaliteit
                item.querySelector('.btn-delete-page').addEventListener('click', function() {
                    if (confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) {
                        item.remove();
                        // Verwijder uit select
                        const opt = select.querySelector(`option[value="${pageId}"]`);
                        if (opt) opt.remove();
                    }
                });
                
                // Sla pagina's op
                savePages();
            }
        });
    }

    // ========================================
    // 4. PAGINA SELECT - LAAD INHOUD
    // ========================================
    const pageSelect = document.getElementById('page-select');
    const pageTitle = document.getElementById('page-title');
    const pageContent = document.getElementById('page-content');

    if (pageSelect) {
        pageSelect.addEventListener('change', function() {
            loadPageContent(this.value);
        });
    }

    function loadPageContent(pageId) {
        const settings = getSettings();
        const pages = settings.pages || {};
        const page = pages[pageId] || { title: 'Nieuwe pagina', content: 'Schrijf hier je inhoud...' };
        
        if (pageTitle) pageTitle.value = page.title;
        if (pageContent) pageContent.value = page.content;
    }

    // ========================================
    // 5. INHOUD OPSLAAN
    // ========================================
    const saveContentBtn = document.getElementById('save-content');
    if (saveContentBtn) {
        saveContentBtn.addEventListener('click', function() {
            const pageId = pageSelect.value;
            const title = pageTitle.value;
            const content = pageContent.value;
            
            const settings = getSettings();
            if (!settings.pages) settings.pages = {};
            settings.pages[pageId] = { title, content };
            saveSettings(settings);
            
            showFeedback(this, '✓ Inhoud opgeslagen!');
            updatePreview();
        });
    }

    // ========================================
    // 6. DESIGN OPSLAAN
    // ========================================
    const saveDesignBtn = document.getElementById('save-design');
    if (saveDesignBtn) {
        saveDesignBtn.addEventListener('click', function() {
            const primaryColor = document.getElementById('primary-color').value;
            const bgColor = document.getElementById('bg-color').value;
            const textColor = document.getElementById('text-color').value;
            
            const settings = getSettings();
            settings.primaryColor = primaryColor;
            settings.bgColor = bgColor;
            settings.textColor = textColor;
            saveSettings(settings);
            
            showFeedback(this, '✓ Design opgeslagen!');
            updatePreview();
        });
    }

    // ========================================
    // 7. KLEUR PICKER SYNC MET HEX
    // ========================================
    function syncColorPicker(colorId, hexId) {
        const colorInput = document.getElementById(colorId);
        const hexInput = document.getElementById(hexId);
        
        if (colorInput && hexInput) {
            colorInput.addEventListener('input', function() {
                hexInput.value = this.value;
            });
            
            hexInput.addEventListener('input', function() {
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    colorInput.value = this.value;
                }
            });
        }
    }

    syncColorPicker('primary-color', 'primary-color-hex');
    syncColorPicker('bg-color', 'bg-color-hex');
    syncColorPicker('text-color', 'text-color-hex');

    // ========================================
    // 8. PREVIEW FUNCTIES
    // ========================================
    
    // Preview device knoppen
    const previewMobile = document.getElementById('preview-mobile');
    const previewDesktop = document.getElementById('preview-desktop');
    const previewTablet = document.getElementById('preview-tablet');
    const previewFrame = document.getElementById('preview-frame');
    const refreshBtn = document.getElementById('refresh-preview');

    if (previewMobile) {
        previewMobile.addEventListener('click', function() {
            setActivePreview(this);
            previewFrame.className = 'preview-frame mobile';
        });
    }

    if (previewDesktop) {
        previewDesktop.addEventListener('click', function() {
            setActivePreview(this);
            previewFrame.className = 'preview-frame';
        });
    }

    if (previewTablet) {
        previewTablet.addEventListener('click', function() {
            setActivePreview(this);
            previewFrame.className = 'preview-frame tablet';
        });
    }

    function setActivePreview(btn) {
        document.querySelectorAll('.btn-preview').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updatePreview();
            this.textContent = '✅ Vernieuwd!';
            setTimeout(() => {
                this.textContent = '🔄 Vernieuwen';
            }, 1500);
        });
    }

    // ========================================
    // 9. PREVIEW UPDATE
    // ========================================
    function updatePreview() {
        const settings = getSettings();
        
        // Haal de huidige geselecteerde pagina op
        const currentPage = pageSelect ? pageSelect.value : 'home';
        const pages = settings.pages || {};
        const page = pages[currentPage] || { title: 'Welkom bij mijn website', content: 'Dit is de inhoud van mijn website.' };
        
        // Update preview titel
        const previewTitle = document.getElementById('preview-hero-title');
        if (previewTitle) {
            previewTitle.textContent = page.title || 'Welkom bij mijn website';
        }
        
        // Update preview tekst
        const previewText = document.getElementById('preview-hero-text');
        if (previewText) {
            previewText.textContent = page.content || 'Dit is de inhoud van mijn website.';
        }
        
        // Update kleuren
        const header = document.querySelector('.preview-header');
        const hero = document.querySelector('.preview-hero');
        const footer = document.querySelector('.preview-footer');
        const heroTitle = document.getElementById('preview-hero-title');
        const heroText = document.getElementById('preview-hero-text');
        
        const primaryColor = settings.primaryColor || '#2563eb';
        const bgColor = settings.bgColor || '#ffffff';
        const textColor = settings.textColor || '#1a1a1a';
        
        if (header) {
            header.style.background = bgColor;
        }
        
        if (hero) {
            hero.style.background = bgColor;
        }
        
        if (footer) {
            footer.style.background = '#fafafa';
        }
        
        if (heroTitle) {
            heroTitle.style.color = textColor;
        }
        
        if (heroText) {
            heroText.style.color = '#6b7280';
        }
        
        // Update logo kleur in preview
        const logoSimple = document.querySelector('.preview-header [style*="color:#1a1a1a"]');
        const logoSite = document.querySelector('.preview-header [style*="color:#2563eb"]');
        if (logoSimple) {
            logoSimple.style.color = textColor;
        }
        if (logoSite) {
            logoSite.style.color = primaryColor;
        }
        
        // Update de site titel in de preview header
        const siteTitle = settings.title || 'SimpleSite';
        const headerLogo = document.querySelector('.preview-header > div:first-child');
        if (headerLogo) {
            headerLogo.innerHTML = `
                <span style="color:${textColor};">${siteTitle}</span>
            `;
        }
    }

    // ========================================
    // 10. SETTINGS FUNCTIES
    // ========================================
    function getSettings() {
        const saved = localStorage.getItem('simplesite_settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch(e) {
                return {};
            }
        }
        return {};
    }

    function saveSettings(settings) {
        localStorage.setItem('simplesite_settings', JSON.stringify(settings));
        // Update de pagina lijst ook
        savePages();
    }

    function savePages() {
        const settings = getSettings();
        const pages = settings.pages || {};
        // Sla alleen de paginanamen op
        const pageNames = {};
        document.querySelectorAll('#page-list .page-item').forEach(item => {
            const pageId = item.dataset.page;
            if (pageId && pageId !== 'home') {
                const name = item.querySelector('span:first-child').textContent.replace('📄 ', '');
                pageNames[pageId] = name;
            }
        });
        // Zorg dat home altijd bestaat
        if (!pageNames.home) {
            pageNames.home = 'Home';
        }
        settings.pageNames = pageNames;
        localStorage.setItem('simplesite_settings', JSON.stringify(settings));
    }

    function loadPages() {
        const settings = getSettings();
        const pageNames = settings.pageNames || { home: 'Home' };
        const list = document.getElementById('page-list');
        const select = document.getElementById('page-select');
        
        // Leeg de lijst (behalve home)
        list.innerHTML = '';
        select.innerHTML = '';
        
        // Voeg home toe
        const homeItem = document.createElement('div');
        homeItem.className = 'page-item';
        homeItem.dataset.page = 'home';
        homeItem.innerHTML = `
            <span>🏠 Home</span>
            <span style="color:#6b7280;font-size:0.85rem;">index.html</span>
        `;
        list.appendChild(homeItem);
        
        // Voeg home toe aan select
        const homeOption = document.createElement('option');
        homeOption.value = 'home';
        homeOption.textContent = 'Home';
        select.appendChild(homeOption);
        
        // Voeg andere pagina's toe
        for (const [pageId, name] of Object.entries(pageNames)) {
            if (pageId !== 'home') {
                const item = document.createElement('div');
                item.className = 'page-item';
                item.dataset.page = pageId;
                item.innerHTML = `
                    <span>📄 ${name}</span>
                    <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
                    <button class="btn-delete-page" data-page="${pageId}">✕</button>
                `;
                list.appendChild(item);
                
                const option = document.createElement('option');
                option.value = pageId;
                option.textContent = name;
                select.appendChild(option);
                
                // Delete functionaliteit
                item.querySelector('.btn-delete-page').addEventListener('click', function() {
                    if (confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) {
                        item.remove();
                        const opt = select.querySelector(`option[value="${pageId}"]`);
                        if (opt) opt.remove();
                        // Verwijder uit settings
                        const settings = getSettings();
                        if (settings.pages) {
                            delete settings.pages[pageId];
                        }
                        if (settings.pageNames) {
                            delete settings.pageNames[pageId];
                        }
                        saveSettings(settings);
                    }
                });
            }
        }
        
        // Laad de inhoud van de eerste pagina
        loadPageContent('home');
    }

    // ========================================
    // 11. FEEDBACK
    // ========================================
    function showFeedback(element, message) {
        const original = element.textContent;
        const originalBg = element.style.background;
        element.textContent = message;
        element.style.background = '#2563eb';
        
        setTimeout(() => {
            element.textContent = original;
            element.style.background = originalBg || '';
        }, 2000);
    }

    // ========================================
    // 12. DOWNLOAD
    // ========================================
    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('📥 Je website wordt gedownload!\n\n(Zodra de betaalfunctionaliteit is toegevoegd, ontvang je hier je complete website-bestanden)');
        });
    }

    // ========================================
    // 13. INIT
    // ========================================
    function init() {
        // Laad opgeslagen instellingen
        const settings = getSettings();
        
        if (settings.title) {
            document.getElementById('site-title').value = settings.title;
        }
        if (settings.description) {
            document.getElementById('site-description').value = settings.description;
        }
        if (settings.primaryColor) {
            document.getElementById('primary-color').value = settings.primaryColor;
            document.getElementById('primary-color-hex').value = settings.primaryColor;
        }
        if (settings.bgColor) {
            document.getElementById('bg-color').value = settings.bgColor;
            document.getElementById('bg-color-hex').value = settings.bgColor;
        }
        if (settings.textColor) {
            document.getElementById('text-color').value = settings.textColor;
            document.getElementById('text-color-hex').value = settings.textColor;
        }
        
        // Laad pagina's
        loadPages();
        
        // Update preview
        setTimeout(updatePreview, 100);
        
        console.log('🚀 SimpleSite Builder is klaar!');
        console.log('💡 Bewerk je website en bekijk de live preview.');
    }

    init();
});