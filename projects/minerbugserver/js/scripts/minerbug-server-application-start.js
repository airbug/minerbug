//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('minerbug.MinerbugApplication')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var MinerbugServerApplication = bugpack.require('minerbugserver.MinerbugServerApplication');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var minerbugServerApplication = new MinerbugServerApplication();
minerbugServerApplication.start(function(error){
    console.log("Starting minerbug server...");
    if (!error){
        console.log("Minerbug successfully started");
    } else {
        console.error(error);
        console.error(error.stack);
        process.exit(1);
    }
});
