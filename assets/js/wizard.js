// =============================================
// SIMPLESITE - Wizard (Stappenplan)
// =============================================

function initWizard() {
    const steps = document.querySelectorAll('.step');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');

    // Initialize state - ALLES LEEG
    if (!App.navItems) {
        App.navItems = [];
    }
    if (!App.pageBackgrounds) {
        App.pageBackgrounds = {};
    }
    if (!App.layers) {
        App.layers = {};
    }

    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.step);
            goToStep(stepNum);
        });
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = App.currentStep;
            if (currentStep < 4) {
                if (currentStep === 1) {
                    const title = document.getElementById('siteTitle').value.trim();
                    if (!title) {
                        alert('Vul een website titel in!');
                        return;
                    }
                    App.siteTitle = title;
                    App.primaryColor = document.getElementById('primaryColor').value;
                    
                    const logoFile = document.getElementById('logoUpload').files[0];
                    if (logoFile) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            App.logo = e.target.result;
                        };
                        reader.readAsDataURL(logoFile);
                    }
                }
                
                if (currentStep === 2) {
                    App.navStyle = document.getElementById('navStyle').value;
                    App.navBgColor = document.getElementById('navBgColor').value;
                    
                    const navBgFile = document.getElementById('navBgImage').files[0];
                    if (navBgFile) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            App.navBgImage = e.target.result;
                        };
                        reader.readAsDataURL(navBgFile);
                    }
                }
                
                goToStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (App.currentStep > 1) {
                goToStep(App.currentStep - 1);
            }
        });
    });

    // ===== NAVIGATIE ITEMS =====
    renderNavItems();

    document.getElementById('addNavItemBtn').addEventListener('click', function() {
        const label = document.getElementById('newNavItemLabel').value.trim();
        const filename = document.getElementById('newNavItemLink').value.trim();
        
        if (!label) {
            alert('Voer een label in voor het menu item!');
            return;
        }
        if (!filename) {
            alert('Voer een bestandsnaam in (bijv. index)');
            return;
        }
        
        // Maak de bestandsnaam veilig
        const safeFilename = filename.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (!safeFilename) {
            alert('Ongeldige bestandsnaam. Gebruik alleen letters, cijfers en streepjes.');
            return;
        }
        
        // Check of bestandsnaam al bestaat
        if (App.navItems.some(item => item.filename === safeFilename)) {
            alert('Deze bestandsnaam bestaat al!');
            return;
        }
        
        App.navItems.push({ 
            label: label, 
            filename: safeFilename,
            link: safeFilename + '.html'
        });
        
        if (!App.layers[safeFilename]) {
            App.layers[safeFilename] = [];
        }
        if (!App.pageBackgrounds[safeFilename]) {
            App.pageBackgrounds[safeFilename] = { color: '#f8fafc', image: null };
        }
        
        document.getElementById('newNavItemLabel').value = '';
        document.getElementById('newNavItemLink').value = '';
        renderNavItems();
        updatePageSelector();
        
        if (!App.currentPage || !App.navItems.some(item => item.filename === App.currentPage)) {
            App.currentPage = safeFilename;
            updatePageSelector();
            if (typeof renderLayers === 'function') {
                renderLayers();
            }
            if (typeof updateLayersList === 'function') {
                updateLayersList();
            }
        }
    });

    // Page selector change
    document.getElementById('pageSelector').addEventListener('change', function() {
        App.currentPage = this.value;
        if (typeof renderLayers === 'function') {
            renderLayers();
        }
        if (typeof updateLayersList === 'function') {
            updateLayersList();
        }
        if (typeof updatePageBackgroundUI === 'function') {
            updatePageBackgroundUI();
        }
    });

    // Logo preview
    document.getElementById('logoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('logoPreview').innerHTML = `<img src="${ev.target.result}" alt="Logo">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Navigatie background preview
    document.getElementById('navBgImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('navBgPreview').innerHTML = 
                    `<img src="${ev.target.result}" style="max-height:60px; border-radius:8px; border:2px solid #e2e8f0;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Pagina background
    document.getElementById('pageBgColor').addEventListener('input', function() {
        const page = App.currentPage;
        if (!page) return;
        if (!App.pageBackgrounds) App.pageBackgrounds = {};
        if (!App.pageBackgrounds[page]) {
            App.pageBackgrounds[page] = { color: '#f8fafc', image: null };
        }
        App.pageBackgrounds[page].color = this.value;
        if (typeof updatePageCanvasBackground === 'function') {
            updatePageCanvasBackground();
        }
    });

    document.getElementById('pageBgImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const page = App.currentPage;
                if (!page) return;
                if (!App.pageBackgrounds) App.pageBackgrounds = {};
                if (!App.pageBackgrounds[page]) {
                    App.pageBackgrounds[page] = { color: '#f8fafc', image: null };
                }
                App.pageBackgrounds[page].image = ev.target.result;
                document.getElementById('pageBgPreview').innerHTML = 
                    `<img src="${ev.target.result}" style="max-height:60px; border-radius:8px; border:2px solid #e2e8f0;">`;
                if (typeof updatePageCanvasBackground === 'function') {
                    updatePageCanvasBackground();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('clearPageBg').addEventListener('click', function() {
        const page = App.currentPage;
        if (!page) return;
        if (App.pageBackgrounds && App.pageBackgrounds[page]) {
            App.pageBackgrounds[page].color = '#f8fafc';
            App.pageBackgrounds[page].image = null;
        }
        document.getElementById('pageBgColor').value = '#f8fafc';
        document.getElementById('pageBgImage').value = '';
        document.getElementById('pageBgPreview').innerHTML = '';
        if (typeof updatePageCanvasBackground === 'function') {
            updatePageCanvasBackground();
        }
    });

    // Download knop
    document.getElementById('downloadBtn').addEventListener('click', function() {
        if (typeof generateAndDownload === 'function') {
            generateAndDownload();
        }
    });

    // Init
    updatePageSelector();
}

function goToStep(step) {
    App.currentStep = step;
    
    document.querySelectorAll('.step').forEach(s => {
        const num = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (num === step) {
            s.classList.add('active');
            s.querySelector('.step-status').innerHTML = '';
        } else if (num < step) {
            s.classList.add('completed');
            s.querySelector('.step-status').innerHTML = '✅';
        } else {
            s.querySelector('.step-status').innerHTML = '';
        }
    });

    document.querySelectorAll('.wizard-step-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`step${step}`).style.display = 'block';

    document.getElementById('layersPanel').style.display = step === 3 ? 'block' : 'none';

    if (step === 3) {
        updatePageSelector();
        if (typeof renderLayers === 'function') {
            renderLayers();
        }
        if (typeof updateLayersList === 'function') {
            updateLayersList();
        }
        if (typeof updatePageBackgroundUI === 'function') {
            updatePageBackgroundUI();
        }
    }

    if (step === 4) {
        if (typeof generatePreview === 'function') {
            generatePreview();
        }
    }

    document.querySelector('.canvas-container').scrollTop = 0;
}

function renderNavItems() {
    const container = document.getElementById('navItemsContainer');
    if (!container) return;
    
    if (App.navItems.length === 0) {
        container.innerHTML = '<p style="color:#a0aec0; font-size:13px;">Nog geen pagina\'s. Voeg ze hieronder toe.</p>';
        return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:4px;">';
    App.navItems.forEach((item, index) => {
        html += `
            <div style="display:flex; gap:10px; align-items:center; padding:8px 12px; background:#f7fafc; border-radius:6px; border:1px solid #e2e8f0;">
                <i class="fas fa-file" style="color:#4f8cf7; width:16px;"></i>
                <span style="flex:1; font-weight:500;">${item.label}</span>
                <span style="color:#a0aec0; font-size:13px;">${item.filename}.html</span>
                <button onclick="removeNavItem(${index})" style="background:none; border:none; color:#fc8181; cursor:pointer; padding:4px 8px; border-radius:4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function removeNavItem(index) {
    const item = App.navItems[index];
    if (!item) return;
    if (!confirm(`Verwijder "${item.label}" uit de navigatie?`)) return;
    
    App.navItems.splice(index, 1);
    const pageName = item.filename;
    delete App.layers[pageName];
    delete App.pageBackgrounds[pageName];
    
    if (App.currentPage === pageName) {
        App.currentPage = App.navItems.length > 0 ? App.navItems[0].filename : null;
    }
    
    renderNavItems();
    updatePageSelector();
    if (typeof renderLayers === 'function') {
        renderLayers();
    }
    if (typeof updateLayersList === 'function') {
        updateLayersList();
    }
}

function updatePageSelector() {
    const select = document.getElementById('pageSelector');
    if (!select) return;
    select.innerHTML = '';
    
    if (App.navItems.length === 0) {
        select.innerHTML = '<option value="">Geen pagina\'s - voeg eerst navigatie toe</option>';
        return;
    }
    
    App.navItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.filename;
        option.textContent = item.label + ' (' + item.filename + '.html)';
        if (item.filename === App.currentPage) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function updatePageBackgroundUI() {
    const page = App.currentPage;
    if (!page) return;
    const bg = App.pageBackgrounds?.[page] || { color: '#f8fafc', image: null };
    document.getElementById('pageBgColor').value = bg.color || '#f8fafc';
    if (bg.image) {
        document.getElementById('pageBgPreview').innerHTML = 
            `<img src="${bg.image}" style="max-height:60px; border-radius:8px; border:2px solid #e2e8f0;">`;
    } else {
        document.getElementById('pageBgPreview').innerHTML = '';
    }
    if (typeof updatePageCanvasBackground === 'function') {
        updatePageCanvasBackground();
    }
}

function updatePageCanvasBackground() {
    const page = App.currentPage;
    if (!page) return;
    const bg = App.pageBackgrounds?.[page] || { color: '#f8fafc', image: null };
    const canvas = document.getElementById('pageCanvas');
    if (bg.image) {
        canvas.style.background = `url(${bg.image}) center/cover no-repeat`;
        canvas.style.backgroundColor = bg.color || '#f8fafc';
    } else {
        canvas.style.background = bg.color || '#f8fafc';
        canvas.style.backgroundImage = 'none';
    }
}

// Expose functions
window.goToStep = goToStep;
window.updatePageSelector = updatePageSelector;
window.renderNavItems = renderNavItems;
window.removeNavItem = removeNavItem;
window.updatePageBackgroundUI = updatePageBackgroundUI;
window.updatePageCanvasBackground = updatePageCanvasBackground;