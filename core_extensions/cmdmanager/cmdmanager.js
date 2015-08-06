var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;
var commands = {};

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

bot_proto.prototype.sendMessage = function(msg, target) {
	if(typeof msg != 'string') return;
	msg = bot.encode(msg);
	bot.sendCommand('sendtextmessage', {'targetmode': 1, 'target': target, 'msg': msg});
}

bot_proto.prototype.addCmd = function(cmd, targetmode, callbackFunction, adminLevel, usage, description) {
	if(typeof callbackFunction != 'function') return;
	if(commands.hasOwnProperty(cmd)) bot.throwErr("Command already exists: " + cmd);
	commands[cmd] = {};
	commands[cmd]["callback"] = callbackFunction;
	commands[cmd]["adminLevel"] = adminLevel;
	commands[cmd]["usage"] = usage;
	commands[cmd]["desc"] = description;
	commands[cmd]["targetmode"] = targetmode;
}

bot.on('textmessage', function(data) {
	var params = parseCmd(data["msg"]);
	for(var command in commands) {
		if(params[0] == "." + command && data["targetmode"] == commands[command]["targetmode"]) {
			delete data["msg"];
			params.splice(0, 1);
			commands[command]["callback"](data, params); // FIXME: Improve the callback invocation
		}
	}
});
