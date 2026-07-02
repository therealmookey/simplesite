// ========================================
// SIMPLESITE BUILDER - WYSIWYG
// ========================================

let currentDevice = 'desktop';
let splitViewActive = false;
let autoSaveTimer = null;
let previewUpdateTimeout = null;

// ========================================
// 1. NAVIGATIE - EERST INITIALISEREN
// ========================================
function initNavigation() {
    console.log('🔍 Navigatie initialiseren...');
    
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    
    console.log(`📊 Gevonden: ${navLinks.length} navigatie links, ${sections.length} secties`);
    
    // Verwijder eventuele bestaande event listeners door ze te clonen
    navLinks.forEach(link => {
        // Vervang de link met een clone om oude listeners te verwijderen
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
    });
    
    // Selecteer de nieuwe links
    const newNavLinks = document.querySelectorAll('.admin-nav a');
    
    newNavLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🖱️ Geklikt op: ${this.textContent.trim()}`);
            
            // Verwijder active class van alle links
            newNavLinks.forEach(l => l.classList.remove('active'));
            // Voeg active toe aan geklikte link
            this.classList.add('active');
            
            // Verberg alle secties
            sections.forEach(s => s.classList.remove('active'));
            
            // Toon de juiste sectie
            const sectionId = this.getAttribute('data-section');
            console.log(`📄 Sectie ID: ${sectionId}`);
            
            const target = document.getElementById(`section-${sectionId}`);
            if (target) {
                target.classList.add('active');
                console.log(`✅ Sectie "${sectionId}" getoond`);
            } else {
                console.log(`❌ Sectie "${sectionId}" niet gevonden`);
            }
            
            // Update preview als we naar preview tab gaan
            if (sectionId === 'preview') {
                setTimeout(updatePreview, 100);
            }
        });
    });
    
    // Zorg dat de eerste link actief is
    if (newNavLinks.length > 0) {
        newNavLinks[0].classList.add('active');
        const firstSection = document.getElementById('section-general');
        if (firstSection) {
            firstSection.classList.add('active');
        }
    }
    
    console.log('✅ Navigatie geïnitialiseerd!');
}

// ========================================
// 2. DOCUMENT READY
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SimpleSite Builder start...');
    
    // Eerst navigatie initialiseren
    initNavigation();
    
    // Dan de rest
    initPages();
    initContent();
    initColors();
    initPreview();
    initDownload();
    initSettings();
    
    console.log('✅ SimpleSite Builder is klaar!');
});

// ========================================
// 3. PAGINA'S
// ========================================
function initPages() {
    const addBtn = document.getElementById('add-page');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const input = document.getElementById('page-name');
            const name = input.value.trim();
            
            if (!name) {
                alert('Voer een paginanaam in');
                return;
            }
            
            const pageId = name.toLowerCase().replace(/\s/g, '-');
            
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
            updatePreview();
        });
    }
}

// ========================================
// 4. PAGINA VERWIJDEREN
// ========================================
window.deletePage = function(pageId, name) {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    
    const item = document.querySelector(`[data-page="${pageId}"]`);
    if (item) item.remove();
    
    const select = document.getElementById('page-select');
    const option = select.querySelector(`option[value="${pageId}"]`);
    if (option) option.remove();
    
    const settings = getSettings();
    if (settings.pages) delete settings.pages[pageId];
    if (settings.pageNames) delete settings.pageNames[pageId];
    saveSettings(settings);
    
    select.value = 'home';
    loadPageContent('home');
    updatePreview();
};

// ========================================
// 5. INHOUD
// ========================================
function initContent() {
    const select = document.getElementById('page-select');
    if (select) {
        select.addEventListener('change', function() {
            loadPageContent(this.value);
            updatePreview();
        });
    }
}

window.loadPageContent = function(pageId) {
    const settings = getSettings();
    const pages = settings.pages || {};
    const page = pages[pageId] || { title: 'Nieuwe pagina', content: 'Schrijf hier je inhoud...' };
    
    const titleInput = document.getElementById('page-title');
    const contentInput = document.getElementById('page-content');
    
    if (titleInput) titleInput.value = page.title || '';
    if (contentInput) contentInput.value = page.content || '';
};

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
        
        const timestamp = document.getElementById('preview-timestamp');
        if (timestamp) {
            const now = new Date();
            timestamp.textContent = `Automatisch opgeslagen: ${now.toLocaleTimeString()}`;
        }
    }, 500);
};

// ========================================
// 6. KLEUREN
// ========================================
function initColors() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('input', function() {
            const hexInput = document.getElementById(this.id + '-hex');
            if (hexInput) {
                hexInput.value = this.value;
            }
            const settings = getSettings();
            const colorMap = {
                'primary-color': 'primaryColor',
                'bg-color': 'bgColor',
                'text-color': 'textColor'
            };
            const key = colorMap[this.id];
            if (key) {
                settings[key] = this.value;
                saveSettings(settings);
            }
            updatePreview();
        });
    });
    
    const hexInputs = document.querySelectorAll('input[type="text"][id$="-hex"]');
    hexInputs.forEach(input => {
        input.addEventListener('input', function() {
            const colorInput = document.getElementById(this.id.replace('-hex', ''));
            if (colorInput && /^#[0-9A-F]{6}$/i.test(this.value)) {
                colorInput.value = this.value;
                const settings = getSettings();
                const colorMap = {
                    'primary-color-hex': 'primaryColor',
                    'bg-color-hex': 'bgColor',
                    'text-color-hex': 'textColor'
                };
                const key = colorMap[this.id];
                if (key) {
                    settings[key] = this.value;
                    saveSettings(settings);
                }
                updatePreview();
            }
        });
    });
}

// ========================================
// 7. PREVIEW
// ========================================
function initPreview() {
    // Device knoppen
    const devices = ['mobile', 'desktop', 'tablet'];
    devices.forEach(device => {
        const btn = document.getElementById(`preview-${device}`);
        if (btn) {
            btn.addEventListener('click', function() {
                setDevice(device);
            });
        }
    });
    
    // Split view
    const splitBtn = document.getElementById('preview-split');
    if (splitBtn) {
        splitBtn.addEventListener('click', toggleSplitView);
    }
    
    // Refresh
    const refreshBtn = document.getElementById('refresh-preview');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshPreview);
    }
}

window.setDevice = function(device) {
    currentDevice = device;
    const frame = document.getElementById('preview-frame');
    if (!frame) return;
    
    frame.className = 'preview-frame';
    
    if (device === 'mobile') {
        frame.classList.add('mobile');
    } else if (device === 'tablet') {
        frame.classList.add('tablet');
    }
    
    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`preview-${device}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    updatePreview();
};

