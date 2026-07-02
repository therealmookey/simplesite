// =============================================
// SIMPLESITE - Export & Download
// =============================================

function generatePreview() {
    const container = document.getElementById('websitePreview');
    
    let html = '';
    App.pages.forEach(page => {
        const layers = App.layers[page] || [];
        let pageHTML = '';
        layers.forEach(layer => {
            if (layer.visible) {
                pageHTML += `<div class="preview-layer preview-${layer.type}">${layer.content}</div>`;
            }
        });
        
        html += `
            <div class="preview-page">
                <h3>${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                ${pageHTML || '<p style="color:#a0aec0;">Geen content op deze pagina</p>'}
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="color:#a0aec0;">Voeg content toe om een preview te zien</p>';
}

function generateAndDownload() {
    if (App.pages.length === 0) {
        alert('Voeg minstens 1 pagina toe!');
        return;
    }
    
    // Genereer HTML voor export
    let pagesHTML = '';
    App.pages.forEach(page => {
        const layers = App.layers[page] || [];
        let layerHTML = '';
        layers.forEach(layer => {
            if (layer.visible) {
                layerHTML += `<div class="export-layer export-${layer.type}">${layer.content}</div>`;
            }
        });
        
        pagesHTML += `
            <section class="export-page" id="page-${page}">
                <h2>${page.charAt(0).toUpperCase() + page.slice(1)}</h2>
                ${layerHTML || '<p style="color:#a0aec0;">Geen content</p>'}
            </section>
        `;
    });
    
    const color = App.primaryColor || '#4f8cf7';
    const siteTitle = App.siteTitle || 'Mijn Website';
    const logoHTML = App.logo ? `<img src="${App.logo}" alt="Logo" style="max-height:50px;">` : `<h1 style="color:${color};">${siteTitle}</h1>`;
    
    const exportHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { max-width: 1100px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
        
        .site-header { background: white; padding: 20px 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .site-header .logo { font-size: 28px; font-weight: 800; color: #2d3748; text-decoration: none; }
        .site-header .logo span { color: ${color}; }
        
        .site-nav { display: flex; gap: 20px; flex-wrap: wrap; }
        .site-nav a { color: #4a5568; text-decoration: none; font-weight: 500; }
        .site-nav a:hover { color: ${color}; }
        
        .export-page { background: white; padding: 30px; margin-bottom: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .export-page h2 { color: #2d3748; border-bottom: 3px solid ${color}; padding-bottom: 12px; margin-bottom: 20px; }
        
        .export-heading h1 { font-size: 32px; color: #2d3748; }
        .export-heading h2 { font-size: 26px; color: #2d3748; }
        .export-heading h3 { font-size: 20px; color: #2d3748; }
        .export-text p { font-size: 16px; line-height: 1.7; color: #4a5568; }
        .export-image img { max-width: 100%; border-radius: 8px; }
        .export-button .btn-preview { display: inline-block; background: ${color}; color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; font-weight: 600; }
        .export-button .btn-preview:hover { background: ${color}dd; }
        .export-divider hr { border: none; border-top: 2px solid #e2e8f0; margin: 10px 0; }
        .export-spacer .layer-spacer { min-height: 40px; }
        
        .site-footer { background: #2d3748; color: #e2e8f0; padding: 30px; border-radius: 12px; text-align: center; margin-top: 30px; }
        .site-footer a { color: ${color}; text-decoration: none; }
        
        @media (max-width: 768px) {
            .site-header { flex-direction: column; text-align: center; }
            .site-nav { justify-content: center; }
        }
    </style>
</head>
<body>
    <header class="site-header">
        <a href="#" class="logo">${siteTitle} <span>●</span></a>
        <nav class="site-nav">
            ${App.pages.map(p => `<a href="#page-${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</a>`).join('')}
        </nav>
    </header>

    ${pagesHTML}

    <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${siteTitle} - Gemaakt met SimpleSite</p>
    </footer>
</body>
</html>`;

    // Download als ZIP
    const zip = new JSZip();
    zip.file("index.html", exportHTML);
    zip.file("style.css", "/* Jouw eigen CSS hier */\n/* Primaire kleur: " + color + " */");
    zip.file("script.js", "// Jouw eigen JavaScript hier");
    
    zip.file("README.md", `# ${siteTitle}

Dit is mijn website gemaakt met SimpleSite.

## Pagina's
${App.pages.map(p => `- ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('\n')}

## Hoe upload ik dit?
1. Upload alle bestanden naar jouw webhosting
2. index.html is de hoofdpagina
3. style.css bevat alle styling
4. script.js bevat JavaScript

## Support
Heb je vragen? Neem contact op via SimpleSite.
`);
    
    zip.generateAsync({ type: "blob" })
        .then(function(content) {
            saveAs(content, `${siteTitle.toLowerCase().replace(/\\s+/g, '-')}-website.zip`);
            alert('✅ Download voltooid! Jouw website is klaar.');
        })
        .catch(function(err) {
            alert('Er ging iets mis: ' + err.message);
        });
}