chrome.tabs.getSelected(null, tab => {
    if (tab.url.includes('meet.google.com')) {
        document.querySelector('#notOnMeet').classList.add('hidden');
        document.querySelector('#mainPopup').classList.remove('hidden');
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //trigger Attendance reading code on click on button
    document.querySelector('.save-attendance').addEventListener('click', function () {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getAttendance' }, response => {
            console.log(response);
        });
    });
});