//Event listeners
let authorLinks = document.querySelectorAll("a");
for(let authorLink of authorLinks){
    authorLink.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(){
    var myModal = new bootstrap.Modal(document.getElementById('authorModal'));
    myModal.show();
    let url = `/api/author/${this.id}`;
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);

    let authorInfo = document.querySelector("#authorInfo");
    authorInfo.innerHTML = `<div class="author_card">
                                <h1 id="author_name"> ${data[0].firstName}
                                    ${data[0].lastName} </h1>
                                <img id="author_potrait" src="${data[0].portrait}"><br>
                                <div id="author_details">                            
                                    <span>Date of Birth: </span> ${data[0].dob} <br>
                                    <span>Date of Death: </span> ${data[0].dod} <br>
                                    <span>Sex: </span>  ${data[0].sex} <br>
                                    <span>Profession: </span> ${data[0].profession} <br>
                                    <span>Country: </span> ${data[0].country} <br>
                                    <span>Biography: </span> ${data[0].biography} <br>
                                </div></div>`
   
}