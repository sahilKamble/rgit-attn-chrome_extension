function save(list) {

    var sub = document.querySelector('#subject')
    var subject = sub.options[sub.selectedIndex].text

    var div = document.querySelector('#subject');
    var division = div.options[div.selectedIndex].text

    // var subject = "Theory of Computer Science";
    var attendees = list;
    var attendees = attendees.map(name => name.toLowerCase());
    var dbStudents = [];
    var fuzzyAttendees = []; //array to store names correspoding to their names in database
    var subjectId = "";
    const url = "https://attn-server.herokuapp.com/";
    var url_subj = url + "subjects?name=" + subject;
    var attendance = [];                // stores array of json objects of student attendance
    var present = 0;

    // request to https://attn-server.herokuapp.com/subjects to get info of list of students,teacher name,etc
    let request1 = new XMLHttpRequest();
    request1.open("GET", url_subj);
    request1.send();
    request1.onload = () => {

        if (request1.status === 200) {
            var jsonObj1 = JSON.parse(request1.responseText);
            subjectId = jsonObj1[0]._id;
            var url_subjectStudents = url + "subjects/" + subjectId + "/students";

            // request to https://attn-server.herokuapp.com/subjects/<subjectID>/students  to get info of list of students,name ,etc
            let request2 = new XMLHttpRequest();
            request2.open("GET", url_subjectStudents);
            request2.send();
            request2.onload = () => {

                if (request2.status === 200) {
                    var jsonObj2 = JSON.parse(request2.responseText);
                    jsonObj2 = jsonObj2.students;

                    //add db names to fuzzyset
                    for (student of jsonObj2) {
                        // console.log(student.name);
                        dbStudents.push(student.name);
                    }
                    let fs = FuzzySet(dbStudents, false);

                    for (student of attendees) {
                        dude = fs.get(student, null, 0, 5);
                        if (dude != null) {
                            fuzzyAttendees.push(dude[0][1]);
                        }
                    }

                    // logic to check attendance and append json object of students attendace to attendance list
                    for (student of jsonObj2) {
                        if (fuzzyAttendees.indexOf(student.name.toLowerCase()) >= 0) {
                            let data = {
                                "present": true,
                                "student": student._id,
                                "subject": subjectId
                            }
                            attendance.push(data);
                            present++;
                        } else {
                            let data = {
                                "present": false,
                                "student": student._id,
                                "subject": subjectId
                            }
                            console.log(student.name);
                            attendance.push(data);
                        }
                    }

                    presentText = document.querySelector('.present');
                    presentText.innerText = present + ' Students are present.';

                    console.log(attendance);

                    // request to send attendance to https://attn-server.herokuapp.com/attn
                    var request3 = new XMLHttpRequest();
                    request3.open("POST", "https://attn-server.herokuapp.com/attn", true);
                    request3.setRequestHeader('Content-Type', 'application/json');
                    request3.send(JSON.stringify(attendance));
                    console.log('attendance sent')

                    saved = document.querySelector('.saved');
                    saved.classList.remove('hidden');

                    saveButton = document.querySelector('.btn');
                    saveButton.classList.add('hidden');

                } else {
                    console.log('error ${request2.status} ${request2.statusText}')
                }
            }
        } else {
            console.log('error ${request1.status} ${request1.statusText}')
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].url.includes('meet.google.com') && tabs[0].url.includes('-')) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getSubjects' }, response => {
                console.log(response);
                var subjects = response.subjects;
                var i = 2;
                for (subject of subjects) {
                    var option = document.createElement("option");
                    option.classList.add("item")
                    option.setAttribute("value", "item-" + i++)
                    var node = document.createTextNode(subject);
                    option.appendChild(node);
                    var element = document.getElementById("subject");
                    element.appendChild(option);
                }
            });
        }
    });
});

chrome.tabs.getSelected(null, tab => {
    if (tab.url.includes('meet.google.com') && tab.url.includes('-')) {
        document.querySelector('#notOnMeet').classList.add('hidden');
        document.querySelector('#mainPopup').classList.remove('hidden');
    }
});


chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //trigger Attendance reading code on click on button
    document.querySelector('.save-attendance').addEventListener('click', function () {
        let sub = document.querySelector('#subject');
        if (sub.selectedIndex != 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getAttendance' }, response => {
                console.log(response.list);
                save(response.list)
            });
        }
    });

    document.querySelector('.populate').addEventListener('click', function () {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getAttendance' }, response => {
            console.log(response.list);
        });
    });
});
