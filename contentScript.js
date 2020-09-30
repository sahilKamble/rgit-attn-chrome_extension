var list = [];
var subjects = [];
var done = false;
// var auto = false;
// var subOver = false;
// var userOver = false;
var user;
var scrollTimeout;
var scrollStart;
var autoInterval;

function getPeople() {
	let names = document.querySelectorAll('[data-sort-key]');
	for (let name of names) {
		if (!list.includes(name.getAttribute('data-sort-key').split(' spaces/')[0])) {
			list.push(name.getAttribute('data-sort-key').split(' spaces/')[0]);
		} 
	}
	console.log(list);
}

function autoPopulate () {
	if (!autoInterval){
		autoInterval =  setInterval(() => {
			chrome.storage.local.get(['auto'], function(result) {
				console.log('Value is currently ' + result.auto);
				if (result.auto) {
					collectinfo(function () {
					// get the element to perform autoscroll in
						let panel = document.querySelector('[role="tabpanel"]');
						//scroll list of people
						scrollList(panel);
					});
				}
			});
		}, 10000);
	}
}
autoPopulate();
	
function scrollList(element) {
	clearTimeout(scrollStart);
	clearTimeout(scrollTimeout);
	element.scrollTop = 0;

	function scroll() {
		element.scrollTop += 200;
		if (Math.ceil(element.scrollTop) < (element.scrollHeight - element.clientHeight)) {
			scrollTimeout = setTimeout(function () {
				getPeople();
				scroll();
			}, 200);
		} else {
			done = true;
		}
	}

	if (element.scrollHeight > element.clientHeight) {
		scrollStart = setTimeout(function () {
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
		if(el) {
			return el.offsetParent === null;
		} else {
			return true;
		}
	}

	let panel = document.querySelector('[data-tooltip="Show everyone"]');
	// open list if its not open.
	panel.click();

	// keep checking if the list is visible yet(i dont think this works)
	const checkExist = setInterval(function () {
		if (!isHidden(document.querySelector('[role="tabpanel"]'))) {
			console.log('Visible!');
			clearInterval(checkExist);
			callback();
			// new Promise((r) => setTimeout(r, 1000))
			// 	.then(() => {
			// 		callback();
			// 	});
		}
	}, 100);
}

//add a listener to start attendance reading code when we get a message
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'getAttendance') {
		done = false;
		collectinfo(function () {
			// get the element to perform autoscroll in
			let panel = document.querySelector('[role="tabpanel"]');
			//scroll list of people
			scrollList(panel);
		});
		let Id = setInterval(() => {
			if (done && list.length != 0) {
				clearInterval(Id);
				sendResponse({ list });
			} else if (done && list.length == 0) {
				done = false;
				console.log('lmao F');
				let panel = document.querySelector('[role="tabpanel"]');
				clearTimeout(scrollStart);
				clearTimeout(scrollTimeout);
				scrollList(panel);
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
	if (request.action === 'autoEnable') {
		if (!autoInterval) {
			autoPopulate();
		}
		sendResponse(true);
		return true;
	}
	if (request.action === 'autoDisable') {
		autoInterval = clearInterval(autoInterval);
		sendResponse(false);
		return true;
	}

});
