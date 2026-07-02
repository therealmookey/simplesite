// =============================================
// SIMPLESITE - Wizard (Stappenplan)
// =============================================

function initWizard() {
    const steps = document.querySelectorAll('.step');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');

    // Stap klikken in sidebar
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.step);
            goToStep(stepNum);
        });
    });

    // Volgende knop
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = App.currentStep;
            if (currentStep < 5) {
                // Valideer stap 1
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
                
                // Valideer stap 2 (Navigatie)
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
                
                // Valideer stap 3 (Pagina's)
                if (currentStep === 3) {
                    const checked = document.querySelectorAll('.page-option input:checked');
                    App.pages = Array.from(checked).map(cb => cb.value);
                    
                    App.pages.forEach(page => {
                        if (!App.layers[page]) {
                            App.layers[page] = [];
                        }
                        if (!App.pageBackgrounds[page]) {
                            App.pageBackgrounds[page] = { color: '#f8fafc', image: null };
                        }
                    });
                    
                    updatePageSelector();
                }
                
                goToStep(currentStep + 1);
            }
        });
    });

    // Vorige knop
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (App.currentStep > 1) {
                goToStep(App.currentStep - 1);
            }
        });
    });

    // Page selector change
    document.getElementById('pageSelector').addEventListener('change', function() {
        App.currentPage = this.value;
        renderLayersForPage(App.currentPage);
        updateLayersList();
        updatePageBackgroundUI();
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
        if (!App.pageBackgrounds[page]) {
            App.pageBackgrounds[page] = { color: '#f8fafc', image: null };
        }
        App.pageBackgrounds[page].color = this.value;
        updatePageCanvasBackground();
    });

    document.getElementById('pageBgImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const page = App.currentPage;
                if (!App.pageBackgrounds[page]) {
                    App.pageBackgrounds[page] = { color: '#f8fafc', image: null };
                }
                App.pageBackgrounds[page].image = ev.target.result;
                document.getElementById('pageBgPreview').innerHTML = 
                    `<img src="${ev.target.result}" style="max-height:60px; border-radius:8px; border:2px solid #e2e8f0;">`;
                updatePageCanvasBackground();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('clearPageBg').addEventListener('click', function() {
        const page = App.currentPage;
        if (App.pageBackgrounds[page]) {
            App.pageBackgrounds[page].color = '#f8fafc';
            App.pageBackgrounds[page].image = null;
        }
        document.getElementById('pageBgColor').value = '#f8fafc';
        document.getElementById('pageBgImage').value = '';
        document.getElementById('pageBgPreview').innerHTML = '';
        updatePageCanvasBackground();
    });

    // Custom page toevoegen
    document.getElementById('addCustomPage').addEventListener('click', function() {
        const name = document.getElementById('customPageName').value.trim();
        if (!name) {
            alert('Voer een paginanaam in!');
            return;
        }
        const safeName = name.toLowerCase().replace(/\s+/g, '-');
        if (App.pages.includes(safeName)) {
            alert('Deze pagina bestaat al!');
            return;
        }
        App.pages.push(safeName);
        App.layers[safeName] = [];
        App.pageBackgrounds[safeName] = { color: '#f8fafc', image: null };
        
        // Voeg checkbox toe
        const list = document.querySelector('.page-list');
        const label = document.createElement('label');
        label.className = 'page-option';
        label.innerHTML = `
            <input type="checkbox" value="${safeName}" checked> ${name}
        `;
        list.appendChild(label);
        
        document.getElementById('customPageName').value = '';
        updatePageSelector();
    });

    // Download knop
    document.getElementById('downloadBtn').addEventListener('click', function() {
        generateAndDownload();
    });
}

function goToStep(step) {
    App.currentStep = step;
    
    // Update sidebar steps
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

    // Update content
    document.querySelectorAll('.wizard-step-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`step${step}`).style.display = 'block';

    // Toon/verberg layers panel
    document.getElementById('layersPanel').style.display = step === 4 ? 'block' : 'none';

    // Als stap 4, render layers en background
    if (step === 4) {
        renderLayersForPage(App.currentPage);
        updateLayersList();
        updatePageBackgroundUI();
    }

    // Als stap 5, generate preview
    if (step === 5) {
        generatePreview();
    }

    // Scroll naar top
    document.querySelector('.canvas-container').scrollTop = 0;
}

function updatePageSelector() {
    const select = document.getElementById('pageSelector');
    select.innerHTML = '';
    App.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page;
        option.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        if (page === App.currentPage) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function updatePageBackgroundUI() {
    const page = App.currentPage;
    const bg = App.pageBackgrounds[page] || { color: '#f8fafc', image: null };
    document.getElementById('pageBgColor').value = bg.color || '#f8fafc';
    if (bg.image) {
        document.getElementById('pageBgPreview').innerHTML = 
            `<img src="${bg.image}" style="max-height:60px; border-radius:8px; border:2px solid #e2e8f0;">`;
    } else {
        document.getElementById('pageBgPreview').innerHTML = '';
    }
    updatePageCanvasBackground();
}

function updatePageCanvasBackground() {
    const page = App.currentPage;
    const bg = App.pageBackgrounds[page] || { color: '#f8fafc', image: null };
    const canvas = document.getElementById('pageCanvas');
    if (bg.image) {
        canvas.style.background = `url(${bg.image}) center/cover no-repeat`;
        canvas.style.backgroundColor = bg.color || '#f8fafc';
    } else {
        canvas.style.background = bg.color || '#f8fafc';
        canvas.style.backgroundImage = 'none';
    }
}

// ===== NAVIGATIE ITEMS =====
function initNavItems() {
    renderNavItems();
    
    document.getElementById('addNavItem').addEventListener('click', function() {
        App.navItems.push({ label: 'Nieuw item', link: '#' });
        renderNavItems();
    });
}

function renderNavItems() {
    const container = document.getElementById('navItemsContainer');
    let html = '';
    App.navItems.forEach((item, index) => {
        html += `
            <div class="nav-item" style="display:flex; gap:10px; margin-bottom:8px; align-items:center;">
                <input type="text" value="${item.label}" placeholder="Label" 
                       class="form-control" style="flex:1;"
                       onchange="App.navItems[${index}].label = this.value;">
                <input type="text" value="${item.link}" placeholder="Link (bijv. #home)" 
                       class="form-control" style="flex:1.5;"
                       onchange="App.navItems[${index}].link = this.value;">
                <button class="btn btn-sm btn-danger" onclick="removeNavItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html || '<p style="color:#a0aec0; font-size:13px;">Voeg navigatie items toe</p>';
}

function removeNavItem(index) {
    App.navItems.splice(index, 1);
    renderNavItems();
}