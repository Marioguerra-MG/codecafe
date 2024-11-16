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

// Referências para os elementos HTML
const form = document.querySelector('form');
const tarefaLista = document.getElementById('tarefa-lista');
const campoConversa = document.getElementById('CampoConversa');
const nomePerfil = document.getElementById('nomePerfil');
const salasLista = document.getElementById('salas-lista');
const nomeComunidade = document.getElementById('nomeComunidade');
const logoutButton = document.getElementById('logoutButton');

// Variável global para armazenar o ID da sala atual
let salaIdAtual = null;

// Função para exibir o nome do usuário autenticado
auth.onAuthStateChanged(user => {
    if (user) {
        nomePerfil.textContent = user.displayName || 'Usuário';
    } else {
        nomePerfil.textContent = 'Olá, visitante';
    }
});

// Exibir as salas de chat em tempo real
onSnapshot(collection(db, 'salas'), (snapshot) => {
    salasLista.innerHTML = '';  // Limpar a lista antes de exibir novamente
    snapshot.forEach(doc => {
        const sala = doc.data();
        const li = document.createElement('li');
        li.textContent = sala.nomeSala;
        li.setAttribute('data-id', doc.id);  // Adicionar o atributo data-id
        li.addEventListener('click', () => {
            entrarNaSala(doc.id);  // Passa o ID da sala
        });
        salasLista.appendChild(li);
    });
});

// Criar uma nova sala de chat
document.getElementById('addComunidades').addEventListener('click', async () => {
    const nomeSala = prompt("Digite o nome da nova sala:");
    if (nomeSala) {
        try {
            await addDoc(collection(db, 'salas'), { nomeSala: nomeSala });
        } catch (error) {
            console.error("Erro ao criar a sala: ", error);
        }
    }
});

// Função para o usuário entrar na sala
function entrarNaSala(salaId) {
    // Mudar o título para refletir a sala escolhida
    const salaElement = salasLista.querySelector(`[data-id="${salaId}"]`);
    const nomeSala = salaElement ? salaElement.textContent : 'Sala não encontrada';  // Verificar se encontrou a sala
    nomeComunidade.textContent = `${nomeSala}`;

    // Armazenar o ID da sala atual
    salaIdAtual = salaId;

    // Alterar a coleção de mensagens para essa sala
    onSnapshot(collection(db, 'salas', salaId, 'mensagens'), (snapshot) => {
        tarefaLista.innerHTML = '';  // Limpar a lista de mensagens antes de exibir novas
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.usuario}: ${data.mensagem}`;

            // Criar botão de exclusão apenas para a mensagem do usuário autenticado
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#10006;'; // Símbolo "X" para exclusão (código Unicode)
            deleteButton.classList.add('delete-btn'); // Classe CSS para estilizar o botão

            // Verificar se o usuário é o dono da mensagem
            if (auth.currentUser && data.usuario === auth.currentUser.displayName) {
                deleteButton.addEventListener('click', () => excluirMensagem(doc.id));
                li.appendChild(deleteButton); // Adiciona o botão de exclusão apenas para a própria mensagem
            }

            tarefaLista.appendChild(li);
        });
    });
}

// Função para excluir a mensagem
async function excluirMensagem(mensagemId) {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
        try {
            await deleteDoc(doc(db, 'salas', salaIdAtual, 'mensagens', mensagemId));
            console.log("Mensagem excluída com sucesso");
        } catch (error) {
            console.error("Erro ao excluir a mensagem: ", error);
        }
    }
}

// Enviar mensagem para a sala
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensagem = campoConversa.value;
    const user = auth.currentUser;

    if (user && salaIdAtual) { // Verifica se há um usuário autenticado e uma sala selecionada
        const nome = user.displayName;
        try {
            await addDoc(collection(db, 'salas', salaIdAtual, 'mensagens'), {
                mensagem: mensagem,
                usuario: nome,
                criadoEm: new Date()
            });
            campoConversa.value = ''; // Limpar campo após o envio
        } catch (error) {
            console.error("Erro ao enviar a mensagem: ", error);
        }
    } else {
        alert("Usuário não autenticado ou sala não selecionada.");
    }
});

// Função para logout
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Usuário desconectado');
        nomePerfil.textContent = 'Olá, visitante'; // Atualiza o nome do perfil
        window.location.href = "/index.html"; // Redireciona para a tela de login
    }).catch((error) => {
        console.error('Erro ao fazer logout: ', error);
    });
});
