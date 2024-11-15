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

// Função para exibir o nome do usuário autenticado
auth.onAuthStateChanged(user => {
    if (user) {
        nomePerfil.textContent = user.displayName || 'Usuário';
    } else {
        nomePerfil.textContent = 'Olá, visitante';
    }
});

// Exibir as mensagens em tempo real
onSnapshot(collection(db, 'mensagens'), (snapshot) => {
    tarefaLista.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.usuario}: ${data.mensagem}`;
        tarefaLista.appendChild(li);
    });
});

// Enviar uma mensagem
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensagem = campoConversa.value;
    const user = auth.currentUser;

    if (user) {
        const nome = user.displayName;
        try {
            await addDoc(collection(db, 'mensagens'), {
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
