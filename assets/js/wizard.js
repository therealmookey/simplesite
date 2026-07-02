// =============================================
// SIMPLESITE - Wizard (Stappenplan)
// =============================================

function initWizard() {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.wizard-step-content');
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
            if (currentStep < 4) {
                // Valideer stap 1
                if (currentStep === 1) {
                    const title = document.getElementById('siteTitle').value.trim();
                    if (!title) {
                        alert('Vul een website titel in!');
                        return;
                    }
                    App.siteTitle = title;
                    App.primaryColor = document.getElementById('primaryColor').value;
                    
                    // Logo opslaan
                    const logoFile = document.getElementById('logoUpload').files[0];
                    if (logoFile) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            App.logo = e.target.result;
                        };
                        reader.readAsDataURL(logoFile);
                    }
                }
                
                // Valideer stap 2
                if (currentStep === 2) {
                    const checked = document.querySelectorAll('.page-option input:checked');
                    App.pages = Array.from(checked).map(cb => cb.value);
                    
                    // Zorg dat elke pagina een layers array heeft
                    App.pages.forEach(page => {
                        if (!App.layers[page]) {
                            App.layers[page] = [];
                        }
                    });
                    
                    // Update page selector
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

    // Download knop (stap 4)
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
    document.getElementById('layersPanel').style.display = step === 3 ? 'block' : 'none';

    // Als stap 3, render layers
    if (step === 3) {
        renderLayersForPage(App.currentPage);
        updateLayersList();
    }

    // Als stap 4, generate preview
    if (step === 4) {
        generatePreview();
    }

    // Scroll naar top van canvas
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