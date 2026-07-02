// Laad de header vanuit de includes map
fetch('includes/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    })
    .catch(error => console.log('Header kon niet worden geladen:', error));

// Laad de footer vanuit de includes map
fetch('includes/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => console.log('Footer kon niet worden geladen:', error));