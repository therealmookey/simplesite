// ========================================
// SIMPLESITE BUILDER - EENVOUDIGE VERSIE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SimpleSite start...');
    
    // NAVIGATIE
    var links = document.querySelectorAll('.admin-nav a');
    var secties = document.querySelectorAll('.admin-section');
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            links.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
            
            secties.forEach(function(s) { s.classList.remove('active'); });
            
            var id = this.getAttribute('data-section');
            var target = document.getElementById('section-' + id);
            if (target) target.classList.add('active');
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
    document.getElementById('add-page').addEventListener('click', function() {
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
    
    // INHOUD LADEN BIJ SELECTIE
    document.getElementById('page-select').addEventListener('change', function() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        var pages = settings.pages || {};
        var page = pages[this.value] || { title: '', content: '' };
        document.getElementById('page-title').value = page.title || '';
        document.getElementById('page-content').value = page.content || '';
    });
    
    // AUTO SAVE
    document.getElementById('page-title').addEventListener('input', autoSave);
    document.getElementById('page-content').addEventListener('input', autoSave);
    
    function autoSave() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        if (!settings.pages) settings.pages = {};
        var id = document.getElementById('page-select').value;
        settings.pages[id] = {
            title: document.getElementById('page-title').value,
            content: document.getElementById('page-content').value
        };
        localStorage.setItem('simplesite_settings', JSON.stringify(settings));
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
    
    // PREVIEW
    function updatePreview() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        var id = document.getElementById('page-select').value;
        var pages = settings.pages || {};
        var page = pages[id] || { title: 'Welkom', content: 'Mijn website' };
        
        var primary = settings.primaryColor || '#2563eb';
        var bg = settings.bgColor || '#ffffff';
        var text = settings.textColor || '#1a1a1a';
        var title = document.getElementById('site-title').value || 'SimpleSite';
        var desc = document.getElementById('site-description').value || '';
        
        var nav = '<span>Home</span>';
        var pageNames = settings.pageNames || { home: 'Home' };
        for (var p in pageNames) {
            if (p !== 'home') {
                nav += '<span style="color:' + (p === id ? primary : text) + ';">' + pageNames[p] + '</span>';
            }
        }
        
        var html = '<div style="padding:1rem 2rem;background:' + bg + ';border-bottom:1px solid #eee;display:flex;justify-content:space-between;"><strong style="color:' + text + ';">' + title + '</strong><div style="display:flex;gap:1.5rem;color:' + text + ';">' + nav + '</div></div>';
        html += '<div style="padding:4rem 2rem;text-align:center;background:' + bg + ';"><h1 style="color:' + text + ';">' + page.title + '</h1><p style="color:#666;">' + page.content + '</p>';
        if (desc) html += '<p style="color:#999;">' + desc + '</p>';
        html += '<div style="margin-top:2rem;"><a href="#" style="background:' + primary + ';color:#fff;padding:0.7rem 2rem;border-radius:6px;text-decoration:none;">Begin nu</a></div></div>';
        html += '<div style="padding:2rem;text-align:center;background:#fafafa;color:#666;">© 2026 SimpleSite</div>';
        
        document.getElementById('preview-site').innerHTML = html;
    }
    
    // INSTELLINGEN LADEN
    function loadSettings() {
        var settings = JSON.parse(localStorage.getItem('simplesite_settings') || '{}');
        if (settings.title) document.getElementById('site-title').value = settings.title;
        if (settings.description) document.getElementById('site-description').value = settings.description;
        if (settings.primaryColor) document.getElementById('primary-color').value = settings.primaryColor;
        if (settings.bgColor) document.getElementById('bg-color').value = settings.bgColor;
        if (settings.textColor) document.getElementById('text-color').value = settings.textColor;
        
        var pageNames = settings.pageNames || { home: 'Home' };
        for (var p in pageNames) {
            if (p !== 'home') {
                var optie = document.createElement('option');
                optie.value = p;
                optie.textContent = pageNames[p];
                document.getElementById('page-select').appendChild(optie);
            }
        }
        updatePreview();
    }
    
    loadSettings();
    console.log('✅ SimpleSite werkt!');
});