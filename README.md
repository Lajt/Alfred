# Alfred
Alfred is an easy-to-use Framwork written in Node.js.
It's as easy to create a bot with a few commands as shown in the example below.
[Alfred on npmjs.com](https://www.npmjs.com/package/alfred-teamspeak)

## Install
Alfred can be easily installed using the Node Packet Manager:

`npm install alfred-teamspeak`

## Example
```javascript
var botfile = require('alfred-teamspeak');
var bot = new botfile.Alfred();

// Default settings are: login-name = serveradmin; login-pass = password;
bot.configure({
	'login-pass': 'your_password_here'
});

// When the authentication-process was successful, this event will be called
bot.on('login', function() {
	bot.say('Hello everyone, have you already missed me?'); // Alfred sends a server-wide message
});

// The first parameter 'test' in this case specifies the command
// The second paramter is the callback Function, it is given the Client-ID of the User, the other User-specific data and parameters that the user entered
// Parameters are parsed like this: .hello "Alfred how are" you "today ?"
// results in this array: ["Alfred how are", "you", "today ?"]
// The third parameter (false in this case) specifies the admin Level required
// The level reaches from 0-2
// The last two arguments are the usage-guide of the command and a description
bot.addCmd('test', function(invokerid, data, params) {
	bot.sendMessage('Sir, how may I be of help?', invokerid);
}, false, '.test', 'This is a testcommand');

bot.start(); // This will start the bot
```

## Events
- `login` - This event will be called when the bot successfully logged into the server
- `error` - This event will be called when an error occurs
- `sock_error` - This event will be called when an error with the socket occurs
- `--event--` - This event will be called when the bot gets notified about something. List of possible events: [textmessage, cliententerview, clientleftview]

## Config-Properties
- `name` - Name of the bot which by default is 'Alfred'
- `host` - IP-Address to connect to // Default: '127.0.0.1'
- `port` - Port of the ServerQuery // Default: 10011
- `login-name` - Specifies the name used to log into the server // Default: 'serveradmin'
- `login-pass` - Specifies the password used to log into the server
- `virtual-server` - Virtual-Server-ID // Default: 1
- `command-identifier` - Determines how a command is specified // Default: '.'
