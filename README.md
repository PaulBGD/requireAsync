# requireAsync
Call any function on another thread.

## Installing

````
npm install require-async
````

## Usage
````javascript
var requireAsync = require('require-async');

var someModule = requireAsync('some-module');
var someFile = requireAsync('./file.js');
````

The parameters for the returned function are

 - ``func`` - the function to call inside your required module or file
 - ``callback`` - the last argument must be a callback
 - ``arguments`` - list as many arguments between this and the callback, these will be passed to the function

## Example usage
````javascript
var requireAsync = require('require-async');

var bcrypt = requireAsync('bcryptjs');

bcrypt('hashSync', function(err, salt) {
    if (err) {
        throw err;
    }
    console.log(salt);
}, 'bacon', 8);
````

## Tips

 - Leave the function name blank (not null, not defined, blank) if the function is the default export.
