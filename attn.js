//var subject ="MP";
//var attendees = ['sebin francis','paras','kapse'];

var subject = "";               // get subject name from contentScript
var attendees = [];             // get list of attendees from contentScript
var div = "";                   // get division name from contentScript
var subjectId ="" ;
const url  = "https://attn-server.herokuapp.com/";
var url_subj = url+"subjects?name="+subject;
var attendance = [];                // stores array of json objects of student attendance
var X = require('xmlhttprequest').XMLHttpRequest;
var k = 0;

// request to https://attn-server.herokuapp.com/subjects to get info of list of students,teacher name,etc
let request1 = new X();
request1.open("GET", url_subj);
request1.send();
request1.onload = () => {
    
    if(request1.status === 200){
      var jsonObj1 = JSON.parse(request1.responseText);
      console.log(jsonObj1);
      subjectId = jsonObj1[0]._id;
      console.log(subjectId);
      var url_subjectStudents = url+"subjects/"+subjectId+"/students";
      // console.log(url_subjectStudents);
      
      // request to https://attn-server.herokuapp.com/subjects/<subjectID>/students  to get info of list of students,name ,etc
      let request2 = new X();
      request2.open("GET", url_subjectStudents);
      request2.send();
      request2.onload = () => {
    
      if(request2.status === 200){
          var jsonObj2 = JSON.parse(request2.responseText);
         // console.log(jsonObj2);

          var countKey = Object.keys(jsonObj2).length;
         // console.log(countKey);
          
          // logic to check attendance and append json object of students attendace to attendance list
          for( j = 0 ; j < countKey; j++ ){
            k = j;  
            var count = attendees.length;
            for( i = 0; i < attendees.length ; i++){
              if(jsonObj2[j].name ==attendees[i] ){
                 // console.log(jsonObj2[j].name+'  is  PRESENT');
                  var data = {
                    "present": true,
                    "student":jsonObj2[j]._id,
                    "subject":subjectId
                  }
                  attendance.push(data);
              }
               
            count--;
            
            };


            }
             if(count === 0){
               // console.log(jsonObj2[k].name+'  is   ABSENT');
                var data ={
                  "present":false,
                  "student":jsonObj2[k]._id,
                  "subject":subjectId

                }
                attendance.push(data);   
          };

          //console.log(attendance);

          // request to send attendance to https://attn-server.herokuapp.com/attn
          var request3  = new X();
          request3.open("POST", "https://attn-server.herokuapp.com/attn" , true);
          request3.setRequestHeader('Content-Type', 'application/json');
          request3.send(JSON.stringify(attendance));  

        }else {
             console.log('error ${request2.status} ${request2.statusText}')
            }
        }
      }else {
        console.log('error ${request1.status} ${request1.statusText}')
      } 
}

 
