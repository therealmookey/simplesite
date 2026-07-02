// =============================================
// SIMPLESITE - Export & Download
// =============================================

function generatePreview() {
    const container = document.getElementById('websitePreview');
    
    // Genereer navigatie HTML
    let navHTML = '';
    App.navItems.forEach(item => {
        navHTML += `<a href="${item.link}" style="color:${App.primaryColor}; text-decoration:none; font-weight:500;">${item.label}</a>`;
    });
    
    // Stijl voor navigatie
    let navBgStyle = 'background: ' + App.navBgColor + ';';
    if (App.navBgImage) {
        navBgStyle += ` background-image: url(${App.navBgImage}); background-size: cover; background-position: center;`;
    }
    
    let html = `
        <div style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <!-- Navigatie preview -->
            <div style="padding:15px 30px; ${navBgStyle} display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border-bottom:2px solid #e2e8f0;">
                <div style="font-size:24px; font-weight:800; color:#2d3748;">
                    ${App.logo ? `<img src="${App.logo}" style="max-height:40px;">` : App.siteTitle}
                </div>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                    ${navHTML || '<span style="color:#a0aec0;">Geen navigatie items</span>'}
                </div>
            </div>
            
            <!-- Pagina's preview -->
            <div style="padding:30px;">
    `;
    
    App.pages.forEach(page => {
        const layers = App.layers[page] || [];
        const bg = App.pageBackgrounds[page] || { color: '#f8fafc', image: null };
        
        let bgStyle = `background: ${bg.color};`;
        if (bg.image) {
            bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
        }
        
        let pageHTML = '';
        layers.forEach(layer => {
            if (layer.visible) {
                let layerStyle = '';
                if (layer.background) layerStyle += `background: ${layer.background};`;
                if (layer.padding) layerStyle += `padding: ${layer.padding};`;
                
                pageHTML += `<div class="preview-layer preview-${layer.type}" style="${layerStyle} margin-bottom:12px;">${layer.content}</div>`;
            }
        });
        
        html += `
            <div class="preview-page" style="${bgStyle} padding:20px; border-radius:12px; margin-bottom:20px; border:1px solid #e2e8f0;">
                <h3 style="color:#2d3748; border-bottom:3px solid ${App.primaryColor}; padding-bottom:8px; margin-bottom:15px;">
                    ${page.charAt(0).toUpperCase() + page.slice(1)}
                </h3>
                ${pageHTML || '<p style="color:#a0aec0;">Geen content op deze pagina</p>'}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html || '<p style="color:#a0aec0;">Voeg content toe om een preview te zien</p>';
}

function generateAndDownload() {
    if (App.pages.length === 0) {
        alert('Voeg minstens 1 pagina toe!');
        return;
    }
    
    const color = App.primaryColor || '#4f8cf7';
    const siteTitle = App.siteTitle || 'Mijn Website';
    
    // Genereer navigatie HTML
    let navHTML = '';
    App.navItems.forEach(item => {
        navHTML += `<a href="${item.link}">${item.label}</a>`;
    });
    
    let navStyle = `background: ${App.navBgColor};`;
    if (App.navBgImage) {
        navStyle += ` background-image: url(${App.navBgImage}); background-size: cover; background-position: center;`;
    }
    
    let navClass = '';
    if (App.navStyle === 'vertical') {
        navClass = 'nav-vertical';
    } else if (App.navStyle === 'hamburger') {
        navClass = 'nav-hamburger';
    }
    
    // Genereer pagina's
    let pagesHTML = '';
    App.pages.forEach(page => {
        const layers = App.layers[page] || [];
        const bg = App.pageBackgrounds[page] || { color: '#f8fafc', image: null };
        
        let bgStyle = `background: ${bg.color};`;
        if (bg.image) {
            bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
        }
        
        let layerHTML = '';
        layers.forEach(layer => {
            if (layer.visible) {
                let layerStyle = '';
                if (layer.background) layerStyle += `background: ${layer.background};`;
                if (layer.padding) layerStyle += `padding: ${layer.padding};`;
                layerHTML += `<div class="export-layer export-${layer.type}" style="${layerStyle} margin-bottom:12px;">${layer.content}</div>`;
            }
        });
        
        pagesHTML += `
            <section class="export-page" id="page-${page}" style="${bgStyle} padding:30px; border-radius:12px; margin-bottom:30px;">
                <h2 style="color:#2d3748; border-bottom:3px solid ${color}; padding-bottom:12px; margin-bottom:20px;">
                    ${page.charAt(0).toUpperCase() + page.slice(1)}
                </h2>
                ${layerHTML || '<p style="color:#a0aec0;">Geen content</p>'}
            </section>
        `;
    });
    
    const exportHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
        
        /* ===== NAVIGATIE ===== */
        .site-nav {
            ${navStyle}
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
            color: #4a5568;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        .site-nav .nav-links a:hover { color: ${color}; }
        
        /* Verticale navigatie */
        .nav-vertical { flex-direction: column; align-items: stretch; }
        .nav-vertical .nav-links { flex-direction: column; gap: 10px; }
        
        /* Hamburger navigatie */
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
        
        /* ===== PAGINA'S ===== */
        .export-page {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .export-page h2 {
            color: #2d3748;
            border-bottom: 3px solid ${color};
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        
        /* ===== LAYER TYPES ===== */
        .export-heading h1 { font-size: 32px; color: #2d3748; }
        .export-heading h2 { font-size: 26px; color: #2d3748; }
        .export-heading h3 { font-size: 20px; color: #2d3748; }
        .export-text p { font-size: 16px; line-height: 1.7; color: #4a5568; }
        .export-image img { max-width: 100%; border-radius: 8px; }
        .export-image .upload-placeholder { display: none; }
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
        
        /* ===== FOOTER ===== */
        .site-footer {
            background: #2d3748;
            color: #e2e8f0;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-top: 30px;
        }
        .site-footer a { color: ${color}; text-decoration: none; }
        
        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
            .site-nav { flex-direction: column; text-align: center; }
            .site-nav .nav-links { justify-content: center; }
            .nav-vertical .nav-links { align-items: center; }
        }
    </style>
</head>
<body>
    <!-- NAVIGATIE -->
    <nav class="site-nav ${navClass}">
        <a href="#" class="logo">
            ${App.logo ? `<img src="${App.logo}" alt="Logo">` : `${siteTitle} <span>●</span>`}
        </a>
        <div class="nav-links" id="navLinks">
            ${navHTML || '<span style="color:#a0aec0;">Geen navigatie</span>'}
        </div>
        ${App.navStyle === 'hamburger' ? `<button class="hamburger-btn" onclick="document.getElementById('navLinks').classList.toggle('show')">☰</button>` : ''}
    </nav>

    <!-- PAGINA'S -->
    ${pagesHTML}

    <!-- FOOTER -->
    <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${siteTitle} - Gemaakt met SimpleSite</p>
    </footer>
</body>
</html>`;

    // Download als ZIP
    const zip = new JSZip();
    zip.file("index.html", exportHTML);
    zip.file("style.css", `/* Jouw eigen CSS hier */\n/* Primaire kleur: ${color} */`);
    zip.file("script.js", "// Jouw eigen JavaScript hier");
    
    zip.file("README.md", `# ${siteTitle}

Dit is mijn website gemaakt met SimpleSite.

## Pagina's
${App.pages.map(p => `- ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('\n')}

## Navigatie
${App.navItems.map(i => `- ${i.label} → ${i.link}`).join('\n')}

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
            alert('✅ Download voltooid! Jouw website is klaar.');
        })
        .catch(function(err) {
            alert('Er ging iets mis: ' + err.message);
        });
}