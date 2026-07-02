// ========================================
// SIMPLESITE BUILDER - WYSIWYG
// ========================================

let currentDevice = 'desktop';
let splitViewActive = false;
let autoSaveTimer = null;
let previewUpdateTimeout = null;

// ========================================
// 1. NAVIGATIE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SimpleSite Builder start...');
    
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    
    console.log('📊 Gevonden:', navLinks.length, 'navigatie links,', sections.length, 'secties');
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Geklikt op:', this.textContent.trim());
            
            navLinks.forEach(function(l) {
                l.classList.remove('active');
            });
            this.classList.add('active');
            
            sections.forEach(function(s) {
                s.classList.remove('active');
            });
            
            var sectionId = this.getAttribute('data-section');
            console.log('📄 Sectie ID:', sectionId);
            
            var target = document.getElementById('section-' + sectionId);
            if (target) {
                target.classList.add('active');
                console.log('✅ Sectie "' + sectionId + '" getoond');
            } else {
                console.log('❌ Sectie "' + sectionId + '" niet gevonden');
            }
            
            if (sectionId === 'preview') {
                setTimeout(updatePreview, 100);
            }
        });
    });
    
    // Zorg dat de eerste sectie zichtbaar is
    var firstLink = document.querySelector('.admin-nav a');
    if (firstLink) {
        firstLink.classList.add('active');
        var firstSection = document.getElementById('section-general');
        if (firstSection) {
            firstSection.classList.add('active');
        }
    }
    
    initPages();
    initContent();
    initColors();
    initPreview();
    initDownload();
    initSettings();
    
    console.log('✅ SimpleSite Builder is klaar!');
});

// ========================================
// 2. PAGINA'S
// ========================================
function initPages() {
    var addBtn = document.getElementById('add-page');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            var input = document.getElementById('page-name');
            var name = input.value.trim();
            
            if (!name) {
                alert('Voer een paginanaam in');
                return;
            }
            
            var pageId = name.toLowerCase().replace(/\s/g, '-');
            
            if (document.querySelector('[data-page="' + pageId + '"]')) {
                alert('Deze pagina bestaat al!');
                return;
            }
            
            var list = document.getElementById('page-list');
            var item = document.createElement('div');
            item.className = 'page-item';
            item.dataset.page = pageId;
            item.innerHTML = `
                <span>📄 ${name}</span>
                <span style="color:#6b7280;font-size:0.85rem;">${pageId}.html</span>
                <button class="btn-delete-page" data-page="${pageId}" onclick="deletePage('${pageId}', '${name}')">✕</button>
            `;
            list.appendChild(item);
            
            var select = document.getElementById('page-select');
            var option = document.createElement('option');
            option.value = pageId;
            option.textContent = name;
            select.appendChild(option);
            
            var settings = getSettings();
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
// 3. PAGINA VERWIJDEREN
// ========================================
window.deletePage = function(pageId, name) {
    if (!confirm('Weet je zeker dat je "' + name + '" wilt verwijderen?')) return;
    
    var item = document.querySelector('[data-page="' + pageId + '"]');
    if (item) item.remove();
    
    var select = document.getElementById('page-select');
    var option = select.querySelector('option[value="' + pageId + '"]');
    if (option) option.remove();
    
    var settings = getSettings();
    if (settings.pages) delete settings.pages[pageId];
    if (settings.pageNames) delete settings.pageNames[pageId];
    saveSettings(settings);
    
    select.value = 'home';
    loadPageContent('home');
    updatePreview();
};

// ========================================
// 4. INHOUD
// ========================================
function initContent() {
    var select = document.getElementById('page-select');
    if (select) {
        select.addEventListener('change', function() {
            loadPageContent(this.value);
            updatePreview();
        });
    }
}

window.loadPageContent = function(pageId) {
    var settings = getSettings();
    var pages = settings.pages || {};
    var page = pages[pageId] || { title: 'Nieuwe pagina', content: 'Schrijf hier je inhoud...' };
    
    var titleInput = document.getElementById('page-title');
    var contentInput = document.getElementById('page-content');
    
    if (titleInput) titleInput.value = page.title || '';
    if (contentInput) contentInput.value = page.content || '';
};

window.autoSave = function() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function() {
        var pageId = document.getElementById('page-select').value;
        var title = document.getElementById('page-title').value;
        var content = document.getElementById('page-content').value;
        
        var settings = getSettings();
        if (!settings.pages) settings.pages = {};
        settings.pages[pageId] = { title: title, content: content };
        saveSettings(settings);
        
        var timestamp = document.getElementById('preview-timestamp');
        if (timestamp) {
            var now = new Date();
            timestamp.textContent = 'Automatisch opgeslagen: ' + now.toLocaleTimeString();
        }
    }, 500);
};

