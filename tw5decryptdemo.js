/*

A sample node.js application that shows how to extract the tiddlers from an
encrypted TiddlyWiki5 file

*/

(function main() {

/*jslint node: true, browser: true */
"use strict";

/***************************************************************************
** Main
***************************************************************************/

var fs = require("fs"),
	path = require("path"),
	sjcl = require("./sjcl/sjcl.js");

// Parse command line parameters

var filename = process.argv[2],
	password = process.argv[3];
if(!filename || !password) {
	throw "Missing required parameters: filename password";
}

// Read the file
var text = fs.readFileSync(filename,"utf8");

// Extract the encrypted store area
var encryptedStoreArea = extractEncryptedStoreArea(text);
if(!encryptedStoreArea) {
	throw "'" + filename + "' is not an encrypted TiddlyWiki file";
}
// Attempt to decrypt it using the specified password
var tiddlers = decryptStoreArea(encryptedStoreArea,password);
if(!tiddlers) {
	throw "Password incorrect for '" + filename + "'";
}

// Exclude the core plugin
if(tiddlers["$:/core"]) {
	delete tiddlers["$:/core"]
}

// Output the titles of the tiddlers
for(var title in tiddlers) {
	console.log(title);
};

/***************************************************************************
** Utility functions
***************************************************************************/

/*
Look for an encrypted store area in the text of a TiddlyWiki file
*/
function extractEncryptedStoreArea(text) {
	var encryptedStoreAreaStartMarker = "<pre id=\"encryptedStoreArea\" type=\"text/plain\" style=\"display:none;\">",
		encryptedStoreAreaStart = text.indexOf(encryptedStoreAreaStartMarker);
	if(encryptedStoreAreaStart !== -1) {
		var encryptedStoreAreaEnd = text.indexOf("</pre>",encryptedStoreAreaStart);
		if(encryptedStoreAreaEnd !== -1) {
			return htmlDecode(text.substring(encryptedStoreAreaStart + encryptedStoreAreaStartMarker.length,encryptedStoreAreaEnd-1));
		}
	}
	return null;
}

/*
Attempt to extract the tiddlers from an encrypted store area using the specified password
*/
function decryptStoreArea(encryptedStoreArea,password) {
	var decryptedText = sjcl.decrypt(password,encryptedStoreArea);
	if(decryptedText) {
		return JSON.parse(decryptedText);
	} else {
		return null;
	}
}

/*
Convert "&amp;" to &, "&nbsp;" to nbsp, "&lt;" to <, "&gt;" to > and "&quot;" to "
*/
function htmlDecode(s) {
	return s.toString().replace(/&lt;/mg,"<").replace(/&nbsp;/mg,"\xA0").replace(/&gt;/mg,">").replace(/&quot;/mg,"\"").replace(/&amp;/mg,"&");
}

})();
