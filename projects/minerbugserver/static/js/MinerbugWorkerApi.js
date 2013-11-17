//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorkerApi')

//@Require('Class')
//@Require('Obj')
//@Require('minerbug.WorkAssignment')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var WorkAssignment  = bugpack.require('minerbug.WorkAssignment');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugWorkerApi = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(bugCallClient) {

        this._super();

        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {BugCallClient}
         */
        this.bugCallClient = bugCallClient;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Exception, WorkAssignment)} callback
     */
    requestWorkAssignment: function(callback) {
        this.bugCallClient.request(MinerbugWorkerApi.RequestTypes.REQUEST_WORK_ASSIGNMENT, {}, function(exception, callResponse) {
            if (!exception) {
                if (callResponse.getType() === "workAssignment") {

                    //TODO BRN: We should use the BugMarshaller to make the conversion here instead.

                    var workAssignment = new WorkAssignment(callResponse.getData().workAssignment);
                    callback(null, workAssignment);
                } else {
                    //TODO BRN: Handle other types of responses
                    throw new Error("Unhandled response type. responseType:" + callResponse.getType());
                }
            } else {
                callback(exception);
            }
        });
    },


    //TODO BRN: If we drop our connection before this work assignment is complete, should the server give the work
    // assignment to someone else immediately? Or wait for a given amount of time to see if the connection comes back?

    /**
     * @param {WorkAssignment} workAssignment
     * @param {*} workResults
     * @param {function(Exception)} callback
     */
    completeWorkAssignment: function(workAssignment, workResults, callback) {
        var data = {
            workAssignmentUuid: workAssignment.getUuid(),
            workResults: workResults
        };
        this.bugCallClient.request(MinerbugWorkerApi.RequestTypes.COMPLETE_WORK_ASSIGNMENT, data, function(exception, callResponse) {
            if (!exception) {
                if (callResponse.getType() === "workAssignmentCompleted") {
                    callback();
                } else {
                    throw new Error("Unhandled response type");
                }
            } else {
                callback(exception);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @enum {string}
 */
MinerbugWorkerApi.RequestTypes = {
    COMPLETE_WORK_ASSIGNMENT: "completeWorkAssignment",
    REQUEST_WORK_ASSIGNMENT: "requestWorkAssignment"
};


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugworker.MinerbugWorkerApi', MinerbugWorkerApi);
