/// <reference path="typings/tsd.d.ts" />

import Child = require('child_process');
import path = require('path');
import fs = require('fs');

module.exports = function requireAsync(modulePath:string) {
    var id = 0; // current id for the required module

    try {
        var file:string = require.resolve(modulePath);
    } catch (err) {
        modulePath = path.join(__dirname, modulePath);
        if (fs.existsSync(modulePath)) {
            file = modulePath;
        } else if (fs.existsSync(modulePath + '.js')) {
            file = modulePath + '.js';
        } else {
            throw new Error('File "' + modulePath + '" does not exist.');
        }
    }

    var forked:Child.ChildProcess;
    var timeoutId:number = -1;
    var waiting:number = 0;

    /**
     * Calls the specified functions with arguments
     *
     * @param func the function to call
     * @param arguments the arguments to use
     * @param callback the callback to use when function is done
     */
    return function call(func:string, callback:(err:string, data:any) => void, ...args:any[]) {
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
        forked.send({'func': func, 'args': args, 'file': file, 'id': messageId});
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
