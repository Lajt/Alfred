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

bot_proto.prototype.addCmd = function(cmd, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(commands.hasOwnProperty(cmd)) return bot.throwErr(2, "Command already exists: " + cmd);
	commands[cmd] = {};
	commands[cmd]["callback"] = callbackFunction;
	commands[cmd]["adminLevel"] = adminLevel;
	commands[cmd]["usage"] = usage;
	commands[cmd]["desc"] = description;
}

bot_proto.prototype.addGlobalCmd = function(cmd, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(globalCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "GlobalCommand already exists: " + cmd);
	globalCommands[cmd] = {};
	globalCommands[cmd]["callback"] = callbackFunction;
	globalCommands[cmd]["adminLevel"] = adminLevel;
	globalCommands[cmd]["usage"] = usage;
	globalCommands[cmd]["desc"] = description;
}

bot_proto.prototype.addChannelCmd = function(cmd, cid, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(channelCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "ChannelCommand already exists: " + cmd);
	channelCommands[cmd] = {};
	channelCommands[cmd]["callback"] = callbackFunction;
	channelCommands[cmd]["adminLevel"] = adminLevel;
	channelCommands[cmd]["usage"] = usage;
	channelCommands[cmd]["desc"] = description;
	channelCommands[cmd]["cid"] = cid;
}

bot_proto.prototype.addConsoleCmd = function(cmd, callbackFunction, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(consoleCommands.hasOwnProperty(cmd)) return bot.throwErr(2, "ConsoleCommand already exists: " + cmd);
	consoleCommands[cmd] = {};
	consoleCommands[cmd]["callback"] = callbackFunction;
	consoleCommands[cmd]["usage"] = usage;
	consoleCommands[cmd]["desc"] = description;
}

bot.on('textmessage', function(data) {
	if(data["invokerid"] == bot.self || data["invokerid"] < 1) return;
	var _data = data, params = parseCmd(data["msg"]);

	for(var command in commands) {
		if(params[0] == bot.config["command-identifer"] + command && data["targetmode"] == 1 && bot.userIsAdmin(data["invokeruid"], commands[command]["adminLevel"])) {
			var invokerid = data["invokerid"];
			delete data["invokerid"];
			delete data["msg"];
			params.splice(0, 1);
			commands[command]["callback"](invokerid, data, params); // FIXME: Improve the callback invocation
			return;
		}
	}

	for(var command in globalCommands) {
		if(params[0] == bot.config["command-identifer"] + command && data["targetmode"] == 3 && bot.userIsAdmin(data["invokeruid"], globalCommands[command]["adminLevel"])) {
			var invokerid = data["invokerid"];
			delete data["invokerid"];
			delete data["msg"];
			params.splice(0, 1);
			globalCommands[command]["callback"](invokerid, data, params); // FIXME: Improve the callback invocation
			return;
		}
	}

	bot.clientinfo(parseInt(data["invokerid"]), function(err, data) {
		var cid = data["cid"];
		for(var command in channelCommands) {
			if(params[0] == bot.config["command-identifer"] + command && _data["targetmode"] == 2 && cid == channelCommands[command]["cid"] && bot.userIsAdmin(_data["invokeruid"], channelCommands[command]["adminLevel"])) {
					console.log(_data);
					var invokerid = _data["invokerid"];
					delete _data["invokerid"];
					delete _data["msg"];
					params.splice(0, 1);
					channelCommands[command]["callback"](invokerid, _data, params); // FIXME: Improve the callback invocation
					return;
			}
		}
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
