// ========================================
// SIMPLESITE BUILDER - WYSIWYG
// ========================================

let currentDevice = 'desktop';
let splitViewActive = false;
let autoSaveTimer = null;
let previewUpdateTimeout = null;

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
            
            // Update preview als we naar preview tab gaan
            if (sectionId === 'preview') {
                setTimeout(updatePreview, 100);
            }
        });
    });

    // ========================================
    // 2. PAGINA'S TOEVOEGEN
    // ========================================
    document.getElementById('add-page').addEventListener('click', function() {
        const input = document.getElementById('page-name');
        const name = input.value.trim();
        
        if (!name) {
            alert('Voer een paginanaam in');
            return;
        }
        
        const pageId = name.toLowerCase().replace(/\s/g, '-');
        
        // Check if page already exists
        if (document.querySelector(`[data-page="${pageId}"]`)) {
            alert('Deze pagina bestaat al!');
            return;
        }
        
        // Add to list
        const list = document.getElementById('page-list');
        const item = document.createElement('div');
        item.className = 'page-item';
        item.dataset.page = pageId;
        item.innerHTML = `
            <span>📄 ${name}</span>
            <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
            <button class="btn-delete-page" data-page="${pageId}" onclick="deletePage('${pageId}', '${name}')">✕</button>
        `;
        list.appendChild(item);
        
        // Add to select
        const select = document.getElementById('page-select');
        const option = document.createElement('option');
        option.value = pageId;
        option.textContent = name;
        select.appendChild(option);
        
        // Add to pages data
        const settings = getSettings();
        if (!settings.pages) settings.pages = {};
        settings.pages[pageId] = { title: name, content: 'Schrijf hier je inhoud...' };
        if (!settings.pageNames) settings.pageNames = {};
        settings.pageNames[pageId] = name;
        saveSettings(settings);
        
        input.value = '';
        
        // Update preview
        updatePreview();
    });

    // ========================================
    // 3. PAGINA VERWIJDEREN
    // ========================================
    window.deletePage = function(pageId, name) {
        if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
        
        // Remove from list
        const item = document.querySelector(`[data-page="${pageId}"]`);
        if (item) item.remove();
        
        // Remove from select
        const select = document.getElementById('page-select');
        const option = select.querySelector(`option[value="${pageId}"]`);
        if (option) option.remove();
        
        // Remove from settings
        const settings = getSettings();
        if (settings.pages) delete settings.pages[pageId];
        if (settings.pageNames) delete settings.pageNames[pageId];
        saveSettings(settings);
        
        // Switch to home
        select.value = 'home';
        loadPageContent('home');
        updatePreview();
    };

    // ========================================
    // 4. PAGINA SELECT
    // ========================================
    document.getElementById('page-select').addEventListener('change', function() {
        loadPageContent(this.value);
        updatePreview();
    });

    // ========================================
    // 5. INHOUD LADEN
    // ========================================
    window.loadPageContent = function(pageId) {
        const settings = getSettings();
        const pages = settings.pages || {};
        const page = pages[pageId] || { title: 'Nieuwe pagina', content: 'Schrijf hier je inhoud...' };
        
        document.getElementById('page-title').value = page.title || '';
        document.getElementById('page-content').value = page.content || '';
    };

    // ========================================
    // 6. AUTO SAVE
    // ========================================
    window.autoSave = function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            const pageId = document.getElementById('page-select').value;
            const title = document.getElementById('page-title').value;
            const content = document.getElementById('page-content').value;
            
            const settings = getSettings();
            if (!settings.pages) settings.pages = {};
            settings.pages[pageId] = { title, content };
            saveSettings(settings);
            
            // Update status
            const timestamp = document.getElementById('preview-timestamp');
            if (timestamp) {
                const now = new Date();
                timestamp.textContent = `Automatisch opgeslagen: ${now.toLocaleTimeString()}`;
            }
        }, 500);
    };

    // ========================================
    // 7. EDITOR MODE
    // ========================================
    window.toggleEditorMode = function() {
        const container = document.getElementById('preview-container');
        container.classList.toggle('preview-editor-mode');
        updatePreview();
    };

    // ========================================
    // 8. KLEUR FUNCTIES
    // ========================================
    window.updateColor = function(input) {
        const hexInput = document.getElementById(input.id + '-hex');
        if (hexInput) {
            hexInput.value = input.value;
        }
        // Update settings
        const settings = getSettings();
        const colorMap = {
            'primary-color': 'primaryColor',
            'bg-color': 'bgColor',
            'text-color': 'textColor'
        };
        const key = colorMap[input.id];
        if (key) {
            settings[key] = input.value;
            saveSettings(settings);
        }
    };

    window.updateColorFromHex = function(input) {
        const colorInput = document.getElementById(input.id.replace('-hex', ''));
        if (colorInput && /^#[0-9A-F]{6}$/i.test(input.value)) {
            colorInput.value = input.value;
            const settings = getSettings();
            const colorMap = {
                'primary-color-hex': 'primaryColor',
                'bg-color-hex': 'bgColor',
                'text-color-hex': 'textColor'
            };
            const key = colorMap[input.id];
            if (key) {
                settings[key] = input.value;
                saveSettings(settings);
            }
        }
    };

    // ========================================
    // 9. DEVICE FUNCTIES
    // ========================================
    window.setDevice = function(device) {
        currentDevice = device;
        const frame = document.getElementById('preview-frame');
        
        // Reset classes
        frame.className = 'preview-frame';
        
        if (device === 'mobile') {
            frame.classList.add('mobile');
        } else if (device === 'tablet') {
            frame.classList.add('tablet');
        }
        
        // Update button states
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`preview-${device}`).classList.add('active');
        
        updatePreview();
    };

    // ========================================
    // 10. SPLIT VIEW
    // ========================================
    window.toggleSplitView = function() {
        splitViewActive = !splitViewActive;
        const container = document.getElementById('preview-container');
        const btn = document.getElementById('preview-split');
        
        if (splitViewActive) {
            container.classList.add('split-view');
            btn.classList.add('active');
            // Duplicate preview for split view
            createSplitView();
        } else {
            container.classList.remove('split-view');
            btn.classList.remove('active');
            // Remove duplicate
            const duplicate = container.querySelector('.preview-frame.duplicate');
            if (duplicate) duplicate.remove();
        }
        
        updatePreview();
    };

    function createSplitView() {
        const container = document.getElementById('preview-container');
        const original = document.getElementById('preview-frame');
        
        // Remove existing duplicate
        const existing = container.querySelector('.preview-frame.duplicate');
        if (existing) existing.remove();
        
        // Create duplicate
        const clone = original.cloneNode(true);
        clone.className = 'preview-frame duplicate';
        clone.id = 'preview-frame-duplicate';
        container.appendChild(clone);
        
        // Sync content
        clone.querySelector('.preview-content').innerHTML = original.querySelector('.preview-content').innerHTML;
    }

    // ========================================
    // 11. REFRESH PREVIEW
    // ========================================
    window.refreshPreview = function() {
        const frame = document.getElementById('preview-frame');
        frame.classList.add('updating');
        updatePreview();
        setTimeout(() => {
            frame.classList.remove('updating');
        }, 300);
    };

    // ========================================
    // 12. PREVIEW UPDATE (CORE WYSIWYG)
    // ========================================
    window.updatePreview = function() {
        clearTimeout(previewUpdateTimeout);
        previewUpdateTimeout = setTimeout(function() {
            renderPreview();
        }, 50);
    };

    function renderPreview() {
        const settings = getSettings();
        const pageId = document.getElementById('page-select').value;
        const pages = settings.pages || {};
        const page = pages[pageId] || { title: 'Welkom bij mijn website', content: 'Dit is de inhoud van mijn website.' };
        
        // Haal actuele waarden op (voor real-time updates)
        const currentTitle = document.getElementById('page-title').value || page.title;
        const currentContent = document.getElementById('page-content').value || page.content;
        const siteTitle = document.getElementById('site-title').value || 'SimpleSite';
        const siteDesc = document.getElementById('site-description').value || '';
        
        // Kleuren
        const primaryColor = settings.primaryColor || '#2563eb';
        const bgColor = settings.bgColor || '#ffffff';
        const textColor = settings.textColor || '#1a1a1a';
        
        // ========================================
        // NAVIGATIE - Dynamisch op basis van pagina's
        // ========================================
        const pageNames = settings.pageNames || { home: 'Home' };
        let navLinks = '';
        
        // Home is altijd eerste
        navLinks += `<span style="color:${textColor};">Home</span>`;
        
        // Voeg andere pagina's toe
        for (const [id, name] of Object.entries(pageNames)) {
            if (id !== 'home') {
                // Markeer de huidige pagina in de navigatie
                const isActive = (id === pageId);
                navLinks += `<span style="color:${isActive ? primaryColor : textColor}; ${isActive ? 'font-weight:600;' : ''}">${name}</span>`;
            }
        }
        
        // ========================================
        // PAGINA CONTENT
        // ========================================
        // Als de pagina een eigen titel heeft in de pages data, gebruik die
        const pageTitle = page.title || currentTitle;
        const pageContent = page.content || currentContent;
        
        // Bouw de preview HTML
        const previewHTML = `
            <div class="preview-header" style="background:${bgColor};border-bottom:1px solid #f0f0f0;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                <div style="font-size:1.4rem;font-weight:700;">
                    <span style="color:${textColor};">${siteTitle}</span>
                </div>
                <div style="display:flex;gap:1.5rem;font-size:0.95rem;flex-wrap:wrap;">
                    ${navLinks}
                </div>
            </div>
            <div class="preview-hero" style="text-align:center;padding:4rem 2rem;background:${bgColor};min-height:200px;">
                <h1 style="font-size:2.5rem;color:${textColor};margin-bottom:1rem;">${pageTitle}</h1>
                <p style="color:#6b7280;max-width:500px;margin:0 auto;font-size:1.1rem;">${pageContent}</p>
                ${siteDesc ? `<p style="color:#6b7280;max-width:500px;margin:1rem auto 0;font-size:0.95rem;opacity:0.7;">${siteDesc}</p>` : ''}
                <div style="margin-top:2rem;">
                    <a href="#" style="display:inline-block;background:${primaryColor};color:#fff;padding:0.7rem 2rem;border-radius:6px;text-decoration:none;font-weight:600;">Begin nu</a>
                </div>
            </div>
            <div class="preview-footer" style="background:#fafafa;border-top:1px solid #f0f0f0;padding:2rem;text-align:center;color:#6b7280;font-size:0.9rem;">
                © 2026 SimpleSite — Simpel. Snel. Professioneel.
            </div>
        `;
        
        // Update main preview
        const previewSite = document.getElementById('preview-site');
        if (previewSite) {
            previewSite.innerHTML = previewHTML;
        }
        
        // Update duplicate if exists
        const duplicate = document.getElementById('preview-frame-duplicate');
        if (duplicate) {
            const dupContent = duplicate.querySelector('.preview-content');
            if (dupContent) {
                dupContent.innerHTML = previewHTML;
            }
        }
        
        // Update timestamp
        const timestamp = document.getElementById('preview-timestamp');
        if (timestamp) {
            const now = new Date();
            timestamp.textContent = `Laatste update: ${now.toLocaleTimeString()}`;
        }
    }

    // ========================================
    // 13. SETTINGS FUNCTIES
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
    }

    // ========================================
    // 14. DOWNLOAD
    // ========================================
    document.querySelector('.btn-download').addEventListener('click', function() {
        alert('📥 Je website wordt gedownload!\n\n(Zodra de betaalfunctionaliteit is toegevoegd, ontvang je hier je complete website-bestanden)');
    });

    // ========================================
    // 15. INIT
    // ========================================
    function init() {
        // Load settings
        const settings = getSettings();
        
        // Fill fields
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
        
        // Load pages
        const pageNames = settings.pageNames || { home: 'Home' };
        const select = document.getElementById('page-select');
        const list = document.getElementById('page-list');
        
        // Clear list (keep home)
        list.innerHTML = '';
        select.innerHTML = '';
        
        // Add home
        const homeItem = document.createElement('div');
        homeItem.className = 'page-item';
        homeItem.dataset.page = 'home';
        homeItem.innerHTML = `
            <span>🏠 Home</span>
            <span style="color:#6b7280;font-size:0.85rem;">index.html</span>
        `;
        list.appendChild(homeItem);
        
        const homeOption = document.createElement('option');
        homeOption.value = 'home';
        homeOption.textContent = 'Home';
        select.appendChild(homeOption);
        
        // Add other pages
        const pages = settings.pages || {};
        for (const [pageId, name] of Object.entries(pageNames)) {
            if (pageId !== 'home') {
                const item = document.createElement('div');
                item.className = 'page-item';
                item.dataset.page = pageId;
                const pageName = name;
                item.innerHTML = `
                    <span>📄 ${pageName}</span>
                    <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
                    <button class="btn-delete-page" data-page="${pageId}" onclick="deletePage('${pageId}', '${pageName}')">✕</button>
                `;
                list.appendChild(item);
                
                const option = document.createElement('option');
                option.value = pageId;
                option.textContent = pageName;
                select.appendChild(option);
            }
        }
        
        // Load content for home
        loadPageContent('home');
        
        // Initial preview
        setTimeout(updatePreview, 200);
        
        console.log('🚀 SimpleSite WYSIWYG Builder is klaar!');
        console.log('📄 Pagina\'s in navigatie:', Object.values(pageNames).join(', '));
        console.log('💡 Alles wat je verandert, zie je direct in de preview.');
    }

    init();
});

// ========================================
// 16. GLOBALE FUNCTIES VOOR ONCLICK
// ========================================
window.updatePreview = updatePreview;
window.loadPageContent = loadPageContent;
window.autoSave = autoSave;
window.toggleEditorMode = toggleEditorMode;
window.updateColor = updateColor;
window.updateColorFromHex = updateColorFromHex;
window.setDevice = setDevice;
window.toggleSplitView = toggleSplitView;
window.refreshPreview = refreshPreview;
window.deletePage = deletePage;