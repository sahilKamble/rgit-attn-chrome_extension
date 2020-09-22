var list = [];
var subjects = [];
var done = false;
var subOver = false;
var userOver = false;
var user;

function getPeople() {
	for (let name of document.querySelectorAll('[data-sort-key]')) {
		if (!list.includes(name.getAttribute('data-sort-key').split(' spaces/')[0])) {
			list.push(name.getAttribute('data-sort-key').split(' spaces/')[0]);
		}
	}
	console.log(list);
}

function scrollList(element) {
	element.scrollTop = 0;

	function scroll() {
		element.scrollTop += 400;
		if (Math.ceil(element.scrollTop) < (element.scrollHeight - element.clientHeight)) {
			setTimeout(function () {
				getPeople();
				scroll();
			}, 200);
		}
		else done = true;
	}

	if (element.scrollHeight > element.clientHeight) {
		setTimeout(function () {
			scroll();
		}, 200);
	} else {
		getPeople();
		done = true;
	}
}

function collectinfo(callback) {
	// idk found this on stack overflow, checks if an element is visible on the screen
	function isHidden(el) {
		return el.offsetParent === null;
	}

	// check if people's list is already open
	if (document.querySelector('[aria-label*="participants."]') == null) {
		let plist = document.querySelector('[data-tooltip="Show everyone"]');
		// open list if its not open.
		plist.click();
	}
	// keep checking if the list is visible yet(i dont think this works)
	const checkExist = setInterval(function () {
		if (!isHidden(document.querySelector('[role="tabpanel"]'))) {
			console.log('Visible!');
			clearInterval(checkExist);
			new Promise((r) => setTimeout(r, 1000))
				.then(() => {
					callback();
				});
		}
	}, 100);
}

//add a listener to start attendance reading code when we get a message
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'getAttendance') {
		done = false;
		collectinfo(function () {
			// get the element to perform autoscroll in
			var list = document.querySelector('[role="tabpanel"]');
			//scroll list of people
			scrollList(list);
		});
		var Id = setInterval(() => {
			if (done) {
				clearInterval(Id);
				sendResponse({ list });
			}
		}, 1000);
		return true;
	}
	if (request.action === 'getSubjects') {
		sendResponse({ subjects });
		return true;
	}
	if (request.action === 'getUser') {
		sendResponse(user);
		return true;
	}
});
