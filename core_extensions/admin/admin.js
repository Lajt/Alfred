var fs = require('fs');
var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;
var admins = {};

bot_proto.prototype.userIsAdmin = function(targetuid, adminLevel) {
	if(adminLevel === true) adminLevel = 2;
	else if(adminLevel == 0) return true;

	for(var admin in admins) {
		if(targetuid == admin && admins[admin] >= adminLevel) return true;
	}
	return false;
}

bot_proto.prototype.userSetAdmin = function(targetuid, adminLevel) {
	var type = false;
	adminLevel = parseInt(adminLevel);
	if(typeof adminLevel == 'number') type = true;

	if(adminLevel != 0 && adminLevel <= 2 && type) {
		admins[targetuid] = adminLevel;
		saveToFile(admins);
		return 0;
	} else if(adminLevel == 0 && type) {
		delete admins[targetuid];
		saveToFile(admins);
		return 0;
	}
	return 1;
}

function saveToFile(content) {
	fs.writeFile(bot.config["admin-file"], JSON.stringify(content, null, 4));
}

bot.on('login', function() {
	fs.exists(bot.config["admin-file"], function(exists) {
		if(!exists) {
			fs.writeFile(bot.config["admin-file"], JSON.stringify({}, null, 4), function(err) {
				admins = require(bot.config["admin-file"]);
			});
		} else {
			admins = require(bot.config["admin-file"]);
		}
	});
});
