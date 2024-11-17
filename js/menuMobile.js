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


// Seleção de elementos DOM
const addComunidadesMenu = document.getElementById('addComunidades'); // Botão no menu mobile
const addCommunityForm = document.getElementById('addCommunityForm'); // Formulário de criar comunidade no menu mobile
const communityNameInput = document.getElementById('communityName'); // Campo de nome da comunidade no formulário
const createCommunityButton = document.getElementById('createCommunityButton'); // Botão de criar comunidade no formulário

// Exibir o formulário de criar comunidade no menu mobile
addComunidadesMenu.addEventListener('click', () => {
    addCommunityForm.style.display = addCommunityForm.style.display === 'none' ? 'block' : 'none';
});

// Função para criar comunidade
createCommunityButton.addEventListener('click', async () => {
    const nomeSala = communityNameInput.value.trim();
    
    if (nomeSala) {
        try {
            // Criar nova sala de chat no Firestore
            await addDoc(collection(db, 'salas'), { nomeSala: nomeSala });
            communityNameInput.value = ''; // Limpar o campo de texto após a criação
            addCommunityForm.style.display = 'none'; // Fechar o formulário
        } catch (error) {
            console.error("Erro ao criar a sala:", error);
        }
    } else {
        alert("Digite o nome da comunidade.");
    }
});

