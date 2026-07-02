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
    
    // Genereer navigatie HTML
    let navHTML = '';
    App.navItems.forEach(item => {
        navHTML += `<a href="${item.link}" style="color:${App.primaryColor}; text-decoration:none; font-weight:500;">${item.label}</a>`;
    });
    
    let navBgStyle = 'background: ' + (App.navBgColor || '#ffffff') + ';';
    if (App.navBgImage) {
        navBgStyle += ` background-image: url(${App.navBgImage}); background-size: cover; background-position: center;`;
    }
    
    let html = `
        <div style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding:15px 30px; ${navBgStyle} display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border-bottom:2px solid #e2e8f0;">
                <div style="font-size:24px; font-weight:800; color:#2d3748;">
                    ${App.logo ? `<img src="${App.logo}" style="max-height:40px;">` : (App.siteTitle || 'Mijn Website')}
                </div>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                    ${navHTML}
                </div>
            </div>
            <div style="padding:30px;">
    `;
    
    let hasContent = false;
    App.navItems.forEach(item => {
        const pageName = item.link.replace('#', '');
        const blocks = pageBlocks[pageName] || [];
        const bg = App.pageBackgrounds?.[pageName] || { color: '#f8fafc', image: null };
        
        let bgStyle = `background: ${bg.color};`;
        if (bg.image) {
            bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
        }
        
        let pageHTML = renderBlocksForExport(blocks);
        
        if (pageHTML) hasContent = true;
        
        html += `
            <div style="${bgStyle} padding:20px; border-radius:12px; margin-bottom:20px; border:1px solid #e2e8f0;">
                <h3 style="color:#2d3748; border-bottom:3px solid ${App.primaryColor || '#4f8cf7'}; padding-bottom:8px; margin-bottom:15px;">
                    ${item.label}
                </h3>
                ${pageHTML || '<p style="color:#a0aec0;">Geen content op deze pagina</p>'}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderBlocksForExport(blocks, level = 0) {
    let html = '';
    blocks.forEach(block => {
        const info = BLOCK_TYPES[block.type] || { icon: 'fa-cube', label: 'Blok' };
        const isContainer = info?.isContainer || false;
        
        let blockStyle = '';
        if (block.settings) {
            if (block.settings.background) blockStyle += `background: ${block.settings.background};`;
            if (block.settings.padding) blockStyle += `padding: ${block.settings.padding};`;
            if (block.settings.color) blockStyle += `color: ${block.settings.color};`;
            if (block.settings.textAlign) blockStyle += `text-align: ${block.settings.textAlign};`;
            if (block.settings.fontSize) blockStyle += `font-size: ${block.settings.fontSize};`;
        }
        
        let contentHTML = block.content || '';
        
        if (block.type === 'columns') {
            const gap = block.settings?.gap || '20px';
            const cols = block.columns || 2;
            const children = block.children || [];
            
            let colHTML = '';
            const perCol = Math.ceil(children.length / cols);
            for (let i = 0; i < cols; i++) {
                const colBlocks = children.slice(i * perCol, (i + 1) * perCol);
                colHTML += `
                    <div style="flex:1; min-width:200px;">
                        ${renderBlocksForExport(colBlocks, level + 1)}
                    </div>
                `;
            }
            
            contentHTML = `
                <div style="display:flex; flex-wrap:wrap; gap:${gap};">
                    ${colHTML}
                </div>
            `;
        } else if (isContainer && block.children && block.children.length > 0) {
            contentHTML = renderBlocksForExport(block.children, level + 1);
        }
        
        if (block.type === 'button') {
            const text = block.settings?.text || 'Klik hier';
            const link = block.settings?.link || '#';
            const color = block.settings?.color || '#4f8cf7';
            contentHTML = `<a href="${link}" style="display:inline-block; background:${color}; color:white; padding:10px 24px; border-radius:30px; text-decoration:none; font-weight:600;">${text}</a>`;
        }
        
        if (block.type === 'image' && contentHTML.includes('upload-placeholder')) {
            contentHTML = '<p style="color:#a0aec0;">[Afbeelding plaatsen]</p>';
        }
        
        if (block.type === 'spacer') {
            const height = block.settings?.height || '40px';
            contentHTML = `<div style="height:${height};"></div>`;
        }
        
        if (block.type === 'divider') {
            const color = block.settings?.color || '#e2e8f0';
            const thickness = block.settings?.thickness || '2px';
            contentHTML = `<hr style="border:none; border-top:${thickness} solid ${color}; margin:10px 0;">`;
        }
        
        const className = block.settings?.className || '';
        
        html += `
            <div class="export-block export-${block.type} ${className}" style="${blockStyle} margin-bottom:12px;">
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
    
    const color = App.primaryColor || '#4f8cf7';
    const siteTitle = App.siteTitle || 'Mijn Website';
    
    // Genereer navigatie
    let navHTML = '';
    App.navItems.forEach(item => {
        navHTML += `<a href="${item.link}">${item.label}</a>`;
    });
    
    let navStyle = `background: ${App.navBgColor || '#ffffff'};`;
    if (App.navBgImage) {
        navStyle += ` background-image: url(${App.navBgImage}); background-size: cover; background-position: center;`;
    }
    
    let navClass = '';
    if (App.navStyle === 'vertical') navClass = 'nav-vertical';
    else if (App.navStyle === 'hamburger') navClass = 'nav-hamburger';
    
    // Genereer pagina's
    let pagesHTML = '';
    App.navItems.forEach(item => {
        const pageName = item.link.replace('#', '');
        const blocks = pageBlocks[pageName] || [];
        const bg = App.pageBackgrounds?.[pageName] || { color: '#f8fafc', image: null };
        
        let bgStyle = `background: ${bg.color};`;
        if (bg.image) {
            bgStyle += ` background-image: url(${bg.image}); background-size: cover; background-position: center;`;
        }
        
        let contentHTML = renderBlocksForExport(blocks);
        
        pagesHTML += `
            <section class="export-page" id="${pageName}" style="${bgStyle} padding:30px; border-radius:12px; margin-bottom:30px;">
                <h2 style="color:#2d3748; border-bottom:3px solid ${color}; padding-bottom:12px; margin-bottom:20px;">
                    ${item.label}
                </h2>
                ${contentHTML || '<p style="color:#a0aec0;">Geen content</p>'}
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
        
        .export-block { margin-bottom: 12px; }
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
        .export-spacer .block-spacer { min-height: 40px; }
        .export-hero div { border-radius: 12px; }
        .export-card div { border-radius: 12px; }
        
        .export-columns .columns-wrapper {
            display: flex;
            flex-wrap: wrap;
        }
        .export-columns .columns-wrapper > div {
            flex: 1;
            min-width: 200px;
        }
        
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
            .export-columns .columns-wrapper { flex-direction: column; }
            .export-columns .columns-wrapper > div { min-width: auto; }
        }
    </style>
</head>
<body>
    <nav class="site-nav ${navClass}">
        <a href="#" class="logo">
            ${App.logo ? `<img src="${App.logo}" alt="Logo">` : `${siteTitle} <span>●</span>`}
        </a>
        <div class="nav-links" id="navLinks">
            ${navHTML}
        </div>
        ${App.navStyle === 'hamburger' ? `<button class="hamburger-btn" onclick="document.getElementById('navLinks').classList.toggle('show')">☰</button>` : ''}
    </nav>

    ${pagesHTML}

    <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${siteTitle} - Gemaakt met SimpleSite</p>
    </footer>
</body>
</html>`;

    const zip = new JSZip();
    zip.file("index.html", exportHTML);
    zip.file("style.css", `/* Jouw eigen CSS hier */\n/* Primaire kleur: ${color} */`);
    zip.file("script.js", "// Jouw eigen JavaScript hier");
    
    zip.file("README.md", `# ${siteTitle}

Dit is mijn website gemaakt met SimpleSite.

## Pagina's
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

// Expose functions
window.generatePreview = generatePreview;
window.generateAndDownload = generateAndDownload;
window.renderBlocksForExport = renderBlocksForExport;