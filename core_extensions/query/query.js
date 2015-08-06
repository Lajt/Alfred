var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;

bot_proto.prototype.sendMessage = function(msg, target) {
	if(typeof msg != 'string') return;
	bot.sendCommand('sendtextmessage', {'targetmode': 1, 'target': target, 'msg': msg});
}

bot_proto.prototype.say = function(msg) {
	return bot.sendCommand('gm', {'msg': msg});
}

bot_proto.prototype.sayChannel = function(msg, target) {
	return bot.sendCommand('sendtextmessage', {'targetmode': 2, 'target': target, 'msg': msg});
}

bot_proto.prototype.clientfind = function(client_nickname, callbackFunction) {
	bot.sendCommand('clientfind', {'pattern': client_nickname}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.clientlist = function(callbackFunction) {
	bot.sendCommand('clientlist', null, function(err, data, raw) {
		var clients = raw.split('|');
		var returnClients = [];
		for(var i=0; i<clients.length; i++) {
			var arguments = clients[i].split(' ');
			var returnClient = {};
			for(var x=0; x<arguments.length; x++) {
				var argument = arguments[x].split(/=(.+)?/);
				returnClient[argument[0]] = bot.decode(argument[1]);
			}
			returnClients.push(returnClient);
		}
		if(typeof callbackFunction == 'function') callbackFunction(returnClients);
	});
}

bot_proto.prototype.clientinfo = function(clid, callbackFunction) {
	var client_found = false;

	if(typeof clid == 'string') {
		bot.clientfind(clid, function(err, data) {
			clid = data["clid"];
			client_found = true;
		});
	} else if (Number.isInteger(clid)) client_found = true;

	var continueFunction = setInterval(function() {
		if(client_found) {
			clearInterval(continueFunction);
			bot.sendCommand('clientinfo', {'clid': clid}, function(err, clientinfo) {
				clientinfo["clid"] = clid;
				if(typeof callbackFunction == 'function') callbackFunction(err, clientinfo);
			});
		}
	}, 0);
}

bot_proto.prototype.clientmove = function(clid, cid, callbackFunction) {
	bot.sendCommand('clientmove', {'clid': clid, 'cid': cid}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.channelcreate = function(channel_name, channel_params, callbackFunction) {
	if(channel_params == null) channel_params = {};
	channel_params['channel_name'] = channel_name;
	bot.sendCommand('channelcreate', channel_params, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.channeldelete = function(cid, callbackFunction) {
	bot.sendCommand('channeldelete', {'cid': cid}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.channeledit = function(cid, channel_params, callbackFunction) {
	channel_params["cid"] = cid;
	bot.sendCommand('channeledit', channel_params, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.groupAddClient = function (sgid, targetdbid, callbackFunction) {
	bot.sendCommand('servergroupaddclient', {'sgid': sgid, 'cldbid': targetdbid}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.groupDelClient = function(sgid, targetdbid, callbackFunction) {
	bot.sendCommand('servergroupdelclient', {'sgid': sgid, 'cldbid': targetdbid}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}
