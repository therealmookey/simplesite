// =============================================
// SIMPLESITE - Volledige Functionaliteit
// =============================================

// ===== STATE =====
let blocks = [];
let blockIdCounter = 0;
let editingBlockId = null;

// ===== INCLUDES LADEN =====
async function loadIncludes() {
    try {
        // Header laden (relatief pad vanaf root)
        const headerRes = await fetch('assets/includes/header.html');
        const headerHTML = await headerRes.text();
        document.getElementById('header-placeholder').innerHTML = headerHTML;

        // Footer laden
        const footerRes = await fetch('assets/includes/footer.html');
        const footerHTML = await footerRes.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;
    } catch (error) {
        console.log('Includes laden mislukt, gebruik fallback');
        // Fallback als includes niet geladen kunnen worden
        document.getElementById('header-placeholder').innerHTML = `
            <header class="site-header">
                <a href="#" class="logo">Simple<span>Site</span></a>
                <nav class="header-nav">
                    <a href="#"><i class="fas fa-home"></i> Builder</a>
                    <a href="#"><i class="fas fa-info-circle"></i> Over</a>
                    <a href="#"><i class="fas fa-envelope"></i> Contact</a>
                </nav>
            </header>
        `;
        document.getElementById('footer-placeholder').innerHTML = `
            <footer class="site-footer">
                <div class="footer-links">
                    <a href="#">Over SimpleSite</a>
                    <a href="#">Privacy</a>
                    <a href="#">Contact</a>
                </div>
                <p>&copy; 2026 SimpleSite - Maak jouw eigen website</p>
            </footer>
        `;
    }
}

// ===== BLOKKEN FUNCTIES =====
function getBlockTemplate(type) {
    const templates = {
        heading: {
            type: 'heading',
            content: '<h1>Klik om te bewerken</h1>',
            display: 'Koptekst'
        },
        text: {
            type: 'text',
            content: '<p>Klik hier om je tekst aan te passen. Dit is een tekstblok voor jouw website.</p>',
            display: 'Tekstblok'
        },
        image: {
            type: 'image',
            content: '<div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><br>Klik om afbeelding te uploaden</div>',
            display: 'Afbeelding'
        },
        button: {
            type: 'button',
            content: '<a href="#" class="btn-preview">Klik hier</a>',
            display: 'Knop'
        }
    };
    return templates[type] || templates.text;
}

function addBlock(type) {
    const template = getBlockTemplate(type);
    const block = {
        id: ++blockIdCounter,
        type: template.type,
        content: template.content,
        display: template.display
    };
    blocks.push(block);
    renderBlocks();
}

function deleteBlock(id) {
    blocks = blocks.filter(b => b.id !== id);
    renderBlocks();
}

function moveBlock(id, direction) {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    renderBlocks();
}

function updateBlockContent(id, newContent) {
    const block = blocks.find(b => b.id === id);
    if (block) {
        block.content = newContent;
        renderBlocks();
    }
}

