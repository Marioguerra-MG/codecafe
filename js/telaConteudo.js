import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
    snapshot.forEach(async (doc) => {
        const sala = doc.data();
        const li = document.createElement('li');
        li.textContent = sala.nomeSala;
        li.setAttribute('data-id', doc.id); // Define o ID como atributo
        li.addEventListener('click', () => entrarNaSala(doc.id));

        // Verificar se o usuário autenticado é o criador da sala
        const user = auth.currentUser;
        if (user && sala.criadoPor === user.uid) {
            // Adicionar ícone de exclusão à sala se for o criador
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';  // Ícone Font Awesome
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', (e) => excluirSala(doc.id, e));
            li.appendChild(deleteButton);
        }

        salasLista.appendChild(li);
    });
});

// Criar uma nova sala de chat
addComunidades.addEventListener('click', async () => {
    const nomeSala = prompt("Digite o nome da nova sala:");
    const user = auth.currentUser;
    if (nomeSala && user) {
        try {
            await addDoc(collection(db, 'salas'), {
                nomeSala: nomeSala,
                criadoPor: user.uid // Adiciona o UID do usuário
            });
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

    // Exibir campo de envio de mensagens
    document.getElementById('CampoConversa').style.display = 'block';

    // Exibir as mensagens em tempo real, ordenadas pela data de envio (do mais recente para o mais antigo)
    const mensagensQuery = query(collection(db, 'salas', salaId, 'mensagens'), orderBy('criadoEm', 'desc'));
    onSnapshot(mensagensQuery, (snapshot) => {
        tarefaLista.innerHTML = ''; // Limpa as mensagens antes de atualizar
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
    event.stopPropagation();  // Impede que o clique na exclusão acione a navegação na sala

    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para excluir a sala.");
        return;
    }

    // Obter os dados da sala para verificar se o usuário é o criador
    const salaRef = doc(db, 'salas', salaId);
    const salaSnap = await getDoc(salaRef);

    if (salaSnap.exists()) {
        const salaData = salaSnap.data();

        // Verifica se o usuário é o criador da sala
        if (salaData.criadoPor === user.uid) {
            if (confirm("Tem certeza que deseja excluir esta sala?")) {
                try {
                    await deleteDoc(salaRef);
                    console.log("Sala excluída com sucesso!");
                } catch (error) {
                    console.error("Erro ao excluir a sala:", error);
                }
            }
        } else {
            alert("Você não pode excluir uma sala que não criou.");
        }
    } else {
        console.error("Sala não encontrada.");
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
                criadoEm: new Date() // Adiciona a data de criação para ordenação
            });
            campoConversa.value = ''; // Limpa o campo
        } catch (error) {
            console.error("Erro ao enviar a mensagem:", error);
        }
    } else {
        alert("Selecione uma sala para enviar a mensagem.");
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

// Função para filtrar comunidades em tempo real
document.addEventListener('DOMContentLoaded', () => {
    const inputComunidades = document.getElementById('procurar');
    
    inputComunidades.addEventListener('input', () => {
        const termoBusca = inputComunidades.value.toLowerCase();

        // Obter as salas da coleção 'salas'
        onSnapshot(collection(db, 'salas'), (snapshot) => {
            salasLista.innerHTML = ''; // Limpa a lista antes de adicionar as salas filtradas

            snapshot.forEach(async (doc) => {
                const sala = doc.data();

                // Verificar se a sala corresponde ao termo de busca
                if (sala.nomeSala.toLowerCase().includes(termoBusca)) {
                    const li = document.createElement('li');
                    li.textContent = sala.nomeSala;
                    li.setAttribute('data-id', doc.id);
                    li.addEventListener('click', () => entrarNaSala(doc.id));

                    // Verificar se o usuário autenticado é o criador da sala
                    const user = auth.currentUser;
                    if (user && sala.criadoPor === user.uid) {
                        // Adicionar ícone de exclusão à sala se for o criador
                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';  // Ícone Font Awesome
                        deleteButton.classList.add('delete-btn');
                        deleteButton.addEventListener('click', (e) => excluirSala(doc.id, e)); // Passar o evento aqui para evitar propagação
                        li.appendChild(deleteButton); // Adiciona o botão de exclusão à lista
                    }

                    salasLista.appendChild(li);
                }
            });
        });
    });
});
