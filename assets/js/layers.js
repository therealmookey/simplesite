// =============================================
// SIMPLESITE - Lagen Systeem
// =============================================

const LAYER_TYPES = {
    heading: { icon: 'fa-heading', label: 'Koptekst H1', default: '<h1>Klik om te bewerken</h1>' },
    heading2: { icon: 'fa-heading', label: 'Koptekst H2', default: '<h2>Klik om te bewerken</h2>' },
    heading3: { icon: 'fa-heading', label: 'Koptekst H3', default: '<h3>Klik om te bewerken</h3>' },
    text: { icon: 'fa-paragraph', label: 'Tekst', default: '<p>Klik hier om tekst aan te passen.</p>' },
    image: { icon: 'fa-image', label: 'Afbeelding', default: '<div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><br>Klik om afbeelding te uploaden</div>' },
    button: { icon: 'fa-link', label: 'Knop', default: '<a href="#" class="btn-preview">Klik hier</a>' },
    divider: { icon: 'fa-minus', label: 'Scheidingslijn', default: '<hr>' },
    spacer: { icon: 'fa-arrows-v', label: 'Ruimte', default: '<div class="layer-spacer"></div>' },
    // Nieuwe laag types met achtergrond
    hero: { icon: 'fa-image', label: 'Hero banner', default: '<div style="padding:60px 20px; text-align:center; background:linear-gradient(135deg, #4f8cf7, #6c5ce7); color:white; border-radius:8px;"><h1 style="color:white;">Welkom!</h1><p style="color:white;">Dit is een hero banner</p></div>' },
    card: { icon: 'fa-square', label: 'Kaart (Card)', default: '<div style="padding:20px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.06);"><h3>Titel</h3><p>Content voor deze kaart</p></div>' }
};

function initLayers() {
    document.getElementById('addLayerBtn').addEventListener('click', function() {
        showLayerTypeSelector();
    });
}

function showLayerTypeSelector() {
    const types = Object.keys(LAYER_TYPES);
    let html = `
        <div class="layer-selector-modal">
            <h3><i class="fas fa-plus"></i> Kies laag type</h3>
    `;
    
    types.forEach(type => {
        const info = LAYER_TYPES[type];
        html += `
            <button onclick="addLayer('${type}'); closeLayerSelector();" class="layer-option">
                <i class="fas ${info.icon}"></i>
                <span>${info.label}</span>
            </button>
        `;
    });
    
    html += `
            <button onclick="closeLayerSelector()" class="layer-option-cancel">Annuleren</button>
        </div>
        <div id="layerSelectorOverlay" onclick="closeLayerSelector()"></div>
    `;
    
    const oldSelector = document.querySelector('.layer-selector-modal');
    const oldOverlay = document.getElementById('layerSelectorOverlay');
    if (oldSelector) oldSelector.remove();
    if (oldOverlay) oldOverlay.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function closeLayerSelector() {
    document.querySelector('.layer-selector-modal')?.remove();
    document.getElementById('layerSelectorOverlay')?.remove();
}

function addLayer(type) {
    const info = LAYER_TYPES[type];
    const layer = {
        id: ++App.layerIdCounter,
        type: type,
        content: info.default,
        visible: true,
        label: `${info.label} ${App.layerIdCounter}`,
        background: null, // Achtergrond voor deze laag
        padding: '20px'
    };
    
    if (!App.layers[App.currentPage]) {
        App.layers[App.currentPage] = [];
    }
    
    App.layers[App.currentPage].push(layer);
    renderLayersForPage(App.currentPage);
    updateLayersList();
    closeLayerSelector();
}

function deleteLayer(layerId) {
    if (!confirm('Weet je zeker dat je deze laag wilt verwijderen?')) return;
    
    const layers = App.layers[App.currentPage];
    App.layers[App.currentPage] = layers.filter(l => l.id !== layerId);
    renderLayersForPage(App.currentPage);
    updateLayersList();
}

function duplicateLayer(layerId) {
    const layers = App.layers[App.currentPage];
    const original = layers.find(l => l.id === layerId);
    if (!original) return;
    
    const newLayer = {
        ...original,
        id: ++App.layerIdCounter,
        label: `${original.label} (kopie)`
    };
    App.layers[App.currentPage].push(newLayer);
    renderLayersForPage(App.currentPage);
    updateLayersList();
}

function moveLayer(layerId, direction) {
    const layers = App.layers[App.currentPage];
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
    } else if (direction === 'down' && index < layers.length - 1) {
        [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
    }
    renderLayersForPage(App.currentPage);
    updateLayersList();
}

function toggleLayerVisibility(layerId) {
    const layers = App.layers[App.currentPage];
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        layer.visible = !layer.visible;
        renderLayersForPage(App.currentPage);
        updateLayersList();
    }
}

function updateLayerContent(layerId, newContent) {
    const layers = App.layers[App.currentPage];
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        layer.content = newContent;
    }
}