// ===== RENDER BLOKKEN =====
function renderBlocks() {
    const container = document.getElementById('blocksContainer');
    const emptyState = document.getElementById('emptyState');

    if (blocks.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    let html = '';
    blocks.forEach((block, index) => {
        const isFirst = index === 0;
        const isLast = index === blocks.length - 1;

        html += `
            <div class="block-item block-${block.type}" data-id="${block.id}">
                <div class="block-tools">
                    <button onclick="moveBlock(${block.id}, 'up')" ${isFirst ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="moveBlock(${block.id}, 'down')" ${isLast ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button onclick="deleteBlock(${block.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="block-content" contenteditable="true" 
                     data-id="${block.id}"
                     oninput="updateBlockContent(${block.id}, this.innerHTML)"
                     onfocus="editingBlockId = ${block.id}">
                    ${block.content}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Speciale handling voor image blocks
    document.querySelectorAll('.block-image .block-content').forEach(el => {
        const id = parseInt(el.dataset.id);
        const block = blocks.find(b => b.id === id);
        
        // Als er een upload placeholder is, voeg click handler toe
        const placeholder = el.querySelector('.upload-placeholder');
        if (placeholder) {
            placeholder.style.cursor = 'pointer';
            placeholder.addEventListener('click', function(e) {
                e.stopPropagation();
                uploadImage(id);
            });
        }
    });
}

// ===== AFBEELDING UPLOAD =====
function uploadImage(blockId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const imgHTML = `<img src="${ev.target.result}" alt="Geüploade afbeelding">`;
                updateBlockContent(blockId, imgHTML);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// ===== WEBSITE EXPORT =====
function exportWebsite() {
    if (blocks.length === 0) {
        alert('Je hebt nog geen blokken toegevoegd! Voeg eerst wat content toe.');
        return null;
    }

    // Genereer de HTML voor de geëxporteerde website
    let blocksHTML = '';
    blocks.forEach(block => {
        blocksHTML += `<div class="export-block export-${block.type}">${block.content}</div>`;
    });

    const exportHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mijn SimpleSite Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { max-width: 1100px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
        .export-block { background: white; padding: 30px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .export-heading h1 { font-size: 36px; color: #2d3748; }
        .export-text p { font-size: 18px; line-height: 1.7; color: #4a5568; }
        .export-image img { max-width: 100%; border-radius: 8px; }
        .export-button .btn-preview { display: inline-block; background: #4f8cf7; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; }
        .export-button .btn-preview:hover { background: #3a70d4; }
        .footer-credit { text-align: center; color: #a0aec0; margin-top: 40px; font-size: 14px; }
        .footer-credit a { color: #4f8cf7; text-decoration: none; }
    </style>
</head>
<body>
    ${blocksHTML}
    <div class="footer-credit">
        Gemaakt met <a href="#">SimpleSite</a> &hearts;
    </div>
</body>
</html>`;

    return exportHTML;
}

// ===== DOWNLOAD ALS ZIP =====
function downloadWebsite() {
    const htmlContent = exportWebsite();
    if (!htmlContent) return;

    const zip = new JSZip();
    
    // Voeg de HTML toe
    zip.file("index.html", htmlContent);
    
    // Voeg een lege CSS en JS toe voor als de klant later wil uitbreiden
    zip.file("style.css", "/* Jouw eigen CSS hier */");
    zip.file("script.js", "// Jouw eigen JavaScript hier");
    
    // Maak een README
    zip.file("README.md", `# Mijn SimpleSite Website

Dit is mijn website gemaakt met SimpleSite.

## Hoe upload ik dit?

1. Upload alle bestanden naar jouw webhosting
2. index.html is de hoofdpagina
3. style.css bevat alle styling (pas aan naar wens)
4. script.js bevat JavaScript (pas aan naar wens)

## Support

Heb je vragen? Neem contact op via de SimpleSite website.
`);
    
    // Genereer de zip
    zip.generateAsync({ type: "blob" })
        .then(function(content) {
            saveAs(content, "mijn-simplesite-website.zip");
            alert('✅ Download voltooid! Je website is klaar om te uploaden.');
        })
        .catch(function(err) {
            alert('Er ging iets mis bij het genereren van de ZIP: ' + err.message);
        });
}

// ===== BETALING =====
function openPaymentModal() {
    if (blocks.length === 0) {
        alert('⚠️ Je hebt nog geen blokken toegevoegd! Voeg eerst content toe voordat je koopt.');
        return;
    }
    document.getElementById('paymentModal').style.display = 'block';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function processPayment(method) {
    // Simuleer betaling
    const modal = document.getElementById('paymentModal');
    const content = modal.querySelector('.modal-content');
    
    // Toon loading
    content.innerHTML = `
        <div style="text-align:center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size:48px; color:#4f8cf7;"></i>
            <h2 style="margin-top:20px;">Verwerking...</h2>
            <p>Jouw betaling via ${method} wordt verwerkt.</p>
        </div>
    `;

    // Simuleer wachttijd
    setTimeout(() => {
        content.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <i class="fas fa-check-circle" style="font-size:48px; color:#38a169;"></i>
                <h2 style="margin-top:20px;">✅ Betaling gelukt!</h2>
                <p>Jouw website wordt nu voorbereid...</p>
            </div>
        `;

        setTimeout(() => {
            // Sluit modal en start download
            closePaymentModal();
            downloadWebsite();
            
            // Reset modal content
            setTimeout(() => {
                document.querySelector('.modal-content').innerHTML = `
                    <span class="close-modal">&times;</span>
                    <h2><i class="fas fa-credit-card"></i> Betaal voor jouw website</h2>
                    <div class="payment-details">
                        <p><strong>Product:</strong> SimpleSite Website</p>
                        <p><strong>Prijs:</strong> €49,- (eenmalig)</p>
                        <p><strong>Wat krijg je:</strong></p>
                        <ul>
                            <li>✅ Complete HTML/CSS/JS bestanden</li>
                            <li>✅ Eigen domein klaar om te uploaden</li>
                            <li>✅ Alle blokken zoals jij ze hebt gemaakt</li>
                            <li>✅ Geen verborgen kosten</li>
                        </ul>
                    </div>
                    <div class="payment-methods">
                        <button class="pay-btn" data-method="ideal">
                            <i class="fas fa-university"></i> iDEAL
                        </button>
                        <button class="pay-btn" data-method="creditcard">
                            <i class="fas fa-credit-card"></i> Creditcard
                        </button>
                        <button class="pay-btn" data-method="paypal">
                            <i class="fab fa-paypal"></i> PayPal
                        </button>
                    </div>
                    <p class="payment-note">🔒 Veilige betaling - Simulatie modus</p>
                `;
                // Herkoppel event listeners
                document.querySelector('.close-modal').onclick = closePaymentModal;
                document.querySelectorAll('.pay-btn').forEach(btn => {
                    btn.onclick = function() {
                        processPayment(this.dataset.method);
                    };
                });
            }, 500);
        }, 1500);
    }, 1500);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Laad includes
    loadIncludes();

    // Blok toevoegen knoppen
    document.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            addBlock(type);
        });
    });

    // Purchase knop
    document.getElementById('purchaseBtn').addEventListener('click', openPaymentModal);

    // Modal sluiten
    document.querySelector('.close-modal').addEventListener('click', closePaymentModal);
    
    // Modal sluiten bij klik buiten modal
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('paymentModal');
        if (e.target === modal) {
            closePaymentModal();
        }
    });

    // Betalingsknoppen
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            processPayment(this.dataset.method);
        });
    });

    // Keyboard shortcut: Escape sluit modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePaymentModal();
        }
    });
});

// ===== INITIALISATIE =====
console.log('🚀 SimpleSite geladen!');
console.log('📝 Voeg blokken toe via de sidebar.');
console.log('💳 Klik op "Website Kopen" om te downloaden.');