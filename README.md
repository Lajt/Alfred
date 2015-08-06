# Alfred
Alfred is an easy-to-use Framwork written in Node.js.
It's as easy to create a bot with a few commands as shown in the example below.

# Install
Alfred can be easily installed using the Node Packet Manager:

`npm install alfred-teamspeak`

# Example
```javascript
	var botfile = require('alfred-teamspeak');
	var bot = new botfile.Alfred();

	// Default settings are: login-name = serveradmin; login-pass = password;
	bot.configure({
		'login-pass': 'your_password_here'
		'command-identifer': '!' // Determines what will trigger the bot to check through the commands
	});

	// The first parameter 'test' in this case specifies the command (careful)
	// The second paramter is the callback Function, it is given the Client-ID of the User, the other User-specific data and parameters that the user entered
	// Parameters are parsed like this: .hello "Alfred how are" you "today ?"
	// results in this array: ["Alfred how are", "you", "today ?"]
	// The third parameter (false in this case) specifies the admin Level required
	// The level reaches from 0-2
	// The last two arguments are the usage-guide of the command and a description
	bot.addCmd('test', function(invokerid, data, params) {
		bot.sendMessage('Sir, how may I be of help?', invokerid);
	}, false, '!test', 'This is a testcommand');

	bot.start(); // This will start the bot

```
