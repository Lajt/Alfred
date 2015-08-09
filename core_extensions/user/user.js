"use strict";
var bot = global.bot_reference;
var bot_proto = global.bot_proto_reference;
var delete_prop = [
	"connection_bandwidth_received_last_minute_total",
	"connection_bandwidth_received_last_second_total",
	"connection_bandwidth_sent_last_minute_total",
	"connection_bandwidth_sent_last_second_total",
	"connection_bandwidth_sent_last_minute_total",
	"connection_bytes_received_total",
	"connection_bytes_sent_total",
	"connection_packets_received_total",
	"connection_packets_sent_total",
	"connection_filetransfer_bandwidth_received",
	"connection_filetransfer_bandwidth_sent",
	"client_badges",
	"client_country",
	"client_is_channel_commander",
	"client_created",
	"client_flag_avatar",
	"client_talk_request_msg",
	"client_talk_request",
	"client_lastconnected",
	"client_totalconnections",
	"client_version_sign",
	"client_away_message",
	"client_security_hash",
	"client_meta_data",
	"client_version",
	"client_needed_serverquery_view_power",
	"client_nickname_phonetic",
	"client_is_priority_speaker",
	"client_month_bytes_uploaded",
	"client_month_bytes_downloaded",
	"client_total_bytes_uploaded",
	"client_total_bytes_downloaded",
	"client_default_token",
	"client_base64HashClientUID",
	"client_default_channel",
	"client_icon_id",
	"invokerid",
	"invokername",
	"invokeruid",
	"targetmode",
	"msg",
	"client_login_name",
	"client_platform",
	"client_input_muted",
	"client_output_muted",
	"client_outputonly_muted",
	"client_input_hardware",
	"client_output_hardware",
	"client_is_recording",
	"client_channel_group_id",
	"client_servergroups",
	"client_away",
	"client_is_talker",
	"client_type",
	"client_channel_group_inherited_channel_id",
	"connection_client_ip",
	"client_idle_time",
	"client_talk_power",
	"client_description",
	"connection_connected_time"
];

var translateProp = {
	'client_unique_identifier': 'uid',
	'client_nickname': 'name',
	'client_database_id': 'dbid',
	'clid': 'clid'
}

function sendMessage(msg, target, callbackFunction) {
	bot.sendCommand('sendtextmessage', {'targetmode': 1, 'target': target, 'msg': msg}, function(err, data) {
		if(typeof callbackFunction == 'function') callbackFunction(err, data);
	});
}

function sendPoke(msg, target, callbackFunction) {
	bot.sendCommand('clientpoke', {'clid': target, 'msg': msg}, function() {
		if(typeof callbackFunction == 'function') callbackFunction();
	});
}

function parsable(int) {
	return !isNaN(int);
}

function User(user_data, params) {
	if(typeof user_data != 'object') return null;
	var self = this;
	self.info = {};
	self.detail = {};
	self.info.params = params;

	for(var prop in user_data) {
		self.detail[prop] = user_data[prop];
		var prop_name = prop;
		prop = prop.split('_');
		if(delete_prop.indexOf(prop_name) > -1) {
			continue;
		}
		else if(translateProp.hasOwnProperty(prop_name)) {
			self.info[translateProp[prop_name]] = user_data[prop_name];
		}
		else if(prop[0] == 'client' || prop[0] == 'connection') {
			prop.splice(0, 1);
			self.info[prop.join('_')] = user_data[prop_name];
			delete self.info[prop_name];
		}
	}

	User.prototype.respond = function(msg) {
		var self = this;
		sendMessage(msg, self.info.clid, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.poke = function(msg) {
		var self = this;
		sendPoke(msg, self.info.clid, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.isAdmin = function(adminLevel) {
		var self = this;
		return bot.userIsAdmin(self.info.uid, adminLevel);
	}

	User.prototype.setAdmin = function(adminLevel) {
		var self = this;
		return bot.userSetAdmin(self.info.uid, adminLevel);
	}

	User.prototype.move = function(cid, callbackFunction) {
		var self = this;
		bot.clientmove(self.info.clid, cid, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.kickFromServer = function(msg, callbackFunction) {
		var self = this;
		bot.clientkick(self.info.clid, 5, msg, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.kickFromChannel = function(msg, callbackFunction) {
		var self = this;
		bot.clientkick(self.info.clid, 4, msg, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.assignGroup = function(groupid, callbackFunction) {
		var self = this;
		bot.groupAddClient(groupid, self.info.dbid, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}

	User.prototype.revokeGroup = function(groupid, callbackFunction) {
		var self = this;
		bot.groupDelClient(groupid, self.info.dbid, function() {
			if(typeof callbackFunction == 'function') callbackFunction();
		});
		return this;
	}
}

function UserFind(uname, callbackFunction) {
	bot.clientinfo(uname, function(err, clientinfo) {
		var UserClient = new User(clientinfo, []);
		if(typeof callbackFunction == 'function') callbackFunction(UserClient);
	});
}

exports.User = User;
exports.UserFind = UserFind;
