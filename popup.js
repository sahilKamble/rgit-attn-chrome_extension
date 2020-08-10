function save(list) {

    var sub = document.querySelector('#subject')
    var subject = sub.options[sub.selectedIndex].text

    var div = document.querySelector('#subject');
    var division = div.options[div.selectedIndex].text

    // var subject = "Theory of Computer Science";
    var attendees = list;
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
            // console.log(jsonObj1);
            subjectId = jsonObj1[0]._id;
            // console.log(subjectId);
            var url_subjectStudents = url + "subjects/" + subjectId + "/students";
            // console.log(url_subjectStudents);

            // request to https://attn-server.herokuapp.com/subjects/<subjectID>/students  to get info of list of students,name ,etc
            let request2 = new XMLHttpRequest();
            request2.open("GET", url_subjectStudents);
            request2.send();
            request2.onload = () => {

                if (request2.status === 200) {
                    var jsonObj2 = JSON.parse(request2.responseText);
                    // console.log(jsonObj2);
                    jsonObj2 = jsonObj2.students;
                    var countKey = jsonObj2.length;
                    // console.log(countKey);

                    // logic to check attendance and append json object of students attendace to attendance list
                    for (j = 0; j < countKey; j++) {
                        k = j;
                        var count = attendees.length;
                        for (i = 0; i < attendees.length; i++) {
                            if (jsonObj2[j].name == attendees[i]) {
                                // console.log(jsonObj2[j].name+'  is  PRESENT');
                                var data = {
                                    "present": true,
                                    "student": jsonObj2[j]._id,
                                    "subject": subjectId
                                }
                                attendance.push(data);
                                present++;
                                count--;
                            }
                            count--;
                        };
                        if (count == 0) {
                            // console.log(jsonObj2[k].name+'  is   ABSENT');
                            var data = {
                                "present": false,
                                "student": jsonObj2[j]._id,
                                "subject": subjectId
                            }
                            attendance.push(data);
                        }
                    };

                    presentText = document.querySelector('.present');
                    presentText.innerText = present + ' Students are present.';

                    console.log(attendance);

                    // request to send attendance to https://attn-server.herokuapp.com/attn
                    var request3 = new XMLHttpRequest();
                    request3.open("POST", "https://attn-server.herokuapp.com/attn", true);
                    request3.setRequestHeader('Content-Type', 'application/json');
                    request3.send(JSON.stringify(attendance));

                    saved = document.querySelector('.saved');
                    saved.classList.remove('hidden');
                    saveButton = document.querySelector('.save-attendance');
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
    });
});

chrome.tabs.getSelected(null, tab => {
    if (tab.url.includes('meet.google.com')) {
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
});
