/// <reference path="typings/tsd.d.ts" />

import AsyncMessage = require('AsyncMessage');

process.on('message', function (message:AsyncMessage.Message) {
    try {
        var file:string = message.file;
        var func:string = message.func;
        var args:string[] = message.args;
        var id:number = message.id;
        require.cache = {}; // clear cache
        var object = require(file);
        var call = func == '' ? object : object[func];
        var data = call.apply(object, args);
        process.send({id: id, data: {data: data}});
    } catch (err) {
        process.send({id: id, data: {error: err.stack}});
    }
});
