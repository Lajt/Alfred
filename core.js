var net = require('net');
var sys = require('sys');
var util = require('util');
var events = require('events');
var manager = require('./manager');
var lineInputStream = require('line-input-stream');

var sock = new net.Socket();
var commandQueue = [];
var status = -2;
var current = false;
var loginErrors = {
    '520': 'Wrong password',
    '3329': 'You are currently banned from the server for trying to log in with the wrong password too often'
}

function Albert() {
    events.EventEmitter.call(this);

    var self = this;
    self.config = {
        'name': 'Albert',
        'host': '127.0.0.1',
        'port': 10011,
        'login-name': 'serveradmin',
        'login-pass': 'password',
        'virtual-server': 1
    };
    self.extensions = [];
    self.myself = -1;

    function checkQueue() {
        if(!current && commandQueue.length > 0) {
            current = commandQueue.shift();
            sock.write(current["cmd"] + " " + current["params"].join(' ') + '\r\n');
        }
    }

    function timeStamp() {
        var currentTime = new Date();
    	var hours = currentTime.getHours();
    	var minutes = currentTime.getMinutes();
    	var seconds = currentTime.getSeconds();
    	if(hours < 10) hours = "0" + hours;
    	if(minutes < 10) minutes = "0" + minutes;
    	if(seconds < 10) seconds = "0" + seconds;
    	return "[" + hours + ":" + minutes + ":" + seconds + "]";
    }

    Albert.prototype.configure = function (settings) {
        for(var setting in settings) {
            self.config[setting] = settings[setting];
        }
        return this;
    }

    Albert.prototype.start = function () {
        sock.connect(self.config.port, self.config.host, function() {
            self.load();

            var input = lineInputStream(sock);
            input.on('line', function(recv) {
                recv = recv.trim();
                if(status < 0) {
                    status++;
                    if(status === 0) checkQueue();
                    return;
                }

                var _recv = recv.toString().split(' ');
                var _data = {};

                for(var i=0; i<_recv.length; i++) {
                    var argument = _recv[i].split(/=(.+)?/);
                    _data[argument[0]] = self.decode(argument[1]);
                }

                if(_recv[0] == "error") {
                    if(typeof current.data == 'undefined') current.data = _data;
                    if(current["callback"]) current["callback"].call(current, _data["id"], current.data);
                    current = false;
                    checkQueue();
                }
                else if(_recv[0].substr(0, 6) == "notify") {
                    self.emit(_recv[0].slice(6, _recv[0].length), _data);
                }
                else if(current) {
                    current.data = _data;
                }
            });

            sock.on('error', function(error) {
                self.emit('sock_error', error);
            });

            self.emit('connect');
        });
    }

    Albert.prototype.load = function() {
        self.sendCommand('login', [self.config["login-name"], self.config["login-pass"]], function(err, data) {
            if(err != 0) {
                self.throwErr(1, loginErrors[String(err)] + '\r\n' + data["msg"] + '\r\n' + data["extra_msg"]);
            }
        });
        self.sendCommand('use', {'sid': self.config["virtual-server"]});
        self.sendCommand('clientupdate', {'client_nickname': self._name});
        self.sendCommand('whoami', null, function(err, data) {
            console.log(data);
        });
        return this;
    }

    Albert.prototype.include = function(extension) {
        // TODO: Code include function
    }

    Albert.prototype.encode = function(string) {
        var ret = String(string);
    	ret = ret.replace(/\\/g, '\\\\');
    	ret = ret.replace(/\//g, '\\/');
    	ret = ret.replace(/\|/g, '\\p');
    	ret = ret.replace(/\n/g, '\\n');
    	ret = ret.replace(/\r/g, '\\r');
    	ret = ret.replace(/\t/g, '\\t');
    	ret = ret.replace(/\v/g, '\\v');
    	ret = ret.replace(/\f/g, '\\f');
    	ret = ret.replace(/ /g, '\\s');
    	return ret;
    }

    Albert.prototype.decode = function(string) {
        var ret = String(string);
    	ret = ret.replace(/\\\\/g, '\\');
    	ret = ret.replace(/\\\//g, "\/");
    	ret = ret.replace(/\\p/g, '|');
    	ret = ret.replace(/\\n/g, '\n');
    	ret = ret.replace(/\\r/g, '\r');
    	ret = ret.replace(/\\t/g, '\t');
    	ret = ret.replace(/\\v/g, '\v');
    	ret = ret.replace(/\\f/g, '\f');
    	ret = ret.replace(/\\s/g, ' ');
    	return ret;
    }

    Albert.prototype.sendCommand = function(command, parameters, callbackFunction) {
        var _parameters = [];

        if(typeof parameters == 'undefined' || parameters == null) {
            _parameters = [];
        } else if(Array.isArray(parameters))   {
            for(var i=0; i<parameters.length; i++) _parameters.push(self.encode(parameters[i]));
        } else if(typeof parameters == 'object') {
            for(var param in parameters) _parameters.push(self.encode(param) + '=' + self.encode(parameters[param]));
        } else {
            _parameters.push(String(paramters));
        }

        if(typeof callbackFunction != 'function') callbackFunction = function(err, data) {};
        commandQueue.push({'cmd': command, 'params': _parameters, 'callback': callbackFunction});
        if(status === 0) checkQueue();
        return this;
    }

    Albert.prototype.registerEvent = function(event) {
        self.sendCommand("servernotifyregister event=" + event);
    }

    Albert.prototype.log = function(text) {
        console.log(timeStamp() + text);
        return self;
    }

    Albert.prototype.throwErr = function(err, text) {
        console.log(timeStamp() + text);
        self.emit('bot_error', err, text);
        return self;
    }
}

util.inherits(Albert, events.EventEmitter);
exports.Albert = Albert;
