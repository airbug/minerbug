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

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {MinerbugWorkerApi}
         */
        this.minerbugWorkerApi = null;

        /**
         * @private
         * @type {WorkAssignmentCall}
         */
        this.workAssignmentCall = null;
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
        this.workAssignmentCall.cleanup();
        this.workAssignmentCall = null;
    },

    /**
     * @private
     * @param {*} results
     */
    completeWorkAssignment: function(results) {
         this.workAssignmentCall.completeWorkAssignment(results);
    },

    /**
     * @private
     */
    requestWorkAssignment: function() {
        var workAssignmentCall = this.minerbugWorkerApi.workAssignment();
        workAssignmentCall.onWorkAssignmentReceived(this.hearWorkAssignmentReceivedEvent, this);
        workAssignmentCall.onWorkAssignmentSignOffReceived(this.hearWorkAssignmentSignOffReceivedEvent, this);
        workAssignmentCall.on(Call.EventTypes.ERROR, this.hearCallErrorEvent, this);
        workAssignmentCall.requestWorkAssignment();
        this.workAssignmentCall = workAssignmentCall;
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
        taskRunner.runTask(data, function(error, results) {
            if (!error) {
                _this.completeWorkAssignment(results);
            } else {
                //TODO BRN: Handle errors
            }
        });
    },


    //-------------------------------------------------------------------------------
    // Event Listeners
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Event} event
     */
    hearCallErrorEvent: function(event) {
        //TODO BRN: What do we do here?
    },

    /**
     * @private
     * @param {Event} event
     */
    hearWorkAssignmentReceivedEvent: function(event) {
        var workAssignment = event.getData().workAssignment;
        this.startWorkAssignment(workAssignment);
    },

    /**
     * @private
     * @param {Event} event
     */
    hearWorkAssignmentSignOffReceivedEvent: function(event) {
        this.cleanupWorkAssignment();
        this.requestWorkAssignment();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugworker.MinerbugWorker", MinerbugWorker);
