//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('JobManager')

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
var Queue =     bugpack.require('Queue');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var JobManager = Class.extend(Obj, {

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
         * @type {array}
         */
        this.jobs = new Queue();
    },

    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * job manager will be queue for ALL jobs for now, later on, add more CRUD activity for a specific supplier
     * @return {*}
     */
    getNextJob: function () {
        return this.jobs.dequeue();
    },

    /**
     * @param {*}
     */
    addJob: function(job) {
        return this.jobs.add(job);
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugserver.JobManager', JobManager);
