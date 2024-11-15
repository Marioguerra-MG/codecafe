import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

    // Alterar a coleção de mensagens para essa sala
    onSnapshot(collection(db, 'salas', salaId, 'mensagens'), (snapshot) => {
        tarefaLista.innerHTML = '';  // Limpar a lista de mensagens antes de exibir novas
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.usuario}: ${data.mensagem}`;
            tarefaLista.appendChild(li);
        });
    });

    // Enviar mensagem para a sala
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mensagem = campoConversa.value;
        const user = auth.currentUser;

        if (user) {
            const nome = user.displayName;
            try {
                await addDoc(collection(db, 'salas', salaId, 'mensagens'), {
                    mensagem: mensagem,
                    usuario: nome,
                    criadoEm: new Date()
                });
                campoConversa.value = ''; // Limpar campo após o envio
            } catch (error) {
                console.error("Erro ao enviar a mensagem: ", error);
            }
        } else {
            alert("Usuário não autenticado.");
        }
    });
}
