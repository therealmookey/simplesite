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
    hero: { icon: 'fa-image', label: 'Hero banner', default: '<div style="padding:60px 20px; text-align:center; background:linear-gradient(135deg, #4f8cf7, #6c5ce7); color:white; border-radius:8px;"><h1 style="color:white;">Welkom!</h1><p style="color:white;">Dit is een hero banner</p></div>' },
    card: { icon: 'fa-square', label: 'Kaart', default: '<div style="padding:20px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.06);"><h3>Titel</h3><p>Content voor deze kaart</p></div>' }
};

function initLayers() {
    document.getElementById('addLayerBtn').addEventListener('click', function() {
        showLayerTypeSelector();
    });
    
    document.getElementById('addLayerBtnPage').addEventListener('click', function() {
        if (!App.currentPage || !App.layers[App.currentPage]) {
            alert('Selecteer eerst een pagina!');
            return;
        }
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
    if (!App.currentPage || !App.layers[App.currentPage]) {
        alert('Selecteer eerst een pagina!');
        return;
    }
    
    const info = LAYER_TYPES[type];
    if (!info) return;
    
    const layer = {
        id: Date.now() + Math.random() * 1000,
        type: type,
        content: info.default,
        visible: true,
        label: info.label
    };
    
    App.layers[App.currentPage].push(layer);
    renderLayers();
    updateLayersList();
    closeLayerSelector();
}

function deleteLayer(layerId) {
    if (!confirm('Weet je zeker dat je deze laag wilt verwijderen?')) return;
    
    const layers = App.layers[App.currentPage] || [];
    App.layers[App.currentPage] = layers.filter(l => l.id !== layerId);
    renderLayers();
    updateLayersList();
}

function duplicateLayer(layerId) {
    const layers = App.layers[App.currentPage] || [];
    const original = layers.find(l => l.id === layerId);
    if (!original) return;
    
    const newLayer = {
        ...original,
        id: Date.now() + Math.random() * 1000,
        label: original.label + ' (kopie)'
    };
    App.layers[App.currentPage].push(newLayer);
    renderLayers();
    updateLayersList();
}

function moveLayer(layerId, direction) {
    const layers = App.layers[App.currentPage] || [];
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
    } else if (direction === 'down' && index < layers.length - 1) {
        [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
    }
    renderLayers();
    updateLayersList();
}

function toggleLayerVisibility(layerId) {
    const layers = App.layers[App.currentPage] || [];
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        layer.visible = !layer.visible;
        renderLayers();
        updateLayersList();
    }
}

function updateLayerContent(layerId, newContent) {
    const layers = App.layers[App.currentPage] || [];
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        layer.content = newContent;
    }
}

function renderLayers() {
    const container = document.getElementById('layersContainer');
    const layers = App.layers[App.currentPage] || [];
    
    if (!App.currentPage || App.navItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>Geen pagina's</h3>
                <p>Voeg eerst een pagina toe in stap 2 (Navigatie)</p>
            </div>
        `;
        return;
    }
    
    if (layers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>Geen lagen</h3>
                <p>Klik op "Laag toevoegen" om te beginnen</p>
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
                    <button onclick="showLayerSettings(${layer.id})" title="Laag instellingen">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button onclick="deleteLayer(${layer.id})" style="color:#fc8181;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="layer-content" contenteditable="true"
                     data-id="${layer.id}"
                     oninput="updateLayerContent(${layer.id}, this.innerHTML)">
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
                renderLayers();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function updateLayersList() {
    const list = document.getElementById('layersList');
    const layers = App.layers[App.currentPage] || [];
    
    if (!App.currentPage || App.navItems.length === 0) {
        list.innerHTML = '<p style="color:#a0aec0; font-size:13px; text-align:center; padding:10px;">Geen pagina\'s</p>';
        return;
    }
    
    if (layers.length === 0) {
        list.innerHTML = '<p style="color:#a0aec0; font-size:13px; text-align:center; padding:10px;">Geen lagen</p>';
        return;
    }
    
    let html = '';
    layers.forEach(layer => {
        const info = LAYER_TYPES[layer.type] || { icon: 'fa-cube', label: 'Laag' };
        html += `
            <div class="layer-item">
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

function showLayerSettings(layerId) {
    const layers = App.layers[App.currentPage] || [];
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const modal = document.getElementById('layerEditorModal');
    const title = document.getElementById('layerEditorTitle');
    const content = document.getElementById('layerEditorContent');
    
    title.innerHTML = `<i class="fas fa-cog"></i> Instellingen: ${layer.label}`;
    
    content.innerHTML = `
        <div class="form-group">
            <label>Laag naam</label>
            <input type="text" id="layerNameInput" value="${layer.label}" class="form-control">
        </div>
        <div class="form-group">
            <label>Type</label>
            <select id="layerTypeInput" class="form-control">
                ${Object.keys(LAYER_TYPES).map(type => `
                    <option value="${type}" ${layer.type === type ? 'selected' : ''}>
                        ${LAYER_TYPES[type].label}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('saveLayerEditorBtn').onclick = function() {
        saveLayerSettings(layerId);
    };
    
    document.getElementById('closeLayerEditor').onclick = closeLayerEditor;
    document.getElementById('closeLayerEditorBtn').onclick = closeLayerEditor;
    
    modal.style.display = 'block';
}

function saveLayerSettings(layerId) {
    const layers = App.layers[App.currentPage] || [];
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const name = document.getElementById('layerNameInput')?.value;
    const type = document.getElementById('layerTypeInput')?.value;
    
    if (name) layer.label = name;
    if (type && type !== layer.type) {
        const info = LAYER_TYPES[type];
        if (info) {
            layer.type = type;
            layer.content = info.default;
        }
    }
    
    closeLayerEditor();
    renderLayers();
    updateLayersList();
}

function closeLayerEditor() {
    document.getElementById('layerEditorModal').style.display = 'none';
}

// Expose functions
window.addLayer = addLayer;
window.deleteLayer = deleteLayer;
window.duplicateLayer = duplicateLayer;
window.moveLayer = moveLayer;
window.toggleLayerVisibility = toggleLayerVisibility;
window.updateLayerContent = updateLayerContent;
window.renderLayers = renderLayers;
window.updateLayersList = updateLayersList;
window.uploadImageForLayer = uploadImageForLayer;
window.showLayerSettings = showLayerSettings;
window.saveLayerSettings = saveLayerSettings;
window.closeLayerEditor = closeLayerEditor;
window.closeLayerSelector = closeLayerSelector;