window.toggleSplitView = function() {
    splitViewActive = !splitViewActive;
    const container = document.getElementById('preview-container');
    const btn = document.getElementById('preview-split');
    
    if (!container) return;
    
    if (splitViewActive) {
        container.classList.add('split-view');
        if (btn) btn.classList.add('active');
        createSplitView();
    } else {
        container.classList.remove('split-view');
        if (btn) btn.classList.remove('active');
        const duplicate = container.querySelector('.preview-frame.duplicate');
        if (duplicate) duplicate.remove();
    }
    
    updatePreview();
};

function createSplitView() {
    const container = document.getElementById('preview-container');
    const original = document.getElementById('preview-frame');
    if (!container || !original) return;
    
    const existing = container.querySelector('.preview-frame.duplicate');
    if (existing) existing.remove();
    
    const clone = original.cloneNode(true);
    clone.className = 'preview-frame duplicate';
    clone.id = 'preview-frame-duplicate';
    container.appendChild(clone);
    
    const cloneContent = clone.querySelector('.preview-content');
    const originalContent = original.querySelector('.preview-content');
    if (cloneContent && originalContent) {
        cloneContent.innerHTML = originalContent.innerHTML;
    }
}

window.refreshPreview = function() {
    const frame = document.getElementById('preview-frame');
    if (frame) {
        frame.classList.add('updating');
        updatePreview();
        setTimeout(() => {
            frame.classList.remove('updating');
        }, 300);
    }
};

window.updatePreview = function() {
    clearTimeout(previewUpdateTimeout);
    previewUpdateTimeout = setTimeout(function() {
        renderPreview();
    }, 50);
};

