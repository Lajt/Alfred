var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;

/************/
/* Messages */
/************/
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

/**********/
/* Client */
/**********/
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

bot_proto.prototype.clientfind = function(client_nickname, callbackFunction) {
	bot.sendCommand('clientfind', {'pattern': client_nickname}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
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
			bot.sendCommand('clientmove', {'clid': clid, 'cid': cid}, function(err, data) {
				data["clid"] = clid;
				if(typeof callbackFunction == 'function') callbackFunction(err, data);
			});
		}
	}, 0);
}

bot_proto.prototype.clientkick = function(clid, reasonid, reasonmsg, callbackFunction) {
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
			bot.sendCommand('clientkick', {'clid': clid, 'reasonid': reasonid, 'reasonmsg': reasonmsg}, function(err, data) {
				data["clid"] = clid;
				if(typeof callbackFunction == 'function') callbackFunction(err, data);
			});
		}
	}, 0);
}

/***********/
/* Channel */
/***********/
bot_proto.prototype.channellist = function(callbackFunction) {
	bot.sendCommand('channellist', null, function(err, data, raw) {
		var channels = raw.split('|');
		var returnChannels = [];
		for(var i=0; i<channels.length; i++) {
			var arguments = channels[i].split(' ');
			var returnChannel = {};
			for(var x=0; x<arguments.length; x++) {
				var argument = arguments[x].split(/=(.+)?/);
				returnChannel[argument[0]] = bot.decode(argument[1]);
			}
			returnChannels.push(returnChannel);
		}
		if(typeof callbackFunction == 'function') callbackFunction(returnChannels);
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

bot_proto.prototype.channelfind = function(channel_name, callbackFunction) {
	bot.sendCommand('channelfind', {'pattern': channel_name}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

bot_proto.prototype.channelinfo = function(cid, callbackFunction) {
	var channel_found = false;

	if(typeof cid == 'string') {
		bot.channelfind(cid, function(err, data) {
			cid = data["cid"];
			channel_found = true;
		});
	} else if (Number.isInteger(cid)) channel_found = true;

	var continueFunction = setInterval(function() {
		if(channel_found) {
			clearInterval(continueFunction);
			bot.sendCommand('channelinfo', {'cid': cid}, function(err, channelinfo) {
				channelinfo["cid"] = cid;
				if(typeof callbackFunction == 'function') callbackFunction(err, channelinfo);
			});
		}
	}, 0);
}

/*****************/
/* Server-Groups */
/*****************/
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
