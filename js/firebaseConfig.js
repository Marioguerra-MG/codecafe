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

    // Validação de campos
    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (!email.includes('@') || email.length < 5) {
        alert("Por favor, insira um email válido.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        // Criar usuário com email e senha
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        alert("Usuário cadastrado com sucesso!");

        // Atualizar perfil do usuário
        await updateProfile(user, {
            displayName: nome,
        });

        // Salvar dados no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            email: email,
            usuario: nome,
            criadoEm: new Date()
        });

        // Redirecionar para a página inicial
        window.location.href = "index.html";

    } catch (error) {
        let errorMessage = "Erro ao cadastrar. Tente novamente.";

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Este email já está em uso.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "A senha deve ter no mínimo 6 caracteres.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "O email fornecido não é válido.";
        }

        alert(errorMessage);
        console.error("Erro ao cadastrar:", error);
    }
});