// ========================================
// 5. KLEUREN
// ========================================
function initColors() {
    var colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var hexInput = document.getElementById(this.id + '-hex');
            if (hexInput) {
                hexInput.value = this.value;
            }
            var settings = getSettings();
            var colorMap = {
                'primary-color': 'primaryColor',
                'bg-color': 'bgColor',
                'text-color': 'textColor'
            };
            var key = colorMap[this.id];
            if (key) {
                settings[key] = this.value;
                saveSettings(settings);
            }
            updatePreview();
        });
    });
    
    var hexInputs = document.querySelectorAll('input[type="text"][id$="-hex"]');
    hexInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var colorInput = document.getElementById(this.id.replace('-hex', ''));
            if (colorInput && /^#[0-9A-F]{6}$/i.test(this.value)) {
                colorInput.value = this.value;
                var settings = getSettings();
                var colorMap = {
                    'primary-color-hex': 'primaryColor',
                    'bg-color-hex': 'bgColor',
                    'text-color-hex': 'textColor'
                };
                var key = colorMap[this.id];
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
// 6. PREVIEW
// ========================================
function initPreview() {
    var devices = ['mobile', 'desktop', 'tablet'];
    devices.forEach(function(device) {
        var btn = document.getElementById('preview-' + device);
        if (btn) {
            btn.addEventListener('click', function() {
                setDevice(device);
            });
        }
    });
    
    var splitBtn = document.getElementById('preview-split');
    if (splitBtn) {
        splitBtn.addEventListener('click', toggleSplitView);
    }
    
    var refreshBtn = document.getElementById('refresh-preview');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshPreview);
    }
}

window.setDevice = function(device) {
    currentDevice = device;
    var frame = document.getElementById('preview-frame');
    if (!frame) return;
    
    frame.className = 'preview-frame';
    
    if (device === 'mobile') {
        frame.classList.add('mobile');
    } else if (device === 'tablet') {
        frame.classList.add('tablet');
    }
    
    document.querySelectorAll('.btn-preview').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    var activeBtn = document.getElementById('preview-' + device);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    updatePreview();
};

window.toggleSplitView = function() {
    splitViewActive = !splitViewActive;
    var container = document.getElementById('preview-container');
    var btn = document.getElementById('preview-split');
    
    if (!container) return;
    
    if (splitViewActive) {
        container.classList.add('split-view');
        if (btn) btn.classList.add('active');
        createSplitView();
    } else {
        container.classList.remove('split-view');
        if (btn) btn.classList.remove('active');
        var duplicate = container.querySelector('.preview-frame.duplicate');
        if (duplicate) duplicate.remove();
    }
    
    updatePreview();
};

function createSplitView() {
    var container = document.getElementById('preview-container');
    var original = document.getElementById('preview-frame');
    if (!container || !original) return;
    
    var existing = container.querySelector('.preview-frame.duplicate');
    if (existing) existing.remove();
    
    var clone = original.cloneNode(true);
    clone.className = 'preview-frame duplicate';
    clone.id = 'preview-frame-duplicate';
    container.appendChild(clone);
    
    var cloneContent = clone.querySelector('.preview-content');
    var originalContent = original.querySelector('.preview-content');
    if (cloneContent && originalContent) {
        cloneContent.innerHTML = originalContent.innerHTML;
    }
}

