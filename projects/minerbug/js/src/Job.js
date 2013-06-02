//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('Job')

//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('Set')
//@Require('TypeUtil')
//@Require('UuidGenerator')
//@Require('minerbug.MapTask')
//@Require('minerbug.ReduceTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var List            = bugpack.require('List');
var Obj             = bugpack.require('Obj');
var Set             = bugpack.require('Set');
var TypeUtil        = bugpack.require('TypeUtil');
var UuidGenerator   = bugpack.require('UuidGenerator');
var MapTask         = bugpack.require('minerbug.MapTask');
var ReduceTask      = bugpack.require('minerbug.ReduceTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Job = Class.extend(Obj, {

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

        /**
         * @priate
         * @type {string}
         */
        this.uuid = UuidGenerator.generateUuid();

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

    /**
     * @return {string}
     */
    getUuid: function() {
        return this.uuid;
    },


    //-------------------------------------------------------------------------------
    // Instance Methods
    //-------------------------------------------------------------------------------

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

bugpack.export('minerbug.Job', Job);
