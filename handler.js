process.on('message', function (message) {
    try {
        var file = message.file;
        var func = message.func;
        var args = message.args;
        var id = message.id;
        require.cache = {}; // clear cache
        var object = require(file);
        var call = func == '' ? object : object[func];
        var data = call.apply(object, args);
        process.send({id: id, data: {data: data}});
    } catch (err) {
        process.send({id: id, data: {error: err.stack}});
    }
});
