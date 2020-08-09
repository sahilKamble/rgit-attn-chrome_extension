var X = require('xmlhttprequest').XMLHttpRequest;
let request1 = new X();
request1.open("GET", "https://attn-server.herokuapp.com/subjects");
request1.send();
request1.onload = () => {

    if (request1.status === 200) {
        var jsonObj = JSON.parse(request1.responseText);
        // console.log(jsonObj1);
        var i = 1;
        for(subject of jsonObj) {
            console.log('item-' + i++)
            console.log(subject.name)
        }
    }
}