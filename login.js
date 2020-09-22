function loginupdate() {
    
	fetch('https://attn-server.herokuapp.com/users/me')
		.then(response => response.json())
		.then(data => {
			//console.log(data);
			const spinner = document.querySelector('.spinner');
			spinner.hidden = true;
			if (data.username) {
				const e = document.querySelector('#subject');
				e.innerHTML = '';
				const loginView = document.querySelector('#loginPopup');
				loginView.hidden = true;
				const attendanceView = document.querySelector('#attendancePopup');
				attendanceView.hidden = false;
                
				let i = 2;
				const subjects = data.subjects;
				for (let subject of subjects) {
					//console.log('adding' + subject.name)
					const option = document.createElement('option');
					option.classList.add('item');
					option.setAttribute('value', 'item-' + i++);
					const node = document.createTextNode(subject.name);
					option.appendChild(node);
					const element = document.getElementById('subject');
					element.appendChild(option);
				}
			}
			else {
				const loginView = document.querySelector('#loginPopup');
				loginView.hidden = false;
				const attendanceView = document.querySelector('#attendancePopup');
				attendanceView.hidden = true;
			}
			return;
		})
		.catch(err => console.log(err));
}

document.querySelector('.login').addEventListener('keyup', () => {
	const form = document.querySelector('.login');
	const formdata = new FormData(form);
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
});

document.addEventListener('submit', async function (event) {

	event.preventDefault();
	const form = {};
	//console.log(event.target);
	const formData = new FormData(event.target);
	for (let key of formData.keys()) {
		form[key] = formData.get(key);
	}

	const httpHeaders = { 'Content-Type': 'application/json' };
	const url = 'https://attn-server.herokuapp.com/users/login';
	const myHeaders = new Headers(httpHeaders);
	const data = {
		username: form.user,
		password: form.pass
	};
	const err = document.querySelector('.error');
	const res = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		headers: myHeaders,
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	const resData = res;
	//console.log(resData.status);
	if(resData.status != 200) {
		err.hidden = false;
	} else {
		loginupdate();
		err.hidden =true;
		const loginView = document.querySelector('#loginPopup');
		loginView.hidden = true;
		const attendanceView = document.querySelector('#attendancePopup');
		attendanceView.hidden = false;
	}
});