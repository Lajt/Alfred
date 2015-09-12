"use strict";
var util = require('util');
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
	'client_database_id': 'dbid',
	'client_nickname': 'name',
	'client_status': 'status',
	'clid': 'clid',
	'cid': 'cid'
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
	}

	User.prototype.respond = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		for(var i=0; i<args.length; i++){
			if(typeof args[i] == 'object') args[i] = util.inspect(args[i]);
		}
		bot.sendCommand('sendtextmessage', {'targetmode': 1, 'target': self.info.clid, 'msg': args.join(' ')});
		return this;
	}

	User.prototype.poke = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		for(var i=0; i<args.length; i++){
			if(typeof args[i] == 'object') args[i] = util.inspect(args[i]);
		}
		bot.sendCommand('clientpoke', {'clid':  self.info.clid, 'msg': args.join(' ')});
		return this;
	}

	User.prototype.isAdmin = function(adminLevel) {
		var self = this;
		bot.userIsAdmin(self.info.uid, adminLevel);
		return this;
	}

	User.prototype.setAdmin = function(adminLevel) {
		var self = this;
		bot.userSetAdmin(self.info.uid, adminLevel);
		return this;
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

	User.prototype.inGroup = function (groupid, callbackFunction) {
		var self = this;
		bot.sendCommand('servergroupclientlist', {'sgid': groupid}, function(err, data, raw) {
			if(err) {
				if(typeof callbackFunction == 'function') callbackFunction(false);
				return;
			}

			var dblist = raw.split('|');
			for(var i=0; i<dblist.length; i++) {
				if(dblist[i].split('=')[1] == self.info.dbid) {
					if(typeof callbackFunction == 'function') callbackFunction(true);
					return;
				}
			}
			if(typeof callbackFunction == 'function') callbackFunction(false);
		});
	};
}

function UserFind(uname, callbackFunction) {
	bot.clientinfo(uname, function(err, clientinfo) {
		var UserClient = new User(clientinfo, []);
		if(typeof callbackFunction == 'function') callbackFunction(UserClient);
	});
}

function UserFindDB(uname, callbackFunction) {
	bot.sendCommand('clientdbfind', {'pattern': uname}, function(err, data) {
		bot.clientdblist(function(list) {
			for(var i=0; i<list.length; i++) {
				if(list[i].cldbid == data.cldbid) {
					bot.sendCommand('clientgetids', {'cluid': list[i]['client_unique_identifier']}, function(err, data) {
						if(err == 1281) list[i]['client_status'] = 0;
						else list[i]['client_status'] = 1;

						var UserClient = new User(list[i], []);
						if(typeof callbackFunction == 'function') callbackFunction(UserClient);
					});
					break;
				}
			}
		});
	});
	return this;
}

exports.User = User;
exports.UserFind = UserFind;
exports.UserFindDB = UserFindDB;

bot_proto.prototype.User = User;
bot_proto.prototype.UserFind = UserFind;
bot_proto.prototype.UserFindDB = UserFindDB;
