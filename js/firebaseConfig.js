import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

// Função de cadastro
document.getElementById('btnCadastrar').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value;  // Use o ID correto
    const senha = document.getElementById('senhaInput').value;  // Use o ID correto
    const confirmarSenha = document.getElementById('confirmarSenhaInput').value;  // Use o ID correto

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        alert("Usuário cadastrado com sucesso!");

        // Salvar dados do usuário no Firestore
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            email: email,
            criadoEm: new Date()
        });

        window.location.href = "/index.html";  // Redireciona para a página 'index.html'

    } catch (error) {
        alert(`Erro: ${error.message}`);
        console.error("Erro ao cadastrar: ", error);
    }
});