function renderLayersForPage(page) {
    const container = document.getElementById('layersContainer');
    const layers = App.layers[page] || [];
    const bg = App.pageBackgrounds[page] || { color: '#f8fafc', image: null };
    
    // Update canvas background
    const canvas = document.getElementById('pageCanvas');
    if (bg.image) {
        canvas.style.background = `url(${bg.image}) center/cover no-repeat`;
        canvas.style.backgroundColor = bg.color || '#f8fafc';
    } else {
        canvas.style.background = bg.color || '#f8fafc';
        canvas.style.backgroundImage = 'none';
    }
    
    if (layers.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#a0aec0;">
                <i class="fas fa-layer-group" style="font-size:40px; margin-bottom:16px; display:block;"></i>
                <p>Geen lagen op deze pagina</p>
                <p style="font-size:14px;">Klik op "Laag toevoegen" om te beginnen</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    layers.forEach((layer, index) => {
        if (!layer.visible) return;
        
        const isImage = layer.type === 'image';
        const content = isImage ? layer.content : layer.content;
        
        // Bouw layer style met eventuele achtergrond
        let layerStyle = '';
        if (layer.background) {
            layerStyle = `background: ${layer.background};`;
        }
        if (layer.padding) {
            layerStyle += ` padding: ${layer.padding};`;
        }
        
        html += `
            <div class="layer-render layer-${layer.type}" data-id="${layer.id}" style="${layerStyle}">
                <div class="layer-edit-tools">
                    <button onclick="moveLayer(${layer.id}, 'up')" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="moveLayer(${layer.id}, 'down')" ${index === layers.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button onclick="duplicateLayer(${layer.id})">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="showLayerSettings(${layer.id})" title="Laag instellingen">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button onclick="deleteLayer(${layer.id})" style="color:#fc8181;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="layer-content" contenteditable="true"
                     data-id="${layer.id}"
                     oninput="updateLayerContent(${layer.id}, this.innerHTML)"
                     onfocus="App.selectedLayerId = ${layer.id}; updateLayersList();">
                    ${content}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Speciale handling voor image upload
    document.querySelectorAll('.layer-image .layer-content .upload-placeholder').forEach(el => {
        const layerId = parseInt(el.closest('.layer-content').dataset.id);
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            uploadImageForLayer(layerId);
        });
    });
}

function uploadImageForLayer(layerId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const imgHTML = `<img src="${ev.target.result}" alt="Geüploade afbeelding">`;
                updateLayerContent(layerId, imgHTML);
                renderLayersForPage(App.currentPage);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function updateLayersList() {
    const list = document.getElementById('layersList');
    const layers = App.layers[App.currentPage] || [];
    
    if (layers.length === 0) {
        list.innerHTML = `<p style="color:#a0aec0; font-size:13px; text-align:center; padding:10px;">Geen lagen</p>`;
        return;
    }
    
    let html = '';
    layers.forEach(layer => {
        const info = LAYER_TYPES[layer.type] || { icon: 'fa-cube', label: 'Laag' };
        const isActive = layer.id === App.selectedLayerId;
        
        html += `
            <div class="layer-item ${isActive ? 'active' : ''}" 
                 onclick="App.selectedLayerId = ${layer.id}; updateLayersList(); document.querySelector('.layer-content[data-id=\\'${layer.id}\\']')?.focus();">
                <i class="fas ${info.icon} layer-icon"></i>
                <span class="layer-name">${layer.label}</span>
                <div class="layer-controls">
                    <button onclick="event.stopPropagation(); toggleLayerVisibility(${layer.id});" title="${layer.visible ? 'Verberg' : 'Toon'}">
                        <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteLayer(${layer.id});" class="delete-layer" title="Verwijderen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

// ===== LAYER SETTINGS =====
function showLayerSettings(layerId) {
    const layers = App.layers[App.currentPage];
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const currentBg = layer.background || '';
    const currentPadding = layer.padding || '20px';
    
    const html = `
        <div class="layer-selector-modal" style="min-width:350px;">
            <h3><i class="fas fa-cog"></i> Laag instellingen</h3>
            <div class="form-group">
                <label>Laag naam</label>
                <input type="text" id="layerNameInput" value="${layer.label}" class="form-control">
            </div>
            <div class="form-group">
                <label>Achtergrond (kleur of gradient)</label>
                <input type="text" id="layerBgInput" value="${currentBg}" placeholder="Bijv. #4f8cf7 of linear-gradient(...)" class="form-control">
                <div style="display:flex; gap:8px; margin-top:6px;">
                    <input type="color" value="${currentBg.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff'}" 
                           onchange="document.getElementById('layerBgInput').value = this.value;" 
                           style="width:40px; height:40px; border:2px solid #e2e8f0; border-radius:8px; cursor:pointer;">
                    <span style="font-size:12px; color:#a0aec0; display:flex; align-items:center;">Kies kleur</span>
                </div>
            </div>
            <div class="form-group">
                <label>Padding</label>
                <input type="text" id="layerPaddingInput" value="${currentPadding}" placeholder="Bijv. 20px 30px" class="form-control">
            </div>
            <div style="display:flex; gap:10px; margin-top:16px;">
                <button class="btn btn-primary" onclick="saveLayerSettings(${layerId})">
                    <i class="fas fa-save"></i> Opslaan
                </button>
                <button class="btn btn-outline" onclick="closeLayerSelector()">Annuleren</button>
            </div>
        </div>
        <div id="layerSelectorOverlay" onclick="closeLayerSelector()"></div>
    `;
    
    const oldSelector = document.querySelector('.layer-selector-modal');
    const oldOverlay = document.getElementById('layerSelectorOverlay');
    if (oldSelector) oldSelector.remove();
    if (oldOverlay) oldOverlay.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function saveLayerSettings(layerId) {
    const layers = App.layers[App.currentPage];
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const nameInput = document.getElementById('layerNameInput');
    const bgInput = document.getElementById('layerBgInput');
    const paddingInput = document.getElementById('layerPaddingInput');
    
    if (nameInput) layer.label = nameInput.value;
    if (bgInput) layer.background = bgInput.value;
    if (paddingInput) layer.padding = paddingInput.value;
    
    closeLayerSelector();
    renderLayersForPage(App.currentPage);
    updateLayersList();
}