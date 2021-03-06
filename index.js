/// <reference path="typings/tsd.d.ts" />
var Child = require('child_process');
var path = require('path');
var fs = require('fs');
module.exports = function requireAsync(modulePath) {
    var id = 0; // current id for the required module
    try {
        var file = require.resolve(modulePath);
    }
    catch (err) {
        modulePath = path.join(__dirname, modulePath);
        if (fs.existsSync(modulePath)) {
            file = modulePath;
        }
        else if (fs.existsSync(modulePath + '.js')) {
            file = modulePath + '.js';
        }
        else {
            throw new Error('File "' + modulePath + '" does not exist.');
        }
    }
    var forked;
    var timeoutId = -1;
    var waiting = 0;
    /**
     * Calls the specified functions with arguments
     *
     * @param func the function to call
     * @param arguments the arguments to use
     * @param callback the callback to use when function is done
     */
    return function call(func, callback) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (arguments.length < 2) {
            throw new Error('Invalid arguments. Function and callback must be included.');
        }
        if (!forked) {
            forked = Child.fork(path.join(__dirname, 'handler.js'));
            var currentId = timeoutId = setInterval(function () {
                if (timeoutId == currentId && waiting == 0 && forked) {
                    // kill process
                    forked.kill();
                    forked = null;
                    clearInterval(currentId);
                    timeoutId = 0;
                }
            }, 30 * 1000); // keep alive for 30 seconds todo: configurable
        }
        var messageId = id++;
        forked.send({ 'func': func, 'args': args, 'file': file, 'id': messageId });
        waiting++;
        forked.setMaxListeners((forked._maxListeners || 0) + 2);
        forked.on('error', function (err) {
            if (err.id == messageId) {
                err = err.data;
                callback(err, undefined);
                waiting--;
            }
        });
        forked.on('message', function (message) {
            if (message.id == messageId) {
                message = message.data;
                callback(message.error, message.error ? undefined : message.data);
                waiting--;
            }
        });
    };
};
//# sourceMappingURL=index.js.map