
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

// Função de login
document.getElementById('entrar').addEventListener('click', async () => {
    const email = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        alert("Login bem-sucedido!");

        // Redirecionar o usuário após o login
        window.location.href = "/conteudo/telaConteudo.html";  // Aqui você pode redirecionar para a página principal após o login
    } catch (error) {
        alert(`Erro: ${error.message}`);
        console.error("Erro ao fazer login: ", error);
    }
});
