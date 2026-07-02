// =============================================
// SIMPLESITE - Hoofdapplicatie
// =============================================

// ===== GLOBALE STATE =====
const App = {
    siteTitle: 'Mijn Website',
    primaryColor: '#4f8cf7',
    logo: null,
    pages: ['home', 'over', 'contact'],
    layers: {
        home: [],
        over: [],
        contact: []
    },
    currentStep: 1,
    currentPage: 'home',
    layerIdCounter: 0,
    selectedLayerId: null
};

// ===== INCLUDES LADEN =====
async function loadIncludes() {
    try {
        const headerRes = await fetch('assets/includes/header.html');
        document.getElementById('header-placeholder').innerHTML = await headerRes.text();

        const footerRes = await fetch('assets/includes/footer.html');
        document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
    } catch (error) {
        // Fallback
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
});