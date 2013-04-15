//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MinerBugApplication')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('minerbug.TaskRunner')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Obj =               bugpack.require('Obj');
var TaskRunner =        bugpack.require('minerbug.TaskRunner');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerBugApplication = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    start: function() {
        //TEST
        console.log("MinerBugApplication started");
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Task} task
     */
    runTask: function(task, data, callback) {
        var taskRunner = new TaskRunner(task);
        taskRunner.runTask(data, callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbug.MinerBugApplication", MinerBugApplication);
