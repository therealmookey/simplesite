// =============================================
// SIMPLESITE - Betaling
// =============================================

function initPayment() {
    document.getElementById('purchaseBtn').addEventListener('click', openPaymentModal);
    
    document.querySelector('.close-modal').addEventListener('click', closePaymentModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('paymentModal')) {
            closePaymentModal();
        }
    });
    
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            processPayment(this.dataset.method);
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePaymentModal();
        }
    });
}

function openPaymentModal() {
    if (App.pages.length === 0 || Object.values(App.layers).every(arr => arr.length === 0)) {
        alert('⚠️ Je hebt nog geen content toegevoegd! Doorloop eerst alle stappen.');
        return;
    }
    document.getElementById('paymentModal').style.display = 'block';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function processPayment(method) {
    const modal = document.getElementById('paymentModal');
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <i class="fas fa-spinner fa-spin" style="font-size:48px; color:#4f8cf7;"></i>
            <h2 style="margin-top:20px;">Verwerking...</h2>
            <p>Jouw betaling via ${method} wordt verwerkt.</p>
        </div>
    `;

    setTimeout(() => {
        content.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <i class="fas fa-check-circle" style="font-size:48px; color:#38a169;"></i>
                <h2 style="margin-top:20px;">✅ Betaling gelukt!</h2>
                <p>Jouw website wordt nu voorbereid...</p>
            </div>
        `;

        setTimeout(() => {
            closePaymentModal();
            generateAndDownload();
            
            setTimeout(() => {
                document.querySelector('.modal-content').innerHTML = `
                    <span class="close-modal">&times;</span>
                    <h2><i class="fas fa-credit-card"></i> Betaal voor jouw website</h2>
                    <div class="payment-details">
                        <p><strong>Product:</strong> SimpleSite Website</p>
                        <p><strong>Prijs:</strong> €49,- (eenmalig)</p>
                        <p><strong>Wat krijg je:</strong></p>
                        <ul>
                            <li>✅ Complete HTML/CSS/JS bestanden</li>
                            <li>✅ Alle pagina's en lagen</li>
                            <li>✅ Responsive design</li>
                            <li>✅ Geen verborgen kosten</li>
                        </ul>
                    </div>
                    <div class="payment-methods">
                        <button class="pay-btn" data-method="ideal"><i class="fas fa-university"></i> iDEAL</button>
                        <button class="pay-btn" data-method="creditcard"><i class="fas fa-credit-card"></i> Creditcard</button>
                        <button class="pay-btn" data-method="paypal"><i class="fab fa-paypal"></i> PayPal</button>
                    </div>
                    <p class="payment-note">🔒 Veilige betaling - Simulatie modus</p>
                `;
                document.querySelector('.close-modal').onclick = closePaymentModal;
                document.querySelectorAll('.pay-btn').forEach(btn => {
                    btn.onclick = function() {
                        processPayment(this.dataset.method);
                    };
                });
            }, 500);
        }, 1500);
    }, 1500);
}