function renderPreview() {
    const settings = getSettings();
    const pageId = document.getElementById('page-select')?.value || 'home';
    const pages = settings.pages || {};
    const page = pages[pageId] || { title: 'Welkom bij mijn website', content: 'Dit is de inhoud van mijn website.' };
    
    const currentTitle = document.getElementById('page-title')?.value || page.title;
    const currentContent = document.getElementById('page-content')?.value || page.content;
    const siteTitle = document.getElementById('site-title')?.value || 'SimpleSite';
    const siteDesc = document.getElementById('site-description')?.value || '';
    
    const primaryColor = settings.primaryColor || '#2563eb';
    const bgColor = settings.bgColor || '#ffffff';
    const textColor = settings.textColor || '#1a1a1a';
    
    // Navigatie
    const pageNames = settings.pageNames || { home: 'Home' };
    let navLinks = '';
    navLinks += `<span style="color:${textColor};">Home</span>`;
    
    for (const [id, name] of Object.entries(pageNames)) {
        if (id !== 'home') {
            const isActive = (id === pageId);
            navLinks += `<span style="color:${isActive ? primaryColor : textColor}; ${isActive ? 'font-weight:600;' : ''}">${name}</span>`;
        }
    }
    
    const pageTitle = page.title || currentTitle;
    const pageContent = page.content || currentContent;
    
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
    
    const previewSite = document.getElementById('preview-site');
    if (previewSite) {
        previewSite.innerHTML = previewHTML;
    }
    
    const duplicate = document.getElementById('preview-frame-duplicate');
    if (duplicate) {
        const dupContent = duplicate.querySelector('.preview-content');
        if (dupContent) {
            dupContent.innerHTML = previewHTML;
        }
    }
    
    const timestamp = document.getElementById('preview-timestamp');
    if (timestamp) {
        const now = new Date();
        timestamp.textContent = `Laatste update: ${now.toLocaleTimeString()}`;
    }
}

// ========================================
// 8. SETTINGS
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
// 9. DOWNLOAD
// ========================================
function initDownload() {
    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('📥 Je website wordt gedownload!\n\n(Zodra de betaalfunctionaliteit is toegevoegd, ontvang je hier je complete website-bestanden)');
        });
    }
}

// ========================================
// 10. INSTELLINGEN LADEN
// ========================================
function initSettings() {
    const settings = getSettings();
    
    if (settings.title) {
        const el = document.getElementById('site-title');
        if (el) el.value = settings.title;
    }
    if (settings.description) {
        const el = document.getElementById('site-description');
        if (el) el.value = settings.description;
    }
    if (settings.primaryColor) {
        const el = document.getElementById('primary-color');
        const hex = document.getElementById('primary-color-hex');
        if (el) el.value = settings.primaryColor;
        if (hex) hex.value = settings.primaryColor;
    }
    if (settings.bgColor) {
        const el = document.getElementById('bg-color');
        const hex = document.getElementById('bg-color-hex');
        if (el) el.value = settings.bgColor;
        if (hex) hex.value = settings.bgColor;
    }
    if (settings.textColor) {
        const el = document.getElementById('text-color');
        const hex = document.getElementById('text-color-hex');
        if (el) el.value = settings.textColor;
        if (hex) hex.value = settings.textColor;
    }
    
    // Load pages
    const pageNames = settings.pageNames || { home: 'Home' };
    const select = document.getElementById('page-select');
    const list = document.getElementById('page-list');
    
    if (list) {
        list.innerHTML = '';
        const homeItem = document.createElement('div');
        homeItem.className = 'page-item';
        homeItem.dataset.page = 'home';
        homeItem.innerHTML = `
            <span>🏠 Home</span>
            <span style="color:#6b7280;font-size:0.85rem;">index.html</span>
        `;
        list.appendChild(homeItem);
    }
    
    if (select) {
        select.innerHTML = '';
        const homeOption = document.createElement('option');
        homeOption.value = 'home';
        homeOption.textContent = 'Home';
        select.appendChild(homeOption);
    }
    
    for (const [pageId, name] of Object.entries(pageNames)) {
        if (pageId !== 'home') {
            if (list) {
                const item = document.createElement('div');
                item.className = 'page-item';
                item.dataset.page = pageId;
                item.innerHTML = `
                    <span>📄 ${name}</span>
                    <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
                    <button class="btn-delete-page" data-page="${pageId}" onclick="deletePage('${pageId}', '${name}')">✕</button>
                `;
                list.appendChild(item);
            }
            
            if (select) {
                const option = document.createElement('option');
                option.value = pageId;
                option.textContent = name;
                select.appendChild(option);
            }
        }
    }
    
    loadPageContent('home');
    setTimeout(updatePreview, 200);
}