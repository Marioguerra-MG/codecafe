import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { updateDoc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

// Função para formatar números grandes (ex: 1000 -> 1k, 1500 -> 1.5k)
// Função para formatar números grandes (ex: 1000 -> 1k, 1500 -> 1.5k)
function formatNumber(number) {
    if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k'; // Divide por 1000 e adiciona 'k'
    }
    return number.toString(); // Caso o número seja menor que 1000, exibe o número normal
}

// Exibir salas de chat em tempo real
onSnapshot(collection(db, 'salas'), (snapshot) => {
    salasLista.innerHTML = ''; // Limpa a lista antes de atualizar
    snapshot.forEach(async (doc) => {
        const sala = doc.data();
        const li = document.createElement('li');
        li.setAttribute('data-id', doc.id); // Define o ID como atributo
        li.classList.add('sala-item'); // Classe para o item de sala

        // Criar a estrutura do item da sala
        const nomeSala = document.createElement('h2');
        nomeSala.textContent = sala.nomeSala; // Nome da sala
        li.appendChild(nomeSala);

        // Adicionar número de curtidas abaixo do nome da sala
        const numeroCurtidas = document.createElement('h3');
        numeroCurtidas.classList.add('numeroCurtidas'); // Classe para facilitar a manipulação do elemento
        numeroCurtidas.textContent = `Curtidas: ${formatNumber(sala.curtidas)}`; // Formatar o número de curtidas
        li.appendChild(numeroCurtidas);

        li.addEventListener('click', () => {
            salaIdAtual = doc.id; // Atualiza a salaIdAtual com o ID da sala clicada
            entrarNaSala(doc.id);
        });

        //////////////////////////////////////////////
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

let curtiu = false; // Estado local para verificar se o usuário já curtiu

// Função para curtir uma sala
document.getElementById('emojiCurti').addEventListener('click', async () => {
    const salaId = salaIdAtual; // ID da sala atual

    if (!salaId) return; // Se não houver uma sala selecionada, não faz nada

    const salaRef = doc(db, 'salas', salaId);
    const salaSnap = await getDoc(salaRef);

    if (salaSnap.exists()) {
        const salaData = salaSnap.data();
        const userId = auth.currentUser?.uid; // UID do usuário logado

        if (!userId) {
            alert("Você precisa estar logado para curtir!");
            return;
        }

        // Verificar se o usuário já curtiu
        const usuariosCurtiram = salaData.usuariosCurtiram || [];
        if (!usuariosCurtiram.includes(userId)) {
            // Incrementa as curtidas e adiciona o usuário ao array
            await updateDoc(salaRef, {
                curtidas: salaData.curtidas + 1, // Incrementa uma curtida
                usuariosCurtiram: [...usuariosCurtiram, userId]
            });
        } else {
            alert("Você já curtiu esta sala.");
        }
    }
});


// Atualizar o número de curtidas na interface em tempo real
onSnapshot(collection(db, 'salas'), (snapshot) => {
    snapshot.forEach(doc => {
        const sala = doc.data();
        const salaElement = salasLista.querySelector(`[data-id="${doc.id}"]`); // Pega o elemento da sala correspondente

        if (salaElement) {
            const numeroCurtidas = salaElement.querySelector('.numeroCurtidas');
            if (numeroCurtidas) {
                // Formatar o número de curtidas
                numeroCurtidas.textContent = `Curtidas: ${formatNumber(sala.curtidas)}`;
            }
        }
    });
});






// Criar uma nova sala de chat
addComunidades.addEventListener('click', async () => {
    const nomeSala = prompt("Digite o nome da Comunidade:");
    const user = auth.currentUser;
    if (nomeSala && user) {
        try {
            await addDoc(collection(db, 'salas'), {
                nomeSala: nomeSala,
                criadoPor: user.uid, // Adiciona o UID do usuário
                curtidas: 0  // Inicializa o número de curtidas com 0 ///////////////////////
            });
        } catch (error) {
            console.error("Erro ao criar a Comunidade:", error);
        }
    }
});

// Função para o usuário entrar na sala
function entrarNaSala(salaId) {
    const salaElement = salasLista.querySelector(`[data-id="${salaId}"]`);
    //const nomeSala = salaElement ? salaElement.textContent : 'Sala não encontrada';
    const nomeSala = salaElement ? salaElement.querySelector('h2:first-of-type').textContent : 'Comunidade não encontrada';

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
            const nomeUsuario = document.createElement('span');
            const mensagem = document.createElement('span');

            // Nome do usuário com estilo azul
            nomeUsuario.textContent = `${data.usuario}: `;
            nomeUsuario.style.color = 'blue';
            nomeUsuario.style.fontWeight = 'bold';

            // Mensagem do usuário
            mensagem.textContent = data.mensagem;

            li.appendChild(nomeUsuario); // Adicionar o nome do usuário
            li.appendChild(mensagem);   // Adicionar a mensagem

            // Botão de exclusão para mensagens do usuário atual
            if (auth.currentUser && data.usuario === auth.currentUser.displayName) {
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>'; // Ícone Font Awesome
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
        alert("Você precisa estar logado para excluir a Comunidade.");
        return;
    }

    // Obter os dados da sala para verificar se o usuário é o criador
    const salaRef = doc(db, 'salas', salaId);
    const salaSnap = await getDoc(salaRef);

    if (salaSnap.exists()) {
        const salaData = salaSnap.data();

        // Verifica se o usuário é o criador da sala
        if (salaData.criadoPor === user.uid) {
            if (confirm("Tem certeza que deseja excluir esta Comunidade?")) {
                try {
                    await deleteDoc(salaRef);
                    console.log("Comunidade excluída com sucesso!");
                } catch (error) {
                    console.error("Erro ao excluir a Comunidade:", error);
                }
            }
        } else {
            alert("Você não pode excluir uma Comunidade que não criou.");
        }
    } else {
        console.error("Comunidade não encontrada.");
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
        alert("Selecione uma Comunidade para enviar a mensagem.");
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



document.addEventListener('DOMContentLoaded', () => {
    const inputComunidades = document.getElementById('procurar');
    const btnMinhasComunidades = document.getElementById('minhaComunidades'); // Botão de alternância
    let filtrarCriadasPorUsuario = false; // Controla o estado do filtro

    // Verifica se o botão existe antes de adicionar o evento
    if (btnMinhasComunidades) {
        // Alternar entre todas as salas e salas criadas pelo usuário
        btnMinhasComunidades.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique no botão ou no ícone seja capturado pelo evento global
            filtrarCriadasPorUsuario = !filtrarCriadasPorUsuario; // Alterna o estado do filtro

            // Alterna a classe 'ativo' para mudar a aparência do botão
            if (filtrarCriadasPorUsuario) {
                btnMinhasComunidades.classList.add('ativo');
            } else {
                btnMinhasComunidades.classList.remove('ativo');
            }

            atualizarListaSalas(); // Atualiza a lista de salas
        });
    }

    // Escutando eventos de input no campo de busca
    inputComunidades.addEventListener('input', atualizarListaSalas);

    // Evento global para cliques fora do botão e ícone
    document.addEventListener('click', (e) => {
        // Verifica se o clique não foi no botão nem no ícone
        if (!btnMinhasComunidades.contains(e.target)) {
            filtrarCriadasPorUsuario = false; // Reseta o estado do filtro
            btnMinhasComunidades.classList.remove('ativo'); // Remove a classe 'ativo'
            atualizarListaSalas(); // Atualiza a lista para mostrar todas as salas
        }
    });

    // Função para atualizar a lista de salas com base no filtro e busca
    function atualizarListaSalas() {
        const termoBusca = inputComunidades.value.toLowerCase();

        // Obter o usuário autenticado
        const user = auth.currentUser;

        // Obter as salas da coleção 'salas'
        onSnapshot(collection(db, 'salas'), (snapshot) => {
            salasLista.innerHTML = ''; // Limpa a lista antes de adicionar as salas filtradas

            snapshot.forEach(async (doc) => {
                const sala = doc.data();

                // Filtrar salas criadas pelo usuário, se necessário
                if (filtrarCriadasPorUsuario && (!user || sala.criadoPor !== user.uid)) {
                    return; // Ignora salas que não são do usuário autenticado
                }

                // Verificar se a sala corresponde ao termo de busca
                if (sala.nomeSala.toLowerCase().includes(termoBusca)) {
                    const li = document.createElement('li');
                    li.setAttribute('data-id', doc.id);
                    li.classList.add('sala-item'); // Classe para o item da sala

                    // Criar a estrutura do item da sala
                    const nomeSala = document.createElement('h2');
                    nomeSala.textContent = sala.nomeSala; // Nome da sala
                    li.appendChild(nomeSala);

                    // Adicionar número de curtidas abaixo do nome da sala
                    const numeroCurtidas = document.createElement('h3');
                    numeroCurtidas.textContent = `Curtidas: ${formatNumber(sala.curtidas)}`; // Formatar o número de curtidas
                    li.appendChild(numeroCurtidas);

                    li.addEventListener('click', () => entrarNaSala(doc.id));

                    // Se for uma sala criada pelo usuário autenticado, adicionar botão de exclusão
                    if (user && sala.criadoPor === user.uid) {
                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>'; // Ícone Font Awesome
                        deleteButton.classList.add('delete-btn');
                        deleteButton.addEventListener('click', (e) => excluirSala(doc.id, e));
                        li.appendChild(deleteButton);
                    }

                    salasLista.appendChild(li);
                }
            });
        });
    }

    // Inicializar a lista ao carregar a página
    atualizarListaSalas();
});

