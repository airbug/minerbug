//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('WorkAssignmentCall')

//@Require('Call')
//@Require('Class')
//@Require('Message')
//@Require('minerbug.WorkAssignment')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Call            = bugpack.require('Call');
var Class           = bugpack.require('Class');
var Message         = bugpack.require('Message');
var WorkAssignment  = bugpack.require('minerbug.WorkAssignment');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var WorkAssignmentCall = Class.extend(Call, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(callManager) {

        this._super(callManager);

        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.workCompleted = false;

        /**
         * @private
         * @type {boolean}
         */
        this.workRequested = false;

        /**
         * @private
         * @type {WorkAssignment}
         */
        this.workAssignment = false;
    },


    //-------------------------------------------------------------------------------
    // IMessageReceiver Implementation
    //-------------------------------------------------------------------------------

    /**
     * @param {Message} message
     * @param {string} channel
     */
    receiveMessage: function(message, channel) {
        this._super(message, channel);
        if (channel === "message") {
            if (message.getTopic() === WorkAssignmentCall.IncomingMessageTopics.WORK_ASSIGNMENT) {
                this.workAssignment =  new WorkAssignment(message.getData().workAssignment);
                this.dispatchEvent(new Event(WorkAssignmentCall.EventTypes.WORK_ASSIGNMENT_RECEIVED, {
                    message: message,
                    channel: channel,
                    workAssignment: this.workAssignment
                }));
            } else if (message.getTopic() === WorkAssignmentCall.IncomingMessageTopics.WORK_ASSIGNMENT_SIGN_OFF) {
                this.dispatchEvent(new Event(WorkAssignmentCall.EventTypes.WORK_ASSIGNMENT_SIGN_OFF_RECEIVED, {
                    message: message,
                    channel: channel,
                    workAssignment: this.workAssignment
                }));
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Event)} listenerFunction
     * @param {Object} listenerContext
     */
    onWorkAssignmentReceived: function(listenerFunction, listenerContext) {
        this.addEventListener(WorkAssignmentCall.EventTypes.WORK_ASSIGNMENT_RECEIVED, listenerFunction, listenerContext);
    },

    /**
     * @param {function(Event)} listenerFunction
     * @param {Object} listenerContext
     */
    onWorkAssignmentSignOffReceived: function(listenerFunction, listenerContext) {
        this.addEventListener(WorkAssignmentCall.EventTypes.WORK_ASSIGNMENT_SIGN_OFF_RECEIVED, listenerFunction, listenerContext);
    },

    /**
     *
     */
    requestWorkAssignment: function() {
        if (!this.workRequested) {
            this.workRequested = true;
            var message = new Message(WorkAssignmentCall.OutgoingMessageTopics.WORK_ASSIGNMENT_REQUEST);
            this.sendMessage(message);
        }
    },

    /**
     * @param {*} workResults
     */
    completeWorkAssignment: function(workResults) {
        if (!this.workCompleted) {
            this.workCompleted = true;
            var message = new Message(WorkAssignmentCall.OutgoingMessageTopics.WORK_ASSIGNMENT_COMPLETE, {
                workAssignmentUuid: this.workAssignment.getUuid(),
                workResults: workResults
            });
            this.sendMessage(message);
        }
    }
});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @enum {string}
 */
WorkAssignmentCall.EventTypes = {
    WORK_ASSIGNMENT_RECEIVED: "WorkAssignmentCall:WorkAssignmentReceived",
    WORK_ASSIGNMENT_SIGN_OFF_RECEIVED: "WorkAssignmentCall:WorkAssignmentSignOffReceived"
};

/**
 * @enum {string}
 */
WorkAssignmentCall.OutgoingMessageTopics = {
    WORK_ASSIGNMENT_REQUEST: "WorkAssignmentRequest",
    WORK_ASSIGNMENT_COMPLETE: "WorkAssignmentComplete"
};

/**
 * @enum {string}
 */
WorkAssignmentCall.IncomingMessageTopics = {
    WORK_ASSIGNMENT: "WorkAssignment",
    WORK_ASSIGNMENT_SIGN_OFF: "WorkAssignmentSignOff"
};


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugworker.WorkAssignmentCall', WorkAssignmentCall);
