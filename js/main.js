// ========================================
// HEADER EN FOOTER LADEN
// ========================================

// Laad de header
fetch('includes/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Header kon niet worden geladen');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header').innerHTML = data;
    })
    .catch(error => {
        console.error('Fout bij laden header:', error);
        document.getElementById('header').innerHTML = '<p style="color:red;padding:1rem;">Header kan niet worden geladen</p>';
    });

// Laad de footer
fetch('includes/footer.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Footer kon niet worden geladen');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => {
        console.error('Fout bij laden footer:', error);
        document.getElementById('footer').innerHTML = '<p style="color:red;padding:1rem;">Footer kan niet worden geladen</p>';
    });

// ========================================
// CONTACT FORMULIER
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Haal gegevens op
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simuleer verzending
            alert(`Bedankt ${name}! Je bericht is verzonden. We nemen binnen 24 uur contact op.`);
            
            // Reset formulier
            this.reset();
        });
    }
});

// ========================================
// SMOOTH SCROLL
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

console.log('🚀 SimpelSite is geladen!');