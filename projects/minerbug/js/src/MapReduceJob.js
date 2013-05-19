//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MapReduceJob')

//@Require('Class')
//@Require('Obj')
//@Require('Set')
//@Require('TypeUtil')
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

var Class =     bugpack.require('Class');
var List =      bugpack.require('List');
var Set =       bugpack.require('Set');
var TypeUtil =  bugpack.require('TypeUtil');
var Job =       bugpack.require('minerbug.Job');
var MapTask =   bugpack.require('minerbug.MapTask');
var ReduceTask =    bugpack.require('minerbug.ReduceTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MapReduceJob = Class.extend(Job, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(jobObject) {
        var _this = this;
        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Set.<string>}
         */
        this.dataSources = new Set();

        /**
         * @private
         * @type {List.<Task>}
         */
        this.tasks = new List();

        if (jobObject) {
            if (TypeUtil.isArray(jobObject.dataSources)) {
                jobObject.dataSources.forEach(function(dataSource){
                    _this.dataSources.add(dataSource);
                });
            }
            if (TypeUtil.isArray(jobObject.tasks)) {
                jobObject.tasks.forEach(function(taskObject) {
                    var task = null;
                    if (taskObject.type === 'map') {
                        task = new MapTask(taskObject);
                    } else if (taskObject.type === 'reduce') {
                        task = new ReduceTask(taskObject);
                    }

                    if (task) {
                        _this.tasks.add(task);
                    }
                });
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Set.<string>}
     */
    getDataSources: function() {
        return this.dataSources;
    },

    /**
     * @return {List.<Task>}
     */
    getTasks: function() {
        return this.tasks;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Task} task
     */
    addTask: function(task) {
        this.tasks.add(task);
    },

    /**
     * @return {Object}
     */
    toObject: function() {
        return {
            sources: this.sources.getValueArray(),
            tasks: this.tasks.getValueArray()
        }
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.MapReduceJob', MapReduceJob);
