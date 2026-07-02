// ========================================
// SIMPLESITE BUILDER - NIEUWE VERSIE
// ========================================

console.log('🔥 NIEUWE admin.js geladen!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SimpleSite start...');
    
    // NAVIGATIE
    var links = document.querySelectorAll('.admin-nav a');
    var secties = document.querySelectorAll('.admin-section');
    
    console.log('Links gevonden:', links.length);
    console.log('Secties gevonden:', secties.length);
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Geklikt op:', this.textContent.trim());
            
            links.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
            
            secties.forEach(function(s) { s.classList.remove('active'); });
            
            var id = this.getAttribute('data-section');
            var target = document.getElementById('section-' + id);
            if (target) {
                target.classList.add('active');
                console.log('Sectie getoond:', id);
            } else {
                console.log('Sectie niet gevonden:', id);
            }
        });
    });
    
    // Eerste sectie tonen
    var eersteLink = document.querySelector('.admin-nav a');
    if (eersteLink) {
        eersteLink.classList.add('active');
        var eersteSectie = document.getElementById('section-general');
        if (eersteSectie) eersteSectie.classList.add('active');
    }
    
    // PAGINA'S TOEVOEGEN
    var addBtn = document.getElementById('add-page');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            var input = document.getElementById('page-name');
            var naam = input.value.trim();
            if (!naam) return alert('Voer een naam in');
            
            var id = naam.toLowerCase().replace(/\s/g, '-');
            var list = document.getElementById('page-list');
            var item = document.createElement('div');
            item.className = 'page-item';
            item.dataset.page = id;
            item.innerHTML = '<span>📄 ' + naam + '</span><span style="color:#6b7280;font-size:0.85rem;">' + id + '.html</span><button onclick="this.parentElement.remove()">✕</button>';
            list.appendChild(item);
            
            var select = document.getElementById('page-select');
            var optie = document.createElement('option');
            optie.value = id;
            optie.textContent = naam;
            select.appendChild(optie);
            
            input.value = '';
        });
    }
    
    // INHOUD LADEN BIJ SELECTIE
    var pageSelect = document.getElementById('page-select');
    if (pageSelect) {
        pageSelect.addEventListener('change', function() {
            var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
            var pages = settings.pages || {};
            var page = pages[this.value] || { title: '', content: '' };
            document.getElementById('page-title').value = page.title || '';
            document.getElementById('page-content').value = page.content || '';
        });
    }
    
    // AUTO SAVE
    var pageTitle = document.getElementById('page-title');
    var pageContent = document.getElementById('page-content');
    
    if (pageTitle) {
        pageTitle.addEventListener('input', autoSave);
    }
    if (pageContent) {
        pageContent.addEventListener('input', autoSave);
    }
    
    function autoSave() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        if (!settings.pages) settings.pages = {};
        var id = document.getElementById('page-select').value;
        settings.pages[id] = {
            title: document.getElementById('page-title').value,
            content: document.getElementById('page-content').value
        };
        localStorage.setItem('simplesite_settings', JSON.stringify(settings));
        updatePreview();
    }
    
    // KLEUREN
    document.querySelectorAll('input[type="color"]').forEach(function(input) {
        input.addEventListener('input', function() {
            var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
            var map = {
                'primary-color': 'primaryColor',
                'bg-color': 'bgColor',
                'text-color': 'textColor'
            };
            settings[map[this.id]] = this.value;
            localStorage.setItem('simplesite_settings', JSON.stringify(settings));
            updatePreview();
        });
    });
    
    // SITE TITLE - live update
    var siteTitle = document.getElementById('site-title');
    if (siteTitle) {
        siteTitle.addEventListener('input', function() {
            var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
            settings.title = this.value;
            localStorage.setItem('simplesite_settings', JSON.stringify(settings));
            updatePreview();
        });
    }
    
    // SITE DESCRIPTION - live update
    var siteDesc = document.getElementById('site-description');
    if (siteDesc) {
        siteDesc.addEventListener('input', function() {
            var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
            settings.description = this.value;
            localStorage.setItem('simplesite_settings', JSON.stringify(settings));
            updatePreview();
        });
    }
    
    // PREVIEW
    function updatePreview() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        var id = document.getElementById('page-select').value;
        var pages = settings.pages || {};
        var page = pages[id] || { title: 'Welkom', content: 'Mijn website' };
        
        var primary = settings.primaryColor || '#2563eb';
        var bg = settings.bgColor || '#ffffff';
        var text = settings.textColor || '#1a1a1a';
        var title = settings.title || 'SimpleSite';
        var desc = settings.description || '';
        
        // Navigatie
        var nav = '<span>Home</span>';
        var pageNames = settings.pageNames || { home: 'Home' };
        for (var p in pageNames) {
            if (p !== 'home') {
                var isActive = (p === id);
                nav += '<span style="color:' + (isActive ? primary : text) + ';' + (isActive ? 'font-weight:600;' : '') + '">' + pageNames[p] + '</span>';
            }
        }
        
        var html = '<div style="padding:1rem 2rem;background:' + bg + ';border-bottom:1px solid #eee;display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;"><strong style="font-size:1.2rem;color:' + text + ';">' + title + '</strong><div style="display:flex;gap:1.5rem;color:' + text + ';flex-wrap:wrap;">' + nav + '</div></div>';
        html += '<div style="padding:4rem 2rem;text-align:center;background:' + bg + ';min-height:200px;"><h1 style="color:' + text + ';font-size:2.5rem;">' + page.title + '</h1><p style="color:#666;font-size:1.1rem;max-width:500px;margin:0 auto;">' + page.content + '</p>';
        if (desc) html += '<p style="color:#999;margin-top:0.5rem;">' + desc + '</p>';
        html += '<div style="margin-top:2rem;"><a href="#" style="background:' + primary + ';color:#fff;padding:0.7rem 2rem;border-radius:6px;text-decoration:none;font-weight:600;">Begin nu</a></div></div>';
        html += '<div style="padding:2rem;text-align:center;background:#fafafa;border-top:1px solid #eee;color:#666;">© 2026 SimpleSite — Simpel. Snel. Professioneel.</div>';
        
        var previewSite = document.getElementById('preview-site');
        if (previewSite) {
            previewSite.innerHTML = html;
        }
    }
    
    // INSTELLINGEN LADEN
    function loadSettings() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        
        if (settings.title) {
            var el = document.getElementById('site-title');
            if (el) el.value = settings.title;
        }
        if (settings.description) {
            var el = document.getElementById('site-description');
            if (el) el.value = settings.description;
        }
        if (settings.primaryColor) {
            var el = document.getElementById('primary-color');
            if (el) el.value = settings.primaryColor;
        }
        if (settings.bgColor) {
            var el = document.getElementById('bg-color');
            if (el) el.value = settings.bgColor;
        }
        if (settings.textColor) {
            var el = document.getElementById('text-color');
            if (el) el.value = settings.textColor;
        }
        
        // Pagina's laden
        var pageNames = settings.pageNames || { home: 'Home' };
        var select = document.getElementById('page-select');
        if (select) {
            // Home bestaat al, voeg andere toe
            for (var p in pageNames) {
                if (p !== 'home') {
                    var optie = document.createElement('option');
                    optie.value = p;
                    optie.textContent = pageNames[p];
                    select.appendChild(optie);
                }
            }
        }
        
        updatePreview();
        console.log('✅ Instellingen geladen!');
    }
    
    loadSettings();
    console.log('✅ SimpleSite is klaar!');
});