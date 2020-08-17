function loginupdate() {
    
    fetch('https://attn-server.herokuapp.com/users/me')
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            let spinner = document.querySelector('.spinner');
            spinner.hidden = true;
            if (data.username) {
                // console.log('logged in')
                let loginView = document.querySelector('#loginPopup');
                loginView.hidden = true;
                let attendanceView = document.querySelector('#attendancePopup');
                attendanceView.hidden = false;
                var e = document.querySelector("#subject");
                //e.firstElementChild can be used. 
                var child = e.lastElementChild;  
                while (child) { 
                    //console.log('here')
                    e.removeChild(child); 
                    child = e.lastElementChild;
                } 
                var i = 2;
                var subjects = data.subjects;
                for (subject of subjects) {
                    //console.log('adding' + subject.name)
                    var option = document.createElement("option");
                    option.classList.add("item");
                    option.setAttribute("value", "item-" + i++);
                    var node = document.createTextNode(subject.name);
                    option.appendChild(node);
                    var element = document.getElementById("subject");
                    element.appendChild(option);
                }
                //console.log('done adding')
                //console.log(element.childNodes)
            }
            else {
                let loginView = document.querySelector('#loginPopup');
                loginView.hidden = false;
                let attendanceView = document.querySelector('#attendancePopup');
                attendanceView.hidden = true;
            }

            user = data;
            return;
        })
        .catch(err => console.log(err));
}


document.querySelector('.login').addEventListener('keyup', () => {
    let form = document.querySelector('.login');
    let formdata = new FormData(form);
    let empty = false;
    for (let field of formdata.keys()) {
        if (!formdata.get(field).length) {
            empty = true;
        }
    }
    if (empty) {
        document.querySelector('.form-submit').disabled = true;
    } else {
        document.querySelector('.form-submit').disabled = false;
    }
})

document.addEventListener('submit', async function (event) {

    event.preventDefault();
    let form = {};
    //console.log(event.target);
    let formData = new FormData(event.target);
    for (let key of formData.keys()) {
        form[key] = formData.get(key);
    }

    let httpHeaders = { 'Content-Type': 'application/json' };
    let url = 'https://attn-server.herokuapp.com/users/login';
    let myHeaders = new Headers(httpHeaders);
    let data = {
        username: form.user,
        password: form.pass
    }
    var err = document.querySelector('.error');
    let res = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: myHeaders,
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    let resData = res;
    //console.log(resData.status);
    if(resData.status != 200) {
        err.hidden = false;
    } else {
        loginupdate()
        err.hidden =true;
        let loginView = document.querySelector('#loginPopup');
        loginView.hidden = true
        let attendanceView = document.querySelector('#attendancePopup');
        attendanceView.hidden = false
        // fetch('https://attn-server.herokuapp.com/users/protected').then(res => //console.log(res))
    }
});