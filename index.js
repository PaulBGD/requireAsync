var fork = require('child_process').fork;
var pathJoin = require('path').join;
var fs = require('fs');

module.exports = function requireAsync(path) {
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
        var func = args.shift();
        var forked = fork(__dirname + '/handler.js');
        forked.send({'func': func, 'args': args, 'file': file});
        forked.on('error', function (err) {
            callback(err);
        });
        forked.on('message', function (message) {
            callback(message.error, message.error ? undefined : message.data);
        });
    };
};
