// =============================================
// SIMPLESITE - Lagen Systeem
// =============================================

const LAYER_TYPES = {
    heading: { icon: 'fa-heading', label: 'Koptekst', default: '<h1>Klik om te bewerken</h1>' },
    heading2: { icon: 'fa-heading', label: 'Koptekst H2', default: '<h2>Klik om te bewerken</h2>' },
    heading3: { icon: 'fa-heading', label: 'Koptekst H3', default: '<h3>Klik om te bewerken</h3>' },
    text: { icon: 'fa-paragraph', label: 'Tekst', default: '<p>Klik hier om tekst aan te passen.</p>' },
    image: { icon: 'fa-image', label: 'Afbeelding', default: '<div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><br>Klik om afbeelding te uploaden</div>' },
    button: { icon: 'fa-link', label: 'Knop', default: '<a href="#" class="btn-preview">Klik hier</a>' },
    divider: { icon: 'fa-minus', label: 'Scheidingslijn', default: '<hr>' },
    spacer: { icon: 'fa-arrows-v', label: 'Ruimte', default: '<div class="layer-spacer" style="min-height:40px;"></div>' }
};

function initLayers() {
    // Laag toevoegen knop
    document.getElementById('addLayerBtn').addEventListener('click', function() {
        showLayerTypeSelector();
    });
}

function showLayerTypeSelector() {
    const types = Object.keys(LAYER_TYPES);
    let html = `
        <div class="layer-selector-modal" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:16px; z-index:1000; min-width:300px; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:16px;">Kies laag type</h3>
    `;
    
    types.forEach(type => {
        const info = LAYER_TYPES[type];
        html += `
            <button onclick="addLayer('${type}'); closeLayerSelector();" 
                    style="display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px; margin-bottom:6px; border:2px solid #e2e8f0; border-radius:8px; background:white; cursor:pointer; transition:all 0.2s;">
                <i class="fas ${info.icon}" style="width:20px; color:#4f8cf7;"></i>
                <span>${info.label}</span>
            </button>
        `;
    });
    
    html += `
            <button onclick="closeLayerSelector()" style="width:100%; margin-top:10px; padding:10px; border:2px solid #e2e8f0; border-radius:8px; background:white; cursor:pointer;">Annuleren</button>
        </div>
        <div id="layerSelectorOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:999;"></div>
    `;
    
    // Verwijder oude selector als die er is
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
        label: `${info.label} ${App.layerIdCounter}`
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
        // Herrender niet om focus te behouden
    }
}

function renderLayersForPage(page) {
    const container = document.getElementById('layersContainer');
    const layers = App.layers[page] || [];
    
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
        
        html += `
            <div class="layer-render layer-${layer.type}" data-id="${layer.id}">
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