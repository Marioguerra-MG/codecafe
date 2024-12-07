import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

//import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { updateProfile } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAkDa1oHvAF3P8rRFFHNnJ11DRNXy7M3l8",
    authDomain: "bancodados01-2e6d9.firebaseapp.com",
    projectId: "bancodados01-2e6d9",
    storageBucket: "bancodados01-2e6d9.appspot.com",
    messagingSenderId: "350816608484",
    appId: "1:350816608484:web:25d9cc47606b63c89d0cf1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



const alterarNomeButton = document.getElementById('alterarNome');
const novoNomeInput = document.getElementById('novoNome');

alterarNomeButton.addEventListener('click', async () => {
    const novoNome = novoNomeInput.value.trim();
    const user = auth.currentUser;

    if (user && novoNome) {
        try {
            // Atualizar o nome de exibição do usuário
            await updateProfile(user, { displayName: novoNome });

            // Atualizar o nome no DOM
            nomePerfil.textContent = novoNome;
             // Limpar o campo de entrada
             novoNomeInput.value = "";

            alert("Nome atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar o nome:", error);
            alert("Erro ao atualizar o nome. Tente novamente.");
        }
    } else {
        alert("Digite um nome válido.");
    }
});



// Função para alterar o e-mail
async function alterarEmail(novoEmail, senhaAtual) {
    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado para alterar o e-mail.");
        return;
    }

    try {
        // Reautenticar o usuário com a senha atual para permitir a alteração do e-mail
        const credenciais = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, credenciais);

        // Atualizar o e-mail
        await updateEmail(user, novoEmail);
        alert("E-mail alterado com sucesso!");
    } catch (error) {
        console.error("Erro ao alterar o e-mail:", error);
        alert("Erro ao alterar o e-mail. Verifique a senha atual ou o novo e-mail.");
    }
}

// Função para alterar a senha
async function alterarSenha(novaSenha, senhaAtual) {
    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado para alterar a senha.");
        return;
    }

    try {
        // Reautenticar o usuário com a senha atual para permitir a alteração da senha
        const credenciais = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, credenciais);

        // Atualizar a senha
        await updatePassword(user, novaSenha);
        alert("Senha alterada com sucesso!");
        document.getElementById("senhaAtualSenha").value = "";
        document.getElementById("novaSenha").value = "";

    } catch (error) {
        console.error("Erro ao alterar a senha:", error);
        alert("Erro ao alterar a senha. Verifique a senha atual ou a nova senha.");
    }
}


// Adicionar eventos de clique aos botões
/*document.getElementById('alterarEmailButton').addEventListener('click', () => {
    const novoEmail = document.getElementById('novoEmail').value;
    const senhaAtual = document.getElementById('senhaAtualEmail').value;
    alterarEmail(novoEmail, senhaAtual);
});*/

document.getElementById('alterarSenhaButton').addEventListener('click', () => {
    const novaSenha = document.getElementById('novaSenha').value;
    const senhaAtual = document.getElementById('senhaAtualSenha').value;
    alterarSenha(novaSenha, senhaAtual);
});


// Obter os elementos
const modal = document.getElementById("meuModal");
const botaoAbrir = document.getElementById("editarPerfil");
const botaoFechar = document.getElementById("fecharModal");

// Abrir o Modal
botaoAbrir.addEventListener("click", () => {
  modal.style.display = "block"; // Exibe o modal
});

// Fechar o Modal quando clicar no 'X'
botaoFechar.addEventListener("click", () => {
  modal.style.display = "none"; // Esconde o modal
});

// Fechar o Modal quando clicar fora dele
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

