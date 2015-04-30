# requireAsync
Call any function on another thread.

## Installing

````
npm install requireAsync
````

## Usage
````javascript
var requireAsync = require('require-async');

var someModule = requireAsync('some-module');
var someFile = requireAsync('./file.js');
````

The parameters for the returned function are

 - ``func`` - the function to call inside your required module or file
 - ``arguments`` - list as many arguments between this and the callback, these will be passed to the function
 - ``callback`` - the last argument must be a callback

## Example usage
````javascript
var requireAsync = require('require-async');

var bcrypt = requireAsync('bcryptjs');

bcrypt('hashSync', 'bacon', 8, function(err, salt) {
    if (err) {
        throw err;
    }
    console.log(salt);
});
````

## Tips

 - Leave the function name blank (not null, not defined, blank) if the function is the default export.
