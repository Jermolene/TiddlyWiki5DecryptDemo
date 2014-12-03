# TiddlyWiki5 Decrypt Demo

A sample Node.js app that demonstrates how to decrypt an encrypted TiddlyWiki file.

## Running the app

An example encrypted TiddlyWiki file is provided in the `samplefiles` directory. It is encrypted with the password "password".

Execute the following command to run the app:

	node tw5decryptdemo.js samplefiles/encrypted.html password

The application should display the titles of the tiddlers extracted from the file.
