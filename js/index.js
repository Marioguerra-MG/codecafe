const form = document.querySelector('form');
const tarefaLista = document.getElementById('tarefa-lista'); 

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let tarefa = document.querySelector('[name=tarefa]').value;
    db.collection('tarefa').add({
        tarefa: tarefa
    });
    alert('Cadastrado com sucesso!');
    form.reset();
})

db.collection('tarefa').onSnapshot((snapshot)=>{
    tarefaLista.innerHTML = "";
    snapshot.forEach((doc) => {
        let tarefa = doc.data().tarefa;
        let li = document.createElement('li');
        li.textContent = tarefa;
        tarefaLista.appendChild(li);   
    });   
});

