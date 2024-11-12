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

const form = document.querySelector('form');
const tarefaLista = document.getElementById('tarefa-lista');

// Função para adicionar tarefa ao Firestore
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let tarefa = document.querySelector('[name=tarefa]').value;

    try {
        // Usando addDoc e collection corretamente na versão modular
        await addDoc(collection(db, 'tarefa'), {
            tarefa: tarefa
        });
        alert('Tarefa cadastrada com sucesso!');
        form.reset();
    } catch (error) {
        alert('Erro ao cadastrar a tarefa: ' + error.message);
    }
});

// Função para exibir as tarefas em tempo real
onSnapshot(collection(db, 'tarefa'), (snapshot) => {
    tarefaLista.innerHTML = '';  // Limpar lista antes de adicionar novas tarefas
    snapshot.forEach((doc) => {
        let tarefa = doc.data().tarefa;
        let li = document.createElement('li');
        li.textContent = tarefa;
        tarefaLista.appendChild(li);
    });
});
