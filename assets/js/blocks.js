// =============================================
// SIMPLESITE - Blokken Systeem
// =============================================

// ===== BLOK TYPES =====
const BLOCK_TYPES = {
    section: {
        icon: 'fa-square',
        label: 'Sectie',
        default: { 
            type: 'section',
            children: [],
            settings: { 
                background: '#ffffff', 
                padding: '40px 20px',
                className: ''
            }
        },
        canHaveChildren: true,
        isContainer: true
    },
    columns: {
        icon: 'fa-columns',
        label: 'Kolommen (2)',
        default: {
            type: 'columns',
            columns: 2,
            children: [],
            settings: {
                gap: '20px',
                background: 'transparent',
                padding: '0px'
            }
        },
        canHaveChildren: true,
        isContainer: true
    },
    heading: {
        icon: 'fa-heading',
        label: 'Koptekst',
        default: {
            type: 'heading',
            content: '<h1>Klik om te bewerken</h1>',
            settings: { textAlign: 'left', color: '#2d3748', fontSize: '32px' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    text: {
        icon: 'fa-paragraph',
        label: 'Tekst',
        default: {
            type: 'text',
            content: '<p>Klik hier om de tekst aan te passen.</p>',
            settings: { textAlign: 'left', color: '#4a5568', fontSize: '16px' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    image: {
        icon: 'fa-image',
        label: 'Afbeelding',
        default: {
            type: 'image',
            content: '<div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><br>Klik om afbeelding te uploaden</div>',
            settings: { maxWidth: '100%', borderRadius: '8px' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    button: {
        icon: 'fa-link',
        label: 'Knop',
        default: {
            type: 'button',
            content: '<a href="#" class="btn-preview">Klik hier</a>',
            settings: { text: 'Klik hier', link: '#', color: '#4f8cf7' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    divider: {
        icon: 'fa-minus',
        label: 'Scheiding',
        default: {
            type: 'divider',
            content: '<hr>',
            settings: { color: '#e2e8f0', thickness: '2px' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    spacer: {
        icon: 'fa-arrows-v',
        label: 'Ruimte',
        default: {
            type: 'spacer',
            content: '<div class="block-spacer"></div>',
            settings: { height: '40px' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    hero: {
        icon: 'fa-image',
        label: 'Hero Banner',
        default: {
            type: 'hero',
            content: '<div style="padding:80px 20px; text-align:center; background:linear-gradient(135deg, #4f8cf7, #6c5ce7); color:white; border-radius:12px;"><h1 style="color:white;">Welkom!</h1><p style="color:white; font-size:18px;">Dit is een hero banner</p></div>',
            settings: { height: '400px', background: 'linear-gradient(135deg, #4f8cf7, #6c5ce7)' }
        },
        canHaveChildren: false,
        isContainer: false
    },
    card: {
        icon: 'fa-square',
        label: 'Kaart',
        default: {
            type: 'card',
            content: '<div style="padding:24px; background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06);"><h3>Titel</h3><p>Content voor deze kaart</p></div>',
            settings: { background: '#ffffff', shadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px' }
        },
        canHaveChildren: false,
        isContainer: false
    }
};

// ===== STATE =====
let pageBlocks = {};
let selectedBlockId = null;
let editingBlockId = null;
let blockIdCounter = 0;

// ===== INIT =====
function initBlocks() {
    // Initialize blocks for existing nav items
    if (App.navItems) {
        App.navItems.forEach(item => {
            const pageName = item.link.replace('#', '');
            if (!pageBlocks[pageName]) {
                pageBlocks[pageName] = [];
            }
        });
    }
    
    // Blok toevoegen via sidebar
    document.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            if (App.currentStep === 3) {
                addBlockToPage(type);
            } else {
                goToStep(3);
                setTimeout(() => addBlockToPage(type), 300);
            }
        });
    });

    // Blok toevoegen via knop in canvas
    document.getElementById('addBlockToPage').addEventListener('click', function() {
        showBlockTypeSelector();
    });

    // Page selector change
    document.getElementById('pageSelector').addEventListener('change', function() {
        App.currentPage = this.value;
        renderBlocks();
        updateStructureTree();
        updatePageBackgroundUI();
    });

    // Initialize empty state
    if (!pageBlocks[App.currentPage]) {
        pageBlocks[App.currentPage] = [];
    }
}

// ===== BLOK TOEVOEGEN =====
function addBlockToPage(type, parentId = null) {
    const blockType = BLOCK_TYPES[type];
    if (!blockType) return;

    const newBlock = JSON.parse(JSON.stringify(blockType.default));
    newBlock.id = ++blockIdCounter;
    newBlock.type = type;
    
    if (!pageBlocks[App.currentPage]) {
        pageBlocks[App.currentPage] = [];
    }

    if (parentId) {
        const parent = findBlockById(parentId, pageBlocks[App.currentPage]);
        if (parent && parent.children) {
            parent.children.push(newBlock);
        }
    } else {
        pageBlocks[App.currentPage].push(newBlock);
    }

    renderBlocks();
    updateStructureTree();
}

function findBlockById(id, blocks) {
    for (let block of blocks) {
        if (block.id === id) return block;
        if (block.children) {
            const found = findBlockById(id, block.children);
            if (found) return found;
        }
    }
    return null;
}

function getBlockById(id) {
    return findBlockById(id, pageBlocks[App.currentPage] || []);
}

function removeBlock(id) {
    const removeFromArray = (blocks) => {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === id) {
                blocks.splice(i, 1);
                return true;
            }
            if (blocks[i].children) {
                if (removeFromArray(blocks[i].children)) return true;
            }
        }
        return false;
    };
    
    if (!confirm('Weet je zeker dat je dit blok wilt verwijderen?')) return;
    removeFromArray(pageBlocks[App.currentPage] || []);
    renderBlocks();
    updateStructureTree();
}

function duplicateBlock(id) {
    const duplicate = (blocks) => {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === id) {
                const copy = JSON.parse(JSON.stringify(blocks[i]));
                copy.id = ++blockIdCounter;
                blocks.splice(i + 1, 0, copy);
                return true;
            }
            if (blocks[i].children) {
                if (duplicate(blocks[i].children)) return true;
            }
        }
        return false;
    };
    
    duplicate(pageBlocks[App.currentPage] || []);
    renderBlocks();
    updateStructureTree();
}

function moveBlock(id, direction) {
    const moveInArray = (blocks) => {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === id) {
                if (direction === 'up' && i > 0) {
                    [blocks[i], blocks[i - 1]] = [blocks[i - 1], blocks[i]];
                    return true;
                } else if (direction === 'down' && i < blocks.length - 1) {
                    [blocks[i], blocks[i + 1]] = [blocks[i + 1], blocks[i]];
                    return true;
                }
                return false;
            }
            if (blocks[i].children) {
                if (moveInArray(blocks[i].children)) return true;
            }
        }
        return false;
    };
    
    moveInArray(pageBlocks[App.currentPage] || []);
    renderBlocks();
    updateStructureTree();
}

// ===== RENDER BLOKKEN =====
function renderBlocks() {
    const container = document.getElementById('blocksContainer');
    const blocks = pageBlocks[App.currentPage] || [];
    
    if (blocks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" id="emptyBlocksState">
                <i class="fas fa-cubes"></i>
                <h3>Geen blokken</h3>
                <p>Klik op "Blok toevoegen" of kies een blok uit de sidebar</p>
            </div>
        `;
        const tree = document.getElementById('structureTree');
        if (tree) tree.innerHTML = '<p style="color:#a0aec0; font-size:13px; text-align:center;">Geen blokken</p>';
        return;
    }
    
    container.innerHTML = renderBlocksRecursive(blocks);
    updateStructureTree();
}

function renderBlocksRecursive(blocks, level = 0) {
    let html = '';
    blocks.forEach((block, index) => {
        const info = BLOCK_TYPES[block.type] || { icon: 'fa-cube', label: 'Blok' };
        const isContainer = info.isContainer || false;
        const hasChildren = block.children && block.children.length > 0;
        
        let blockStyle = '';
        if (block.settings) {
            if (block.settings.background) {
                blockStyle += `background: ${block.settings.background};`;
            }
            if (block.settings.padding) {
                blockStyle += `padding: ${block.settings.padding};`;
            }
            if (block.settings.color) {
                blockStyle += `color: ${block.settings.color};`;
            }
            if (block.settings.textAlign) {
                blockStyle += `text-align: ${block.settings.textAlign};`;
            }
            if (block.settings.fontSize) {
                blockStyle += `font-size: ${block.settings.fontSize};`;
            }
        }
        
        let childrenHTML = '';
        if (hasChildren && isContainer) {
            childrenHTML = renderBlocksRecursive(block.children, level + 1);
        }
        
        let columnsClass = '';
        if (block.type === 'columns' && block.columns) {
            columnsClass = `columns-${block.columns}`;
        }
        
        let contentHTML = block.content || '';
        
        if (block.type === 'image' && contentHTML.includes('upload-placeholder')) {
            contentHTML = `<div class="upload-placeholder" onclick="uploadImageForBlock(${block.id})">
                <i class="fas fa-cloud-upload-alt"></i><br>Klik om afbeelding te uploaden
            </div>`;
        }
        
        if (block.type === 'button') {
            const text = block.settings?.text || 'Klik hier';
            const link = block.settings?.link || '#';
            const color = block.settings?.color || '#4f8cf7';
            contentHTML = `<a href="${link}" class="btn-preview" style="background:${color};">${text}</a>`;
        }
        
        if (block.type === 'spacer') {
            const height = block.settings?.height || '40px';
            contentHTML = `<div class="block-spacer" style="height:${height};"></div>`;
        }
        
        html += `
            <div class="block-item block-${block.type} ${isContainer ? 'block-container' : ''} ${columnsClass}" 
                 data-id="${block.id}" 
                 style="${blockStyle}"
                 data-level="${level}">
                <div class="block-tools">
                    <button onclick="moveBlock(${block.id}, 'up')" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="moveBlock(${block.id}, 'down')" ${index === blocks.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    ${isContainer ? `<button onclick="showAddBlockToContainer(${block.id})" title="Blok toevoegen in deze container">
                        <i class="fas fa-plus"></i>
                    </button>` : ''}
                    <button onclick="duplicateBlock(${block.id})" title="Dupliceren">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="editBlockSettings(${block.id})" title="Instellingen">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button onclick="removeBlock(${block.id})" class="delete-btn" title="Verwijderen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="block-label">
                    <i class="fas ${info.icon}"></i>
                    <span>${info.label} #${block.id}</span>
                    ${block.settings?.className ? `<span class="block-class">.${block.settings.className}</span>` : ''}
                </div>
                <div class="block-content" ${!isContainer ? 'contenteditable="true"' : ''}
                     data-id="${block.id}"
                     oninput="${!isContainer ? `updateBlockContent(${block.id}, this.innerHTML)` : ''}"
                     onclick="${isContainer ? '' : `selectBlock(${block.id})`}">
                    ${isContainer ? (hasChildren ? childrenHTML : `<div class="empty-container-msg">Sleep blokken hierheen of klik op +</div>`) : contentHTML}
                </div>
            </div>
        `;
    });
    
    return html;
}

function updateStructureTree() {
    const container = document.getElementById('structureTree');
    const blocks = pageBlocks[App.currentPage] || [];
    
    if (blocks.length === 0) {
        container.innerHTML = '<p style="color:#a0aec0; font-size:13px; text-align:center; padding:10px;">Geen blokken</p>';
        return;
    }
    
    container.innerHTML = renderStructureTree(blocks);
}

function renderStructureTree(blocks, level = 0) {
    let html = '<ul class="structure-tree">';
    blocks.forEach(block => {
        const info = BLOCK_TYPES[block.type] || { icon: 'fa-cube', label: 'Blok' };
        const isActive = block.id === selectedBlockId;
        const hasChildren = block.children && block.children.length > 0;
        
        html += `
            <li class="structure-item ${isActive ? 'active' : ''}" style="padding-left: ${level * 20}px;">
                <div class="structure-item-content" onclick="selectBlock(${block.id}); scrollToBlock(${block.id});">
                    <i class="fas ${info.icon}"></i>
                    <span>${info.label}</span>
                    <span class="structure-id">#${block.id}</span>
                    ${hasChildren ? `<span class="structure-count">(${block.children.length})</span>` : ''}
                </div>
                ${hasChildren ? renderStructureTree(block.children, level + 1) : ''}
            </li>
        `;
    });
    html += '</ul>';
    return html;
}

// ===== BLOK ACTIES =====
function selectBlock(id) {
    selectedBlockId = id;
    updateStructureTree();
    
    document.querySelectorAll('.block-item').forEach(el => {
        el.classList.remove('selected');
        if (parseInt(el.dataset.id) === id) {
            el.classList.add('selected');
        }
    });
}

function scrollToBlock(id) {
    const el = document.querySelector(`.block-item[data-id="${id}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('selected');
        setTimeout(() => el.classList.remove('selected'), 2000);
    }
}

function updateBlockContent(id, newContent) {
    const block = getBlockById(id);
    if (block && !BLOCK_TYPES[block.type]?.isContainer) {
        block.content = newContent;
    }
}

function uploadImageForBlock(blockId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const block = getBlockById(blockId);
                if (block) {
                    block.content = `<img src="${ev.target.result}" alt="Afbeelding">`;
                    renderBlocks();
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function showAddBlockToContainer(containerId) {
    showBlockTypeSelector(containerId);
}

function showBlockTypeSelector(parentId = null) {
    const types = Object.keys(BLOCK_TYPES);
    let html = `
        <div class="layer-selector-modal" style="min-width:350px; max-height:70vh; overflow-y:auto;">
            <h3><i class="fas fa-plus"></i> Kies blok type</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    `;
    
    types.forEach(type => {
        const info = BLOCK_TYPES[type];
        html += `
            <button onclick="addBlockToPage('${type}', ${parentId || 'null'}); closeLayerSelector();" class="layer-option" style="padding:8px 12px; font-size:13px;">
                <i class="fas ${info.icon}"></i>
                <span>${info.label}</span>
            </button>
        `;
    });
    
    html += `
            </div>
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

// ===== BLOK SETTINGS EDITOR =====
function editBlockSettings(blockId) {
    const block = getBlockById(blockId);
    if (!block) return;
    
    const info = BLOCK_TYPES[block.type] || { label: 'Blok' };
    const settings = block.settings || {};
    const isContainer = info.isContainer || false;
    
    const modal = document.getElementById('blockEditorModal');
    const title = document.getElementById('blockEditorTitle');
    const content = document.getElementById('blockEditorContent');
    
    title.innerHTML = `<i class="fas fa-cog"></i> Instellingen: ${info.label} #${block.id}`;
    
    let html = `
        <div class="form-group">
            <label>Blok naam (voor jezelf)</label>
            <input type="text" id="blockLabel" value="${block.label || info.label}" class="form-control">
        </div>
        <div class="form-group">
            <label>CSS Class (optioneel)</label>
            <input type="text" id="blockClass" value="${settings.className || ''}" placeholder="bijv. my-custom-class" class="form-control">
        </div>
    `;
    
    if (isContainer) {
        html += `
            <div class="form-group">
                <label>Achtergrond (kleur of gradient)</label>
                <input type="text" id="blockBg" value="${settings.background || 'transparent'}" placeholder="bijv. #ffffff of linear-gradient(...)" class="form-control">
                <div style="display:flex; gap:8px; margin-top:6px;">
                    <input type="color" value="${settings.background && settings.background.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff'}" 
                           onchange="document.getElementById('blockBg').value = this.value;" 
                           style="width:40px; height:40px; border:2px solid #e2e8f0; border-radius:8px; cursor:pointer;">
                    <span style="font-size:12px; color:#a0aec0; display:flex; align-items:center;">Kies kleur</span>
                </div>
            </div>
            <div class="form-group">
                <label>Padding</label>
                <input type="text" id="blockPadding" value="${settings.padding || '20px'}" placeholder="bijv. 20px 40px" class="form-control">
            </div>
        `;
    }
    
    if (block.type === 'columns') {
        html += `
            <div class="form-group">
                <label>Aantal kolommen</label>
                <select id="columnCount" class="form-control">
                    <option value="2" ${block.columns === 2 ? 'selected' : ''}>2 kolommen</option>
                    <option value="3" ${block.columns === 3 ? 'selected' : ''}>3 kolommen</option>
                    <option value="4" ${block.columns === 4 ? 'selected' : ''}>4 kolommen</option>
                    <option value="1" ${block.columns === 1 ? 'selected' : ''}>1 kolom</option>
                </select>
            </div>
            <div class="form-group">
                <label>Afstand tussen kolommen</label>
                <input type="text" id="columnGap" value="${settings.gap || '20px'}" placeholder="bijv. 20px" class="form-control">
            </div>
        `;
    }
    
    if (block.type === 'button') {
        html += `
            <div class="form-group">
                <label>Knop tekst</label>
                <input type="text" id="btnText" value="${settings.text || 'Klik hier'}" class="form-control">
            </div>
            <div class="form-group">
                <label>Link</label>
                <input type="text" id="btnLink" value="${settings.link || '#'}" placeholder="bijv. https://..." class="form-control">
            </div>
            <div class="form-group">
                <label>Knop kleur</label>
                <input type="color" id="btnColor" value="${settings.color || '#4f8cf7'}" class="form-control" style="width:60px; padding:2px; height:40px;">
            </div>
        `;
    }
    
    if (block.type === 'heading') {
        html += `
            <div class="form-group">
                <label>Tekst uitlijning</label>
                <select id="headingAlign" class="form-control">
                    <option value="left" ${settings.textAlign === 'left' ? 'selected' : ''}>Links</option>
                    <option value="center" ${settings.textAlign === 'center' ? 'selected' : ''}>Centrum</option>
                    <option value="right" ${settings.textAlign === 'right' ? 'selected' : ''}>Rechts</option>
                </select>
            </div>
            <div class="form-group">
                <label>Kleur</label>
                <input type="color" id="headingColor" value="${settings.color || '#2d3748'}" class="form-control" style="width:60px; padding:2px; height:40px;">
            </div>
            <div class="form-group">
                <label>Lettergrootte</label>
                <input type="text" id="headingSize" value="${settings.fontSize || '32px'}" placeholder="bijv. 32px" class="form-control">
            </div>
        `;
    }
    
    if (block.type === 'text') {
        html += `
            <div class="form-group">
                <label>Tekst uitlijning</label>
                <select id="textAlign" class="form-control">
                    <option value="left" ${settings.textAlign === 'left' ? 'selected' : ''}>Links</option>
                    <option value="center" ${settings.textAlign === 'center' ? 'selected' : ''}>Centrum</option>
                    <option value="right" ${settings.textAlign === 'right' ? 'selected' : ''}>Rechts</option>
                </select>
            </div>
            <div class="form-group">
                <label>Kleur</label>
                <input type="color" id="textColor" value="${settings.color || '#4a5568'}" class="form-control" style="width:60px; padding:2px; height:40px;">
            </div>
            <div class="form-group">
                <label>Lettergrootte</label>
                <input type="text" id="textSize" value="${settings.fontSize || '16px'}" placeholder="bijv. 16px" class="form-control">
            </div>
        `;
    }
    
    if (block.type === 'spacer') {
        html += `
            <div class="form-group">
                <label>Hoogte</label>
                <input type="text" id="spacerHeight" value="${settings.height || '40px'}" placeholder="bijv. 40px" class="form-control">
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    document.getElementById('saveBlockEditorBtn').onclick = function() {
        saveBlockSettings(blockId);
    };
    
    document.getElementById('closeBlockEditor').onclick = closeBlockEditor;
    document.getElementById('closeBlockEditorBtn').onclick = closeBlockEditor;
    
    modal.style.display = 'block';
    editingBlockId = blockId;
}

function saveBlockSettings(blockId) {
    const block = getBlockById(blockId);
    if (!block) return;
    
    const info = BLOCK_TYPES[block.type];
    const isContainer = info?.isContainer || false;
    
    const label = document.getElementById('blockLabel')?.value;
    const className = document.getElementById('blockClass')?.value;
    
    if (!block.settings) block.settings = {};
    if (label) block.label = label;
    block.settings.className = className;
    
    if (isContainer) {
        const bg = document.getElementById('blockBg')?.value;
        const padding = document.getElementById('blockPadding')?.value;
        if (bg) block.settings.background = bg;
        if (padding) block.settings.padding = padding;
    }
    
    if (block.type === 'columns') {
        const cols = document.getElementById('columnCount')?.value;
        const gap = document.getElementById('columnGap')?.value;
        if (cols) block.columns = parseInt(cols);
        if (gap) block.settings.gap = gap;
    }
    
    if (block.type === 'button') {
        const text = document.getElementById('btnText')?.value;
        const link = document.getElementById('btnLink')?.value;
        const color = document.getElementById('btnColor')?.value;
        if (text) block.settings.text = text;
        if (link) block.settings.link = link;
        if (color) block.settings.color = color;
        block.content = `<a href="${link || '#'}" class="btn-preview" style="background:${color || '#4f8cf7'};">${text || 'Klik hier'}</a>`;
    }
    
    if (block.type === 'heading') {
        const align = document.getElementById('headingAlign')?.value;
        const color = document.getElementById('headingColor')?.value;
        const size = document.getElementById('headingSize')?.value;
        if (align) block.settings.textAlign = align;
        if (color) block.settings.color = color;
        if (size) block.settings.fontSize = size;
    }
    
    if (block.type === 'text') {
        const align = document.getElementById('textAlign')?.value;
        const color = document.getElementById('textColor')?.value;
        const size = document.getElementById('textSize')?.value;
        if (align) block.settings.textAlign = align;
        if (color) block.settings.color = color;
        if (size) block.settings.fontSize = size;
    }
    
    if (block.type === 'spacer') {
        const height = document.getElementById('spacerHeight')?.value;
        if (height) block.settings.height = height;
    }
    
    closeBlockEditor();
    renderBlocks();
    updateStructureTree();
}

function closeBlockEditor() {
    document.getElementById('blockEditorModal').style.display = 'none';
    editingBlockId = null;
}

// ===== EXPORT FUNCTIES =====
function getPageBlocks(page) {
    return pageBlocks[page] || [];
}

function getAllBlocks() {
    return pageBlocks;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    window.addBlockToPage = addBlockToPage;
    window.removeBlock = removeBlock;
    window.duplicateBlock = duplicateBlock;
    window.moveBlock = moveBlock;
    window.selectBlock = selectBlock;
    window.scrollToBlock = scrollToBlock;
    window.updateBlockContent = updateBlockContent;
    window.uploadImageForBlock = uploadImageForBlock;
    window.showAddBlockToContainer = showAddBlockToContainer;
    window.showBlockTypeSelector = showBlockTypeSelector;
    window.closeLayerSelector = closeLayerSelector;
    window.editBlockSettings = editBlockSettings;
    window.saveBlockSettings = saveBlockSettings;
    window.closeBlockEditor = closeBlockEditor;
    window.renderBlocks = renderBlocks;
    window.updateStructureTree = updateStructureTree;
    window.getPageBlocks = getPageBlocks;
    window.getAllBlocks = getAllBlocks;
    window.blockIdCounter = blockIdCounter;
    window.pageBlocks = pageBlocks;
});