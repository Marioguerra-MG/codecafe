import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
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
    const nome = document.getElementById('nomeInput').value;
    const email = document.getElementById('emailInput').value;  
    const senha = document.getElementById('senhaInput').value;  
    const confirmarSenha = document.getElementById('confirmarSenhaInput').value;

    // Verificar se os campos não estão vazios
    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        // Criar usuário com email e senha
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        alert("Usuário cadastrado com sucesso!");

        // Atualizar o nome do usuário no Firebase Authentication
        await updateProfile(userCredential.user, {
            displayName: nome  // Define o nome do usuário
        });

        // Salvar dados do usuário no Firestore
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            email: email,
            nome: nome,
            criadoEm: new Date()
        });

        // Redirecionar para a página 'index.html' após o cadastro
        window.location.href = "/index.html";  // Certifique-se de que o caminho está correto

    } catch (error) {
        alert(`Erro: ${error.message}`);
        console.error("Erro ao cadastrar: ", error);
    }
});
