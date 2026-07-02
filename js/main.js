// ========================================
// HEADER EN FOOTER LADEN
// ========================================

// Laad de header
fetch('includes/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    })
    .catch(error => {
        console.error('Header kon niet worden geladen:', error);
    });

// Laad de footer
fetch('includes/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => {
        console.error('Footer kon niet worden geladen:', error);
    });

console.log('✨ SimpleSite is klaar!');