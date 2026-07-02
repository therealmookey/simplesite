// =============================================
// SIMPLESITE - Hoofdapplicatie
// =============================================

// ===== GLOBALE STATE =====
const App = {
    siteTitle: 'Mijn Website',
    primaryColor: '#4f8cf7',
    logo: null,
    navItems: [],
    navStyle: 'horizontal',
    navBgColor: '#ffffff',
    navBgImage: null,
    pageBackgrounds: {},
    layers: {},
    currentStep: 1,
    currentPage: 'index',
    
    // ===== DIRTY TRACKING =====
    isDirty: true  // Start als dirty zodat eerste export getoond wordt
};

// ===== DIRTY FUNCTIES =====
function markDirty() {
    App.isDirty = true;
    updateStatusDisplay();
}

function markClean() {
    App.isDirty = false;
    updateStatusDisplay();
}

function updateStatusDisplay() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (!statusDot || !statusText) return;
    
    if (App.isDirty) {
        statusDot.className = 'status-dot dirty';
        statusDot.style.backgroundColor = '#fc8181';
        statusText.textContent = 'Wijzigingen niet opgeslagen';
        statusText.style.color = '#e53e3e';
    } else {
        statusDot.className = 'status-dot clean';
        statusDot.style.backgroundColor = '#38a169';
        statusText.textContent = 'Alles is up-to-date';
        statusText.style.color = '#38a169';
    }
}

// ===== INCLUDES LADEN =====
async function loadIncludes() {
    try {
        const headerRes = await fetch('assets/includes/header.html');
        document.getElementById('header-placeholder').innerHTML = await headerRes.text();

        const footerRes = await fetch('assets/includes/footer.html');
        document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
    } catch (error) {
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadIncludes();
    initWizard();
    initLayers();
    initPayment();
    updateStatusDisplay();
});

// Expose functions
window.markDirty = markDirty;
window.markClean = markClean;
window.updateStatusDisplay = updateStatusDisplay;