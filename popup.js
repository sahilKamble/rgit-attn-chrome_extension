document.addEventListener('DOMContentLoaded', function () {
	fetch('https://attn-server.herokuapp.com/users/me')
		.then(response => response.json())
		.then(data => {
			//console.log(data);
			const spinner = document.querySelector('.spinner');
			spinner.hidden = true;
			if (data.username) {
				const loginView = document.querySelector('#loginPopup');
				loginView.hidden = true;
				const attendanceView = document.querySelector('#attendancePopup');
				attendanceView.hidden = false;
				let i = 2;
				const subjects = data.subjects;
				for (let subject of subjects) {
					const option = document.createElement('option');
					option.classList.add('item');
					option.setAttribute('value', `item-${i++}`);
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
});

function save(list) {
	const sub = document.querySelector('#subject');
	const subject = sub.options[sub.selectedIndex].text;

	// var div = document.querySelector('#subject');
	// var division = div.options[div.selectedIndex].text

	let attendees = list;
	attendees = attendees.map(name => name.toLowerCase());
	let dbStudents = [];
	let fuzzyAttendees = []; //array to store names correspoding to their names in database
	let subjectId = '';
	const url = 'https://attn-server.herokuapp.com/';
	const url_subj = url + 'subjects?name=' + subject;
	let absList = [];
	let present = 0;

	// request to https://attn-server.herokuapp.com/subjects to get info of list of students,teacher name,etc
	let request1 = new XMLHttpRequest();
	request1.open('GET', url_subj);
	request1.send();
	request1.onload = () => {

		if (request1.status === 200) {
			const jsonObj1 = JSON.parse(request1.responseText);
			subjectId = jsonObj1[0]._id;
			const url_subjectStudents = url + 'subjects/' + subjectId + '/students';

			// request to https://attn-server.herokuapp.com/subjects/<subjectID>/students  to get info of list of students,name ,etc
			const request2 = new XMLHttpRequest();
			request2.open('GET', url_subjectStudents);
			request2.send();
			request2.onload = () => {

				if (request2.status === 200) {
					//get students list from db
					var jsonObj2 = JSON.parse(request2.responseText);
					jsonObj2 = jsonObj2.students;

					//add db names to fuzzyset
					for (let student of jsonObj2) {
						// console.log(student.name);
						dbStudents.push(student.name);
					}
					let fs = FuzzySet(dbStudents, false);

					//create new array of present people with name same as their same in db
					for (let student of attendees) {
						let dude = fs.get(student, null, 0.65);
						if (dude != null) {
							fuzzyAttendees.push(dude[0][1]);
						}
					}

					// logic to check attendance and append json object of students attendace to attendance list
					for (let student of jsonObj2) {
						if (fuzzyAttendees.indexOf(student.name.toLowerCase()) >= 0) {
							present += 1;
						} else {
							console.log(student.name);
							absList.push(student._id);
						}
					}

					const spinner = document.querySelector('.spinner-attn');
					spinner.hidden = true;
					const presentText = document.querySelector('.present');
					presentText.innerText = `${present} Students are present.`;
					const afterSave = document.querySelector('.after-save');
					afterSave.hidden = false;

					const attendance = {
						'absentStudents': absList,
						'subject': subjectId
					};
					//console.log(attendance);

					// request to send attendance to https://attn-server.herokuapp.com/attn
					const request3 = new XMLHttpRequest();
					request3.open('POST', 'https://attn-server.herokuapp.com/abs', true);
					request3.setRequestHeader('Content-Type', 'application/json');
					request3.send(JSON.stringify(attendance));
					//console.log('attendance sent');

					const saved = document.querySelector('.saved');
					saved.hidden = false;

				} else {
					console.log('error ${request2.status} ${request2.statusText}');
				}
			};
		} else {
			console.log('error ${request1.status} ${request1.statusText}');
		}
	};
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	//trigger Attendance reading code on click on button
	document.querySelector('.save-attendance').addEventListener('click', function () {
		const saveButton = document.querySelectorAll('button.btn-primary');

		for (let button of saveButton) {
			button.hidden = true;
		}

		const spinner = document.querySelector('.spinner-attn');
		spinner.hidden = false;

		chrome.tabs.sendMessage(tabs[0].id, { action: 'getAttendance' }, response => {
			if (response) {
				//console.log(response.list);
				//console.log('success');
				save(response.list);
			}
		});
	});

	document.querySelector('.populate').addEventListener('click', function () {
		const saveButton = document.querySelectorAll('button.btn-primary');

		for (let button of saveButton) {
			button.disabled = true;
		}

		chrome.tabs.sendMessage(tabs[0].id, { action: 'getAttendance' }, response => {
			if (response) {
				//console.log(response.list);
			}
            
			for (let button of saveButton) {
				button.disabled = false;
			}
		});
	});

	document.querySelector('.logout').addEventListener('click', function () {
		fetch('https://attn-server.herokuapp.com/users/logout')
			.then(response => response.json())
			.then(() => {
				const e = document.querySelector('#subject');
				e.innerHTML = '';
				const loginView = document.querySelector('#loginPopup');
				loginView.hidden = false;
				const attendanceView = document.querySelector('#attendancePopup');
				attendanceView.hidden = true;
				return;
			});
	});
});
