# requireAsync
Call any function on another thread.

## Installing

````
npm install requireAsync
````

## Example usage
````javascript
var requireAsync = require('requireAsync');

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