window.refreshPreview = function() {
    var frame = document.getElementById('preview-frame');
    if (frame) {
        frame.classList.add('updating');
        updatePreview();
        setTimeout(function() {
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
    var settings = getSettings();
    var pageSelect = document.getElementById('page-select');
    var pageId = pageSelect ? pageSelect.value : 'home';
    var pages = settings.pages || {};
    var page = pages[pageId] || { title: 'Welkom bij mijn website', content: 'Dit is de inhoud van mijn website.' };
    
    var titleInput = document.getElementById('page-title');
    var contentInput = document.getElementById('page-content');
    var siteTitleInput = document.getElementById('site-title');
    var siteDescInput = document.getElementById('site-description');
    
    var currentTitle = titleInput ? titleInput.value : page.title;
    var currentContent = contentInput ? contentInput.value : page.content;
    var siteTitle = siteTitleInput ? siteTitleInput.value : 'SimpleSite';
    var siteDesc = siteDescInput ? siteDescInput.value : '';
    
    var primaryColor = settings.primaryColor || '#2563eb';
    var bgColor = settings.bgColor || '#ffffff';
    var textColor = settings.textColor || '#1a1a1a';
    
    // Navigatie
    var pageNames = settings.pageNames || { home: 'Home' };
    var navLinks = '';
    navLinks += '<span style="color:' + textColor + ';">Home</span>';
    
    for (var id in pageNames) {
        if (id !== 'home') {
            var name = pageNames[id];
            var isActive = (id === pageId);
            var style = 'color:' + (isActive ? primaryColor : textColor) + ';';
            if (isActive) style += 'font-weight:600;';
            navLinks += '<span style="' + style + '">' + name + '</span>';
        }
    }
    
    var pageTitle = page.title || currentTitle;
    var pageContent = page.content || currentContent;
    
    var previewHTML = `
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
            ${siteDesc ? '<p style="color:#6b7280;max-width:500px;margin:1rem auto 0;font-size:0.95rem;opacity:0.7;">' + siteDesc + '</p>' : ''}
            <div style="margin-top:2rem;">
                <a href="#" style="display:inline-block;background:${primaryColor};color:#fff;padding:0.7rem 2rem;border-radius:6px;text-decoration:none;font-weight:600;">Begin nu</a>
            </div>
        </div>
        <div class="preview-footer" style="background:#fafafa;border-top:1px solid #f0f0f0;padding:2rem;text-align:center;color:#6b7280;font-size:0.9rem;">
            © 2026 SimpleSite — Simpel. Snel. Professioneel.
        </div>
    `;
    
    var previewSite = document.getElementById('preview-site');
    if (previewSite) {
        previewSite.innerHTML = previewHTML;
    }
    
    var duplicate = document.getElementById('preview-frame-duplicate');
    if (duplicate) {
        var dupContent = duplicate.querySelector('.preview-content');
        if (dupContent) {
            dupContent.innerHTML = previewHTML;
        }
    }
    
    var timestamp = document.getElementById('preview-timestamp');
    if (timestamp) {
        var now = new Date();
        timestamp.textContent = 'Laatste update: ' + now.toLocaleTimeString();
    }
}

// ========================================
// 7. SETTINGS
// ========================================
function getSettings() {
    var saved = localStorage.getItem('simplesite_settings');
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
// 8. DOWNLOAD
// ========================================
function initDownload() {
    var downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('📥 Je website wordt gedownload!\n\n(Zodra de betaalfunctionaliteit is toegevoegd, ontvang je hier je complete website-bestanden)');
        });
    }
}

// ========================================
// 9. INSTELLINGEN LADEN
// ========================================
function initSettings() {
    var settings = getSettings();
    
    var siteTitle = document.getElementById('site-title');
    if (settings.title && siteTitle) {
        siteTitle.value = settings.title;
    }
    
    var siteDesc = document.getElementById('site-description');
    if (settings.description && siteDesc) {
        siteDesc.value = settings.description;
    }
    
    var primaryColor = document.getElementById('primary-color');
    var primaryColorHex = document.getElementById('primary-color-hex');
    if (settings.primaryColor && primaryColor) {
        primaryColor.value = settings.primaryColor;
        if (primaryColorHex) primaryColorHex.value = settings.primaryColor;
    }
    
    var bgColor = document.getElementById('bg-color');
    var bgColorHex = document.getElementById('bg-color-hex');
    if (settings.bgColor && bgColor) {
        bgColor.value = settings.bgColor;
        if (bgColorHex) bgColorHex.value = settings.bgColor;
    }
    
    var textColor = document.getElementById('text-color');
    var textColorHex = document.getElementById('text-color-hex');
    if (settings.textColor && textColor) {
        textColor.value = settings.textColor;
        if (textColorHex) textColorHex.value = settings.textColor;
    }
    
    // Load pages
    var pageNames = settings.pageNames || { home: 'Home' };
    var select = document.getElementById('page-select');
    var list = document.getElementById('page-list');
    
    if (list) {
        list.innerHTML = '';
        var homeItem = document.createElement('div');
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
        var homeOption = document.createElement('option');
        homeOption.value = 'home';
        homeOption.textContent = 'Home';
        select.appendChild(homeOption);
    }
    
    for (var pageId in pageNames) {
        if (pageId !== 'home') {
            var name = pageNames[pageId];
            
            if (list) {
                var item = document.createElement('div');
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
                var option = document.createElement('option');
                option.value = pageId;
                option.textContent = name;
                select.appendChild(option);
            }
        }
    }
    
    loadPageContent('home');
    setTimeout(updatePreview, 200);
}}
