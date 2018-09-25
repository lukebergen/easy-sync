# Easy Sync

Just a little utility api for creating and reading one-time messages behind arbitrary keys.

## Usage

POST /:key
Takes the body of the POST and stores it at the key

GET /:key
Looks for a message at the key and if found, deletes it from storage and responds with it.

GET /
A really simple little html page to demonstrate usage and test/debug.

## Example

So say for instance you build an client-only app and use local storage your users data. However, you want to make it possible for a user to copy their data to a new device. Generate a random code, post the users data to /:code and instruct them to enter the code on their new device. On the new device GET /:code and download their data.
