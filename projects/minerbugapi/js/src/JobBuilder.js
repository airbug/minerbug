//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugapi')

//@Export('JobBuilder')

//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('minerbug.Job')
//@Require('minerbug.MapTask')
//@Require('minerbug.ReduceTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var List        = bugpack.require('List');
var Obj         = bugpack.require('Obj');
var Job         = bugpack.require('minerbug.Job');
var MapTask     = bugpack.require('minerbug.MapTask');
var ReduceTask  = bugpack.require('minerbug.ReduceTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var JobBuilder = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(dataSources) {

        this._super();

        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Array.<string>}
         */
        this.dataSources = dataSources;

        /**
         * @private
         * @type {List.<Task>}
         */
        this.taskList = new List();
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function()} mapMethod
     * @return {JobBuilder}
     */
    map: function(mapMethod) {
        this.taskList.add(new MapTask({source: mapMethod}));
        return this;
    },

    /**
     * @param {function()} reduceMethod
     * @return {JobBuilder}
     */
    reduce: function(reduceMethod) {
        this.taskList.add(new ReduceTask({source: reduceMethod}));
        return this;
    },

    /**
     * @return {Job}
     */
    build: function() {
        return new Job({
            dataSources: this.dataSources,
            tasks: this.taskList.toValueArray()
        });
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugapi.JobBuilder', JobBuilder);
