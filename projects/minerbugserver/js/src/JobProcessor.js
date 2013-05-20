//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('JobProcessor')

//@Require('Class')
//@Require('Obj')
//@Require('TypeUtil')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var Obj =       bugpack.require('Obj');
var TypeUtil =  bugpack.require('TypeUtil');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var JobProcessor = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {
        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------
        /**
         * @private
         * @type {JobManager}
         */
        this.jobManager = null;
    },
    start: function () {
        // keep a count of running jobs?
        // try to get the next one on startup if there aren't any running?


    }
    // TODO AL: methods
    //checkAvailableMemory
    //checkAvailableDiskSpace
    //getNextJob
    //processNextJob
    //registerTask (listen to task)
    //createData
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugserver.JobProcessor', JobProcessor);
