/*

A library for extracting the tiddlers from a TiddlyWiki5 file.

Reading encrypted TiddlyWiki5 files requires the SJCL library.

*/

(function main() {

/*jslint node: true, browser: true */
"use strict";

var sjcl = require("./sjcl/sjcl.js");

/*
Read the tiddlers from an unencrypted TiddlyWiki HTML file.
Returns null if the file is not an unencrypted TiddlyWiki HTML file
*/
exports.extractUnencryptedTiddlers = function(text) {
	// Check if we've got a store area
	var storeAreaMarkerRegExp = /<div id=["']?storeArea['"]?( style=["']?display:none;["']?)?>/gi,
		match = storeAreaMarkerRegExp.exec(text);
	if(!match) {
		return null;
	}
	var results = {},
		endOfDivRegExp = /(<\/div>\s*)/gi,
		startPos = storeAreaMarkerRegExp.lastIndex;
	endOfDivRegExp.lastIndex = startPos;
	var match = endOfDivRegExp.exec(text);
	while(match) {
		var endPos = endOfDivRegExp.lastIndex,
			tiddlerFields = parseTiddlerDiv(text.substring(startPos,endPos));
		if(!tiddlerFields) {
			break;
		}
		for(var name in tiddlerFields) {
			if(typeof tiddlerFields[name] === "string") {
				tiddlerFields[name] = htmlDecode(tiddlerFields[name]);
			}
		};
		if(tiddlerFields.title && tiddlerFields.text !== null) {
			results[tiddlerFields.title] = tiddlerFields;
		}
		startPos = endPos;
		match = endOfDivRegExp.exec(text);
	}
	return results;
}

/*
Parse a tiddler DIV. It looks like this:

<div title="Title" creator="JoeBloggs" modifier="JoeBloggs" created="201102111106" modified="201102111310" tags="myTag [[my long tag]]">
<pre>The text of the tiddler (without the expected HTML encoding).
</pre>
</div>
*/
function parseTiddlerDiv(text /* [,fields] */) {
	// Slot together the default results
	var result = {};
	if(arguments.length > 1) {
		for(var f=1; f<arguments.length; f++) {
			var fields = arguments[f];
			for(var t in fields) {
				result[t] = fields[t];		
			}
		}
	}
	// Parse the DIV body
	var startRegExp = /^\s*<div\s+([^>]*)>(\s*<pre>)?/gi,
		endRegExp,
		match = startRegExp.exec(text);
	if(match) {
		// Old-style DIVs don't have the <pre> tag
		if(match[2]) {
			endRegExp = /<\/pre>\s*<\/div>\s*$/gi;
		} else {
			endRegExp = /<\/div>\s*$/gi;
		}
		var endMatch = endRegExp.exec(text);
		if(endMatch) {
			// Extract the text
			result.text = text.substring(match.index + match[0].length,endMatch.index);
			// Process the attributes
			var attrRegExp = /\s*([^=\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
				attrMatch;
			do {
				attrMatch = attrRegExp.exec(match[1]);
				if(attrMatch) {
					var name = attrMatch[1];
					var value = attrMatch[2] !== undefined ? attrMatch[2] : attrMatch[3];
					result[name] = value;
				}
			} while(attrMatch);
			return result;
		}
	}
	return undefined;
}

/*
Look for an encrypted store area in the text of a TiddlyWiki file and attempt to extract the tiddlers using the specified password
*/
exports.extractEncryptedTiddlers = function(text,password) {
	var encryptedStoreAreaStartMarker = "<pre id=\"encryptedStoreArea\" type=\"text/plain\" style=\"display:none;\">",
		encryptedStoreAreaStart = text.indexOf(encryptedStoreAreaStartMarker);
	if(encryptedStoreAreaStart !== -1) {
		var encryptedStoreAreaEnd = text.indexOf("</pre>",encryptedStoreAreaStart);
		if(encryptedStoreAreaEnd !== -1) {
			var encryptedText = htmlDecode(text.substring(encryptedStoreAreaStart + encryptedStoreAreaStartMarker.length,encryptedStoreAreaEnd-1)),
				decryptedText = sjcl.decrypt(password,encryptedText);
			if(decryptedText) {
				return JSON.parse(decryptedText);
			}
		}
	}
	return null;
}

/*
Convert "&amp;" to &, "&nbsp;" to nbsp, "&lt;" to <, "&gt;" to > and "&quot;" to "
*/
function htmlDecode(s) {
	return s.toString().replace(/&lt;/mg,"<").replace(/&nbsp;/mg,"\xA0").replace(/&gt;/mg,">").replace(/&quot;/mg,"\"").replace(/&amp;/mg,"&");
}

})();
