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

var tw5decrypt = require("./tw5decrypt.js"),
	fs = require("fs");

// Parse command line parameters

var filename = process.argv[2],
	password = process.argv[3];
if(!filename || !password) {
	throw "Missing required parameters: filename password";
}

// Read the file
var text = fs.readFileSync(filename,"utf8");

// Extract the encrypted store area
var tiddlers = tw5decrypt.extractEncryptedTiddlers(text,password);
if(!tiddlers) {
	tiddlers = tw5decrypt.extractUnencryptedTiddlers(text);
	if(!tiddlers) {
		throw "'" + filename + "' is not a TiddlyWiki file";
	}
}

// Output the titles of the tiddlers
for(var title in tiddlers) {
	console.log(title);
};

})();
