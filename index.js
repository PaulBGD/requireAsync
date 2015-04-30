var fork = require('child_process').fork;
var pathJoin = require('path').join;
var fs = require('fs');

module.exports = function requireAsync(path) {
    var id = 0; // current id for the required module

    try {
        var file = require.resolve(path);
    } catch (err) {
        path = pathJoin(__dirname, path);
        if (fs.existsSync(path)) {
            file = path;
        } else if (fs.existsSync(path + '.js')) {
            file = path + '.js';
        } else {
            throw new Error('File "' + path + '" does not exist.');
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
    return function call(/* func, arguments, [callback] */) {
        if (arguments.length < 2) {
            throw new Error('Invalid arguments. Function and callback must be included.');
        }
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function.');
        }
        var func = args.shift() || '';
        if (!forked) {
            forked = fork(pathJoin(__dirname, 'handler.js'));
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
        forked.send({'func': func, 'args': args, 'file': file, 'id': messageId});
        waiting++;
        forked.setMaxListeners((forked._maxListeners || 0) + 2);
        forked.on('error', function (err) {
            if (err.id == messageId) {
                err = err.data;
                callback(err);
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
