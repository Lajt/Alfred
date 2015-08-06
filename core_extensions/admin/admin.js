var fs = require('fs');
var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;
var admins = require('./admins.json');

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
	console.log(content);
	fs.writeFile(__dirname + '/admins.json', JSON.stringify(content, null, 4));
}