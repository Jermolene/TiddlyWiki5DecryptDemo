# TiddlyWiki5 Decrypt Demo

A sample Node.js app that demonstrates how to decrypt an encrypted TiddlyWiki file.

## Library API

The API is implemented in the file `tw5decrypt.js`. It exports the following methods:

### `extractUnencryptedTiddlers(text)`

Attempts to locate a TiddlyWiki5 unencrypted store area within the provided text. Returns `null` if no tiddlers found, or a hashmap by title of the tiddlers.

### `extractEncryptedTiddlers(text,password)`

Attempts to locate a TiddlyWiki5 encrypted store area within the provided text and tries to decrypt it with the specified password. Returns `null` if no tiddlers found, or a hashmap by title of the tiddlers.

## Running the app

Two sample files are provided in the `samplefiles` directory to aid testing:

* `encrypted.html`: An encrypted TiddlyWiki file. It is encrypted with the password "password"
* `index.html`: An unencrypted TiddlyWiki file

Execute the following commands to run the app:

	node demo.js samplefiles/encrypted.html password
	node demo.js samplefiles/index.html password

The application should display the titles of the tiddlers extracted from the file.
