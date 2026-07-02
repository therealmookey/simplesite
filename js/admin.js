// ========================================
// ADMIN NAVIGATIE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
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
        });
    });

    // ========================================
    // OPSLAAN FUNCTIONALITEIT
    // ========================================

    const saveBtn = document.getElementById('save-general');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const title = document.getElementById('site-title').value;
            const description = document.getElementById('site-description').value;
            
            // Sla op in localStorage
            const settings = {
                title: title,
                description: description
            };
            localStorage.setItem('simplesite_settings', JSON.stringify(settings));
            
            // Feedback
            const original = this.textContent;
            this.textContent = '✓ Opgeslagen!';
            this.style.background = '#2563eb';
            
            setTimeout(() => {
                this.textContent = original;
                this.style.background = '';
            }, 1500);
        });
    }

    // ========================================
    // PAGINA TOEVOEGEN
    // ========================================

    const addPageBtn = document.getElementById('add-page');
    if (addPageBtn) {
        addPageBtn.addEventListener('click', function() {
            const input = document.getElementById('page-name');
            const name = input.value.trim();
            
            if (name) {
                const list = document.getElementById('page-list');
                const item = document.createElement('div');
                item.className = 'page-item';
                item.innerHTML = `
                    <span>${name}</span>
                    <span style="color:#6b7280;font-size:0.85rem;">${name.toLowerCase().replace(/\s/g, '-')}.html</span>
                `;
                list.appendChild(item);
                input.value = '';
            }
        });
    }

    // ========================================
    // DESIGN KLEUREN
    // ========================================

    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Preview van kleur aanpassing
            console.log(`Kleur gewijzigd: ${this.id} = ${this.value}`);
        });
    });

    // ========================================
    // DOWNLOAD
    // ========================================

    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('📥 Je website wordt gedownload!\n\n(Zodra de betaalfunctionaliteit is toegevoegd, ontvang je hier je complete website-bestanden)');
        });
    }

    // ========================================
    // OPGESLAGEN INSTELLINGEN LADEN
    // ========================================

    function loadSettings() {
        const saved = localStorage.getItem('simplesite_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                if (settings.title) {
                    document.getElementById('site-title').value = settings.title;
                }
                if (settings.description) {
                    document.getElementById('site-description').value = settings.description;
                }
            } catch(e) {
                console.log('Geen instellingen gevonden');
            }
        }
    }

    loadSettings();

    console.log('🚀 SimpleSite Builder is klaar!');
});