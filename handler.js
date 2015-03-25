process.on('message', function (message) {
    var file = message.file;
    var func = message.func;
    var args = message.args;
    var object = require(file);
    try {
        var call = func == '' ? object : object[func];
        var data = call.apply(object, args);
        process.send({data: data});
        process.exit(0);
    } catch (err) {
        process.send({error: err.stack});
        process.exit(1);
    }
});
