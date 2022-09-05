let user = document.querySelector('#user')
user.addEventListener('click', ()=>{
    let nome = document.querySelector('#nome').value
    let email = document.querySelector('#email').value
    let senha = document.querySelector('#senha').value
    let rep_senha = document.querySelector('#rep_senha').value
    event.preventDefault()


    const response = fetch ('http://localhost:8080/admin/add-usuario', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({nome, email, senha, rep_senha})
    }).then((response)=>response.json())
    .then((data)=> console.log(data))
})