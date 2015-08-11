"use strict";
var User = require('../user/user.js').User;
var UserFind = require('../user/user.js').UserFind;

var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;

var stdin = process.openStdin();
var commands = {};
var globalCommands = {};
var channelCommands = {};
var consoleCommands = {};

function parseCmd(cmd) {
	var args = cmd.split(' ');
	var indexStart = null, indexEnd = null;

	for(var i=0; i<args.length; i++) {
		if(args[i][0] == '"' && indexStart == null) indexStart = i;
		if(args[i][args[i].length - 1] == '"' && indexStart != null) indexEnd = i;

		if(indexStart != null && indexEnd != null) {
			var argSplit = [];
			for(var x=indexStart; x<=indexEnd; x++) {
				if(x == indexStart) args[x] = args[x].substring(1, args[x].length);
				if(x == indexEnd) args[x] = args[x].substring(0, args[x].length - 1);
				argSplit.push(args[x]);
			}
			for(var x=indexStart + 1; x<indexEnd + 1; x++) {
				args.splice(indexStart + 1, 1);
			}
			args[indexStart] = argSplit.join(' ');
			i = i - indexEnd + 1;
			indexStart = null;
			indexEnd = null;
		}
	}

	return args;
}

bot_proto.prototype.User = User;
bot_proto.prototype.UserFind = UserFind;

bot_proto.prototype.addCmd = function(cmd, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(commands.hasOwnProperty(cmd)) return bot.throwErr(2, "Command already exists: " + cmd);
	commands[cmd] = {};
	commands[cmd]["callback"] = callbackFunction;
	commands[cmd]["adminLevel"] = adminLevel;
	commands[cmd]["usage"] = bot.config["command-identifier"] + usage;
	commands[cmd]["desc"] = description;
}

bot_proto.prototype.addGlobalCmd = function(cmd, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(globalCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "GlobalCommand already exists: " + cmd);
	globalCommands[cmd] = {};
	globalCommands[cmd]["callback"] = callbackFunction;
	globalCommands[cmd]["adminLevel"] = adminLevel;
	globalCommands[cmd]["usage"] = bot.config["command-identifier"] + usage;
	globalCommands[cmd]["desc"] = description;
}

bot_proto.prototype.addChannelCmd = function(cmd, cid, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(channelCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "ChannelCommand already exists: " + cmd);
	channelCommands[cmd] = {};
	channelCommands[cmd]["callback"] = callbackFunction;
	channelCommands[cmd]["adminLevel"] = adminLevel;
	channelCommands[cmd]["usage"] = bot.config["command-identifier"] + usage;
	channelCommands[cmd]["desc"] = description;
	channelCommands[cmd]["cid"] = cid;
}

bot_proto.prototype.addConsoleCmd = function(cmd, callbackFunction, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(consoleCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "ConsoleCommand already exists: " + cmd);
	consoleCommands[cmd] = {};
	consoleCommands[cmd]["callback"] = callbackFunction;
	consoleCommands[cmd]["usage"] = bot.config["command-identifier"] + usage;
	consoleCommands[cmd]["desc"] = description;
}

bot.on('textmessage', function(data) {
	if(data["invokerid"] == bot.self || data["invokerid"] < 1) return;
	var params = parseCmd(data["msg"]);
	var paramCommand = params[0];
	params.splice(0, 1);
	var invokerdata = data;
	var targetmode = data["targetmode"];

	bot.clientinfo(parseInt(invokerdata["invokerid"]), function(err, clientinfo) {
		for(var prop in clientinfo) {
			if(invokerdata.hasOwnProperty(prop)) continue;
			invokerdata[prop] = clientinfo[prop];
		}
		var Invoker = new User(invokerdata, params);

		for(var command in commands) {
			if(paramCommand == bot.config["command-identifier"] + command && targetmode == 1 && Invoker.isAdmin(commands[command]["adminLevel"])) {
				commands[command]["callback"](Invoker);
				return;
			}
		}

		for(var command in globalCommands) {
			if(paramCommand == bot.config["command-identifier"] + command && targetmode == 3 && Invoker.isAdmin(globalCommands[command]["adminLevel"])) {
				globalCommands[command]["callback"](Invoker);
				return;
			}
		}

		for(var command in channelCommands) {
			if(paramCommand == bot.config["command-identifier"] + command && targetmode == 2 && invokerdata["cid"] == channelCommands[command]["cid"] && Invoker.isAdmin(channelCommands[command]["adminLevel"])) {
					channelCommands[command]["callback"](Invoker);
					return;
			}
		}

		bot.emit('unknownCommand', paramCommand, Invoker);
	});
});

stdin.addListener('data', function(input) {
	input = input.toString().trim();
	input = parseCmd(input);

	for(var command in consoleCommands) {
		if(input[0] == command) {
			input.splice(0, 1);
			return consoleCommands[command]["callback"](input);
		}
	}
});
