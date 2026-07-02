// =============================================
// SIMPLESITE - Export & Download
// =============================================

function generatePreview() {
    const container = document.getElementById('websitePreview');
    if (!container) return;
    
    if (!App.navItems || App.navItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-eye"></i>
                <h3>Geen content om te previewen</h3>
                <p>Voeg eerst pagina's toe in stap 2 (Navigatie)</p>
            </div>
        `;
        return;
    }
    
    const currentPage = App.currentPage || 'index';
    
    let html = `
        <div style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding:15px 30px; background:${App.navBgColor || '#ffffff'}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border-bottom:2px solid #e2e8f0; ${App.navBgImage ? `background-image: url(${App.navBgImage}); background-size: cover; background-position: center;` : ''}">
                <div style="font-size:24px; font-weight:800; color:#2d3748;">
                    ${App.logo ? `<img src="${App.logo}" style="max-height:40px;">` : (App.siteTitle || 'Mijn Website')}
                </div>
                <div style="display:flex; gap:20px; flex-wrap:wrap;" class="site-nav-links">
    `;
    
    App.navItems.forEach(item => {
        const isActive = item.filename === currentPage;
        html += `
            <a href="#" onclick="showPreviewPage('${item.filename}'); return false;" 
               data-filename="${item.filename}"
               style="color:${isActive ? App.primaryColor : '#4a5568'}; text-decoration:none; font-weight:${isActive ? '700' : '500'}; cursor:pointer;">
                ${item.label}
            </a>
        `;
    });
    
    html += `
                </div>
            </div>
            <div style="padding:30px;" id="previewContent">
    `;
    
    html += generatePageContent(currentPage);
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    window.showPreviewPage = function(filename) {
        const contentContainer = document.getElementById('previewContent');
        if (contentContainer) {
            contentContainer.innerHTML = generatePageContent(filename);
        }
        
        const links = document.querySelectorAll('#websitePreview .site-nav-links a');
        links.forEach(link => {
            const linkFilename = link.getAttribute('data-filename');
            if (linkFilename === filename) {
                link.style.color = App.primaryColor || '#4f8cf7';
                link.style.fontWeight = '700';
            } else {
                link.style.color = '#4a5568';
                link.style.fontWeight = '500';
            }
        });
        
        const navItem = App.navItems.find(item => item.filename === filename);
        if (navItem) {
            const titleEl = document.querySelector('#previewContent .page-title');
            if (titleEl) {
                titleEl.textContent = navItem.label;
            }
        }
    };
}

function generatePageContent(filename) {
    const layers = App.layers[filename] || [];
    const bg = App.pageBackgrounds?.[filename] || { color: '#f8fafc', image: null };
    
    let bgStyle = `background: ${bg.color};`;
    if (bg.image) {
        bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
    }
    
    let pageHTML = renderLayersForExport(layers);
    
    const navItem = App.navItems.find(item => item.filename === filename);
    const label = navItem ? navItem.label : filename;
    
    return `
        <div style="${bgStyle} padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
            <div class="page-title" style="font-size:24px; font-weight:700; color:#2d3748; margin-bottom:20px; border-bottom:3px solid ${App.primaryColor || '#4f8cf7'}; padding-bottom:12px;">
                ${label}
            </div>
            ${pageHTML || '<p style="color:#a0aec0;">Geen content op deze pagina</p>'}
        </div>
    `;
}

function renderLayersForExport(layers) {
    let html = '';
    layers.forEach(layer => {
        if (!layer.visible) return;
        
        let contentHTML = layer.content || '';
        
        if (layer.type === 'image' && contentHTML.includes('upload-placeholder')) {
            contentHTML = '<p style="color:#a0aec0;">[Afbeelding plaatsen]</p>';
        }
        
        html += `
            <div class="export-layer export-${layer.type}" style="margin-bottom:12px;">
                ${contentHTML}
            </div>
        `;
    });
    return html;
}

function generateAndDownload() {
    if (!App.navItems || App.navItems.length === 0) {
        alert('Voeg minstens 1 pagina toe aan de navigatie!');
        return;
    }
    
    // Zorg dat Home (index) de eerste is
    const homeIndex = App.navItems.findIndex(item => item.filename === 'index');
    if (homeIndex > 0) {
        const home = App.navItems.splice(homeIndex, 1)[0];
        App.navItems.unshift(home);
    }
    
    const color = App.primaryColor || '#4f8cf7';
    const siteTitle = App.siteTitle || 'Mijn Website';
    const zip = new JSZip();
    
    App.navItems.forEach((item) => {
        const pageName = item.filename;
        const layers = App.layers[pageName] || [];
        const bg = App.pageBackgrounds?.[pageName] || { color: '#f8fafc', image: null };
        
        let bgStyle = `background: ${bg.color};`;
        if (bg.image) {
            bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
        }
        
        let navHTML = '';
        App.navItems.forEach(navItem => {
            const isActive = navItem.filename === pageName;
            navHTML += `<a href="${navItem.filename}.html" style="color:${isActive ? color : '#4a5568'}; text-decoration:none; font-weight:${isActive ? '700' : '500'};">${navItem.label}</a>`;
        });
        
        let navBgStyle = `background: ${App.navBgColor || '#ffffff'};`;
        if (App.navBgImage) {
            navBgStyle += ` background-image: url(${App.navBgImage}); background-size: cover; background-position: center;`;
        }
        
        let navClass = '';
        if (App.navStyle === 'vertical') navClass = 'nav-vertical';
        else if (App.navStyle === 'hamburger') navClass = 'nav-hamburger';
        
        let contentHTML = renderLayersForExport(layers);
        
        const filename = pageName + '.html';
        
        const pageHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle} - ${item.label}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
        
        .site-nav {
            ${navBgStyle}
            padding: 15px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .site-nav .logo {
            font-size: 28px;
            font-weight: 800;
            color: #2d3748;
            text-decoration: none;
        }
        .site-nav .logo span { color: ${color}; }
        .site-nav .logo img { max-height: 50px; }
        .site-nav .nav-links {
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
        }
        .site-nav .nav-links a {
            transition: color 0.2s;
        }
        .site-nav .nav-links a:hover { color: ${color}; }
        
        .nav-vertical { flex-direction: column; align-items: stretch; }
        .nav-vertical .nav-links { flex-direction: column; gap: 10px; }
        
        .nav-hamburger .nav-links { 
            display: none;
            flex-direction: column;
            width: 100%;
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
        }
        .nav-hamburger .nav-links.show { display: flex; }
        .nav-hamburger .hamburger-btn {
            display: block;
            background: none;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 20px;
            cursor: pointer;
        }
        
        .page-content {
            ${bgStyle}
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .page-content h1 {
            color: #2d3748;
            border-bottom: 3px solid ${color};
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        
        .export-layer { margin-bottom: 12px; }
        .export-heading h1 { font-size: 32px; color: #2d3748; }
        .export-heading h2 { font-size: 26px; color: #2d3748; }
        .export-heading h3 { font-size: 20px; color: #2d3748; }
        .export-text p { font-size: 16px; line-height: 1.7; color: #4a5568; }
        .export-image img { max-width: 100%; border-radius: 8px; }
        .export-button .btn-preview { 
            display: inline-block; 
            background: ${color}; 
            color: white; 
            padding: 10px 24px; 
            border-radius: 30px; 
            text-decoration: none; 
            font-weight: 600; 
        }
        .export-button .btn-preview:hover { background: ${color}dd; }
        .export-divider hr { border: none; border-top: 2px solid #e2e8f0; margin: 10px 0; }
        .export-spacer .layer-spacer { min-height: 40px; }
        .export-hero div { border-radius: 12px; }
        .export-card div { border-radius: 12px; }
        
        .site-footer {
            background: #2d3748;
            color: #e2e8f0;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-top: 30px;
        }
        .site-footer a { color: ${color}; text-decoration: none; }
        
        @media (max-width: 768px) {
            .site-nav { flex-direction: column; text-align: center; }
            .site-nav .nav-links { justify-content: center; }
            .nav-vertical .nav-links { align-items: center; }
        }
    </style>
</head>
<body>
    <nav class="site-nav ${navClass}">
        <a href="index.html" class="logo">
            ${App.logo ? `<img src="${App.logo}" alt="Logo">` : `${siteTitle} <span>●</span>`}
        </a>
        <div class="nav-links" id="navLinks">
            ${navHTML}
        </div>
        ${App.navStyle === 'hamburger' ? `<button class="hamburger-btn" onclick="document.getElementById('navLinks').classList.toggle('show')">☰</button>` : ''}
    </nav>

    <div class="page-content">
        <h1>${item.label}</h1>
        ${contentHTML || '<p style="color:#a0aec0;">Geen content</p>'}
    </div>

    <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${siteTitle} - Gemaakt met SimpleSite</p>
    </footer>
</body>
</html>`;
        
        zip.file(filename, pageHTML);
    });
    
    zip.file("style.css", `/* Jouw eigen CSS hier */\n/* Primaire kleur: ${color} */`);
    zip.file("script.js", "// Jouw eigen JavaScript hier");
    
    zip.file("README.md", `# ${siteTitle}

Dit is mijn website gemaakt met SimpleSite.

## Pagina's
${App.navItems.map(i => `- ${i.label} → ${i.filename}.html`).join('\n')}

## Hoe upload ik dit?
1. Upload alle bestanden naar jouw webhosting
2. index.html is de hoofdpagina
3. Pas style.css aan naar wens

---
Gemaakt met SimpleSite
`);
    
    zip.generateAsync({ type: "blob" })
        .then(function(content) {
            saveAs(content, `${siteTitle.toLowerCase().replace(/\s+/g, '-')}-website.zip`);
            
            // ===== MARK CLEAN =====
            markClean();
            
            alert('✅ Download voltooid! Jouw website is klaar om te uploaden.');
        })
        .catch(function(err) {
            alert('Er ging iets mis: ' + err.message);
        });
}

// Expose functions
window.generatePreview = generatePreview;
window.generateAndDownload = generateAndDownload;
window.renderLayersForExport = renderLayersForExport;
window.generatePageContent = generatePageContent;
window.showPreviewPage = showPreviewPage;