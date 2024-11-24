// Inserir emoji no campo de texto
const emojis = document.querySelectorAll('.emoji');
const campoConversa = document.getElementById('CampoConversa');

emojis.forEach(emoji => {
    emoji.addEventListener('click', () => {
        campoConversa.value += emoji.getAttribute('data-emoji'); // Adiciona o emoji ao campo de texto
    });
});