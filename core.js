var net = require('net');
var sys = require('sys');
var manager = require('./manager');



function Albert(name) {
    var _this = this;
    _this._sock = new net.Socket();
    _this._config = {
        'host': '127.0.0.1',
        'port': 10011,
        'login-name': 'serveradmin',
        'login-pass': 'password'
    };
    _this._extensions = [];
    _this._self = -1;
    _this._name = name;
    return this;
}

Albert.prototype.configure = function (settings) {
    for(var setting in settings) {
        _this._config[setting] = settings[setting];
    }
    return this;
}

Albert.prototype.start = function () {
    var _this = this;

    _this._sock.connect(_this._config.port, _this._config.host, function() {

    });

    return this;
}

Albert.prototype.stop = function() {
    // TODO: Code stop function
}

Albert.prototype.load = function() {
    // TODO: Code load function
}

Albert.prototype.include = function(extension) {
    // TODO: Code include function
}
