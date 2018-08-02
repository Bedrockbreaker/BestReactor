// ==UserScript==
// @name         BestReactor
// @namespace    https://github.com/Bedrockbreaker/BestReactor
// @version      0.2
// @description  Tries to find the "best" big reactor with a given size
// @author       Bedrockbreaker
// @match        http*://br.sidoh.org/*
// @grant        none
// @run-at		 document-idle
// @require		 https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

// Note: This program assumes that the "best" reactor is 4-fold rotationally symmetric. This helps to drastically* reduce the number of computations, but may mean that the "best" reactor actually isn't the best.
// * 2^(length*width) vs 2^(Math.ceil(length/2)*Math.ceil(width/2)) max runs to get the best reactor.

(function($) {
	//Gets the current rf/t through the html. Use getRF.then(function(rf) {do_stuff_here}); to actually retreive the rf.
	let getRF = async function() {
		return await new Promise(function(resolve, reject) {
			let reCheck = setInterval(function() {
				if (typeof document.getElementById("passiveCoolingOutput") !== "undefined") {
					let reactorRF = Number(document.getElementById("passiveCoolingOutput").getElementsByClassName("value")[0].innerHTML.split(",").join("")); //Extract the RF from the HTML.
					if (!(Number.isNaN(reactorRF)) && typeof(reactorRF) === "number") {
						clearInterval(reCheck);
						resolve(reactorRF);
					}
				}
			}, 100);
		})
	}

	//Main code body. Is inside of a function so that it isn't ran until an rf/t has been found.
	let bot = function(currentRF) {
		//Save the best rf producing reactor to cookies.
		if ((!localStorage.getItem("highestRF")) || localStorage.getItem("highestRF") === "0") {
			localStorage.setItem("highestRF", currentRF);
			console.log("NOTE! Press \"Simulate\" in order to clear the current best reactor.");
		} else if (localStorage.getItem("highestRF") < currentRF) {
			localStorage.setItem("highestRF", currentRF);
			console.log("New best reactor: " + window.location.href + " with " + currentRF + " rf/t.");
		}

		let reactorLength = Number(splitURL("length=")); //Z-axis
		let reactorWidth = Number(splitURL("width=")); //X-axis
		//Retrieve the string of text after "layout=", send that through the decoder, send that through the encoder, and put that back into the URL.
		let newHREF = insertIntoString(encode(decode(splitURL("layout="), reactorLength, reactorWidth), reactorLength, reactorWidth), "layout=", window.location.href);
		window.location.assign(newHREF);
		location.reload();
	}

	//Modified directly from br.sidoh.org/assets/scripts/reactor_simulator.js
	let decode = function(encoded, length, width) {
		// Extract tokens from encoded string. E.g., 32E, 12X, F
		let split = encoded.match(/(\d*.)/g);
		// From each token, append to the output.
		let decodedString = ($.map(split, function(token) {let tokenParts = token.match(/(\d*)(.)/); return new Array(1 + (tokenParts[1] == "" ? 1 : parseInt(tokenParts[1]))).join(tokenParts[2])}).join("")).toString().replace(/C/g, "0").replace(/X/g, "1");
		//Take the decoded reactor, and split the axes in half, rounded up. Essentially takes the upper left corner.
		let reactorMap = new Array(Math.ceil(length / 2));
		for (let i = 0; i < reactorMap.length; i++) {
			reactorMap[i] = new Array(Math.ceil(width / 2));
			for (let j = 0; j < (Math.ceil(width / 2)); j++) {
				reactorMap[i][j] = decodedString[i * width + j];
			}
		}
		//Push the reactor to the next iteration, before mirroring it to the corners.
		let reactorString = ((parseInt(reactorMap.map(function(row) {return row.reverse().join("")}).reverse().join(""), 2) + 1) >>> 0).toString(2).split("");
		//Pad with extra 0's
		for (let i = 0; i < (Math.ceil(length / 2) * Math.ceil(width / 2)); i++) {
			if (!reactorString[i]) {
				reactorString.unshift("0");
			}
		}
		reactorString = reactorString.reverse();
		//Mirror the upper left corner onto the other corners
		for (let i = 0; i < Math.ceil(length / 2); i++) {
			reactorMap[i] = new Array(width);
			for (let j = 0; j < Math.ceil(width / 2); j++) {
				reactorMap[i][j] = reactorString[i * Math.ceil(width / 2) + j];
				reactorMap[i][width - 1 - j] = reactorString[i * Math.ceil(width / 2) + j]; //Mirror width
			}
			reactorMap[length - 1 - i] = reactorMap[i]; //Mirror length
		}
		return reactorMap.map(function (row) {return row.join("")}).join("");
	}
	//Modified Directly from br.sidoh.org/assets/scripts/reactor_simulator.js
	let encode = function(decoded, length, width) {
		//Replace all occurences of 1 and 0's with X and C, respectively.
		decoded = decoded.replace(/0/g, "C").replace(/1/g, "X");
		return $.map(decoded.match(/(.)\1*/g), function(substr) {
			let n = '';
			if (substr.length > 1) {
				n += substr.length;
			}
			n += substr[0];
			return n;
		}).join("");
	}

	//Takes a string, and returns a length of characters until an "&" appears.
	let splitURL = function(stringToExtract) {
		let extracted = window.location.href.slice(window.location.href.indexOf(stringToExtract) + stringToExtract.length);
		if (extracted.indexOf("&") !== -1) {
			extracted = extracted.substring(0, extracted.indexOf("&"));
		}
		return extracted;
	}
	//Takes an insertion string, a "matching" (insertionPoint) string, and the original string, and gives back the orignal string, with the the insertion string where the "matching" string matches in the original string.
	//ex: insertIntoString(Math.MIN_SAFE_INTEGER, "numOfCaresIgive=", "apples=25&bananaanananaas=42FEET&numOfCaresIGive=0") returns "apples=25&bananaanananaas=42FEET&numOfCaresIGive=-9007199254740992"
	let insertIntoString = function(insertionString, insertionPoint, originalString) {
		let extracted = originalString.slice(originalString.indexOf(insertionPoint) + insertionPoint.length);
		if (extracted.indexOf("&") !== -1) {
			extracted = extracted.substring(0, extracted.indexOf("&"));
		}
		let reg = new RegExp(extracted, "g");
		return originalString.replace(reg, insertionString);
	}

	//Clear cookies (at least I think it's cookies), and restart the script.
	$("#simulate").click(function() {getRF().then(function(rf) {localStorage.removeItem("highestRF"); bot(rf)})});

	getRF().then(function(rf) {
		bot(rf);
		setInterval(function() {
			if (document.getElementById("error-area").innerHTML === "Too many requests. Please slow down.") {
				console.log("re-refreshing page!");
				location.reload();
			}
		}, 1000)});
})(jQuery);