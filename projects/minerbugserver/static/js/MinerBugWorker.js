//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorker')

//@Require('Call')
//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('minerbug.TaskRunner')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Call            = bugpack.require('Call');
var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var BugFlow         = bugpack.require('bugflow.BugFlow');
var TaskRunner      = bugpack.require('minerbug.TaskRunner');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $if                 = BugFlow.$if;
var $series             = BugFlow.$series;
var $parallel           = BugFlow.$parallel;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugWorker = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(minerbugWorkerApi) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {WorkAssignment}
         */
        this.currentWorkAssignment = null;

        /**
         * @private
         * @type {MinerbugWorkerApi}
         */
        this.minerbugWorkerApi = minerbugWorkerApi;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    start: function(callback) {
        this.requestWorkAssignment();
        callback();
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     */
    cleanupWorkAssignment: function() {
        this.currentWorkAssignment = null;
    },

    /**
     * @private
     * @param {*} results
     */
    completeWorkAssignment: function(results) {
        var _this = this;
        this.minerbugWorkerApi.completeWorkAssignment(this.currentWorkAssignment, results, function(exception) {
            if (!exception) {
                _this.cleanupWorkAssignment();
                _this.requestWorkAssignment();
            }
         })
    },

    /**
     * @private
     */
    requestWorkAssignment: function() {
        var _this = this;
        if (!this.currentWorkAssignment) {
            this.minerbugWorkerApi.requestWorkAssignment(function(exception, workAssignment) {
                if (!exception) {
                    _this.startWorkAssignment(workAssignment);
                } else {
                    if (exception.getType() === "requestFailed") {
                        //TODO BRN: Start a connection check that will continually try to reconnect until the connection comes back.
                    }
                }
            });
        } else {
            throw new Error("Can only handle one work assignment at a time");
        }
    },

    /**
     * @private
     * @param {WorkAssignment} workAssignment
     */
    startWorkAssignment: function(workAssignment) {
        var _this = this;
        var task = workAssignment.getTask();
        var data = workAssignment.getData();
        var taskRunner = new TaskRunner(task);
        this.currentWorkAssignment = workAssignment;
        taskRunner.runTask(data, function(error, results) {
            if (!error) {
                _this.completeWorkAssignment(results);
            } else {
                //TODO BRN: Handle errors
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugworker.MinerbugWorker", MinerbugWorker);
