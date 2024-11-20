import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

// Seleção de elementos DOM
const form = document.querySelector('form');
const tarefaLista = document.getElementById('tarefa-lista');
const campoConversa = document.getElementById('CampoConversa');
const nomePerfil = document.getElementById('nomePerfil');
const salasLista = document.getElementById('salas-lista');
const nomeComunidade = document.getElementById('nomeComunidade');
const logoutButton = document.getElementById('logoutButton');
const addComunidades = document.getElementById('addComunidades');

// Variável global para armazenar o ID da sala atual
let salaIdAtual = null;

// Exibir nome do usuário autenticado
auth.onAuthStateChanged(user => {
    if (user) {
        nomePerfil.textContent = user.displayName || 'Usuário';
    } else {
        nomePerfil.textContent = 'Olá, visitante';
    }
});

// Exibir salas de chat em tempo real
onSnapshot(collection(db, 'salas'), (snapshot) => {
    salasLista.innerHTML = ''; // Limpa a lista antes de atualizar
    snapshot.forEach(doc => {
        const sala = doc.data();
        const li = document.createElement('li');
        li.textContent = sala.nomeSala;
        li.setAttribute('data-id', doc.id); // Define o ID como atributo
        li.addEventListener('click', () => entrarNaSala(doc.id));
        
        // Adicionar ícone de exclusão à sala
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';  // Ícone Font Awesome
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', (e) => excluirSala(doc.id, e));
        li.appendChild(deleteButton);
        
        salasLista.appendChild(li);
    });
});

// Criar uma nova sala de chat
addComunidades.addEventListener('click', async () => {
    const nomeSala = prompt("Digite o nome da nova sala:");
    if (nomeSala) {
        try {
            await addDoc(collection(db, 'salas'), { nomeSala: nomeSala });
        } catch (error) {
            console.error("Erro ao criar a sala:", error);
        }
    }
});

// Função para o usuário entrar na sala
function entrarNaSala(salaId) {
    const salaElement = salasLista.querySelector(`[data-id="${salaId}"]`);
    const nomeSala = salaElement ? salaElement.textContent : 'Sala não encontrada';
    nomeComunidade.textContent = nomeSala;

    salaIdAtual = salaId;

    onSnapshot(collection(db, 'salas', salaId, 'mensagens'), (snapshot) => {
        tarefaLista.innerHTML = ''; // Limpa mensagens antes de atualizar
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.usuario}: ${data.mensagem}`;

            // Botão de exclusão para mensagens do usuário atual
            if (auth.currentUser && data.usuario === auth.currentUser.displayName) {
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';  // Ícone Font Awesome
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => excluirMensagem(doc.id));
                li.appendChild(deleteButton);
            }

            tarefaLista.appendChild(li);
        });
    });
}

// Função para excluir mensagem
async function excluirMensagem(mensagemId) {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
        try {
            await deleteDoc(doc(db, 'salas', salaIdAtual, 'mensagens', mensagemId));
        } catch (error) {
            console.error("Erro ao excluir a mensagem:", error);
        }
    }
}

// Função para excluir sala
async function excluirSala(salaId, event) {
    event.stopPropagation();  // Evitar que o click no botão de excluir dispare o clique da sala
    if (confirm("Tem certeza que deseja excluir esta sala?")) {
        try {
            await deleteDoc(doc(db, 'salas', salaId));
        } catch (error) {
            console.error("Erro ao excluir a sala:", error);
        }
    }
}

// Enviar mensagem
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensagem = campoConversa.value;
    const user = auth.currentUser;

    if (user && salaIdAtual) {
        try {
            await addDoc(collection(db, 'salas', salaIdAtual, 'mensagens'), {
                mensagem: mensagem,
                usuario: user.displayName,
                criadoEm: new Date()
            });
            campoConversa.value = ''; // Limpa o campo
        } catch (error) {
            console.error("Erro ao enviar a mensagem:", error);
        }
    } else {
        alert("Usuário não autenticado ou sala não selecionada.");
    }
});

// Logout
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Usuário desconectado');
        nomePerfil.textContent = 'Olá, visitante';
        window.location.href = "/index.html"; // Redireciona para a tela de login
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
    });
});
