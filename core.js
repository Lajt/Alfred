var net = require('net');
var sys = require('sys');
var util = require('util');
var events = require('events');
var lineInputStream = require('line-input-stream');

var sock = new net.Socket();
var commandQueue = [];
var status = -2;
var current = false;

function Alfred() {
    var self = this;
    events.EventEmitter.call(this);
    global.bot_reference = this;
    global.bot_proto_reference = Alfred;

    core_include('query');
    core_include('admin');
    core_include('cmdmanager');

    self.config = {
        'name': 'Alfred',
        'host': '127.0.0.1',
        'port': 10011,
        'login-name': 'serveradmin',
        'login-pass': 'password',
        'virtual-server': 1
    };
    self.extensions = [];
    self.self = -1;

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

    function core_include(extension) {
        return require(__dirname + '/core_extensions/' + extension + '/' + extension + '.js');
    }

    Alfred.prototype.configure = function (settings) {
        for(var setting in settings) {
            if(!self.config.hasOwnProperty(setting)) continue;
            self.config[setting] = settings[setting];
        }
        return this;
    }

    Alfred.prototype.start = function () {
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
                    var _error = _data["id"];
                    delete _data["error"] ;
                    delete _data["id"];
                    if(typeof current.data == 'undefined') current.data = _data;
                    if(current["callback"]) current["callback"].call(current, _error, current.data, current.raw_data);
                    current = false;
                    checkQueue();
                }
                else if(_recv[0].substr(0, 6) == "notify") {
                    delete _data[_recv[0]];
                    self.emit(_recv[0].slice(6, _recv[0].length), _data);
                }
                else if(current) {
                    current.data = _data;
                    current.raw_data = recv.toString();
                }
            });

            sock.on('error', function(error) {
                self.emit('sock_error', error);
            });

            self.emit('connect');
        });
    }

    Alfred.prototype.load = function() {
        self.sendCommand('login', [self.config["login-name"], self.config["login-pass"]], function(err, data) {
            if(err != 0) {
                self.throwErr(err, data);
                return;
            }
        });
        self.sendCommand('use', {'sid': self.config["virtual-server"]});
        self.sendCommand('clientupdate', {'client_nickname': self.config["name"]});
        self.sendCommand('whoami', null, function(err, data) {
            self.self = data["client_id"];
        });
        self.emit('load');
        return this;
    }

    Alfred.prototype.include = function(extension) {
        self.extensions.push(require(extension + '/extension.json'));
        return require(extension + '/' + extension + '.js');
    }

    Alfred.prototype.encode = function(string) {
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

    Alfred.prototype.decode = function(string) {
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

    Alfred.prototype.sendCommand = function(command, parameters, callbackFunction) {
        var _parameters = [];

        if(typeof parameters == 'undefined' || parameters == null) {
            _parameters = [];
        } else if(Array.isArray(parameters))   {
            for(var i=0; i<parameters.length; i++) _parameters.push(self.encode(parameters[i]));
        } else if(typeof parameters == 'object') {
            for(var param in parameters) _parameters.push(self.encode(param) + '=' + self.encode(parameters[param]));
        } else {
            _parameters.push(self.encode(String(parameters)));
        }

        if(typeof callbackFunction != 'function') callbackFunction = function(err, data) {};
        commandQueue.push({'cmd': command, 'params': _parameters, 'callback': callbackFunction});
        if(status === 0) checkQueue();
        return command + ' ' + _parameters.join(' ');
    }

    Alfred.prototype.registerEvent = function(event, params) {
        self.sendCommand('servernotifyregister', {'event': event});
    }

    Alfred.prototype.log = function(text) {
        console.log(timeStamp() + text);
        return self;
    }

    Alfred.prototype.throwErr = function(err, text) {
        console.log(timeStamp() + "[BOT-ERROR] " + err);
        self.emit('error', err, text);
        return self;
    }
}

util.inherits(Alfred, events.EventEmitter);
exports.Alfred = Alfred;
