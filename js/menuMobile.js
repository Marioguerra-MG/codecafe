document.addEventListener("DOMContentLoaded", () => {
    const btnMobile = document.getElementById("btnMobile");
    const menuMobile = document.querySelector(".menuMobile");

    // Alterna a visibilidade do menu ao clicar no botão
    btnMobile.addEventListener("click", () => {
        menuMobile.classList.toggle("show");
    });

    // Opcional: Fechar o menu ao clicar fora dele
    document.addEventListener("click", (event) => {
        if (!menuMobile.contains(event.target) && !btnMobile.contains(event.target)) {
            menuMobile.classList.remove("show");
        }
    });
});




