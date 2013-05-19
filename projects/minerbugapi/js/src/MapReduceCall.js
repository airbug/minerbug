//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugapi')

//@Export('MapReduceCall')

//@Require('Call')
//@Require('Class')
//@Require('Message')
//@Require('minerbug.MapReduceJob')
//@Require('minerbug.MapTask')
//@Require('minerbug.ReduceTask')


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
var MapReduceJob    = bugpack.require('minerbug.MapReduceJob');
var MapTask         = bugpack.require('minerbug.MapTask');
var ReduceTask      = bugpack.require('minerbug.ReduceTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MapReduceCall = Class.extend(Call, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(callManager, dataSources) {

        this._super(callManager);

        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.jobRegistered = false;

        /**
         * @private
         * @type {MapReduceJob}
         */
        this.mapReduceJob = new MapReduceJob({
            dataSources: dataSources
        });
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
            if (message.getTopic() === MapReduceCall.IncomingMessageTopics.JOB_ACCEPTANCE) {
                this.dispatchEvent(new Event(MapReduceJob.EventTypes.JOB_ACCEPTED, {
                    message: message,
                    channel: channel
                }));
            } else if (message.getTopic() === MapReduceCall.IncomingMessageTopics.JOB_COMPLETION) {
                this.dispatchEvent(new Event(MapReduceJob.EventTypes.JOB_COMPLETE, {
                    message: message,
                    channel: channel
                }));
            } else if (message.getTopic() === MapReduceCall.IncomingMessageTopics.JOB_STATUS) {
                this.dispatchEvent(new Event(MapReduceJob.EventTypes.JOB_STATUS, {
                    message: message,
                    jobStatus: message.getData().jobStatus,
                    channel: channel
                }));
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function()} mapMethod
     * @return {*}
     */
    map: function(mapMethod) {
        this.mapReduceJob.addTask(new MapTask({source: mapMethod}));
        return this;
    },

    /**
     * @param {functionreduceMethod
     * @return {*}
     */
    reduce: function(reduceMethod) {
        this.mapReduceJob.addTask(new ReduceTask({source: reduceMethod}));
        return this;
    },

    /**
     *
     */
    registerJob: function() {
        if (!this.jobRegistered) {
            this.jobRegistered = true;
            var message = new Message(MapReduceCall.OutgoingMessageTopics.JOB_REGISTRATION, {
                job: this.mapReduceJob.toObject()
            });
            this.sendMessage(message);
        } else {
            throw new Error("Job cannot be registered more than once");
        }
    },

    /**
     * @param {function(Event)} listenerFunction
     * @param {Object} listenerContext
     */
    onJobAccepted: function(listenerFunction, listenerContext) {
        this.addEventListener(MapReduceCall.EventTypes.JOB_ACCEPTED, listenerFunction, listenerContext);
    },

    /**
     * @param {function(Event)} listenerFunction
     * @param {Object} listenerContext
     */
    onJobComplete: function(listenerFunction, listenerContext) {
        this.addEventListener(MapReduceCall.EventTypes.JOB_COMPLETE, listenerFunction, listenerContext);
    },

    /**
     * @param {function(Event)} listenerFunction
     * @param {Object} listenerContext
     */
    onJobStatus: function(listenerFunction, listenerContext) {
        this.addEventListener(MapReduceCall.EventTypes.JOB_STATUS, listenerFunction, listenerContext);
    }
});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @enum {string}
 */
MapReduceCall.EventTypes = {
    JOB_ACCEPTED: "MapReduceCall:JobAccepted",
    JOB_COMPLETE: "MapReduceCall:JobComplete",
    JOB_STATUS: "MapReduceCall:JobStatus"
};

/**
 * @enum {string}
 */
MapReduceCall.IncomingMessageTopics = {
    JOB_ACCEPTANCE: "JobAcceptance",
    JOB_COMPLETION: "JobCompletion",
    JOB_STATUS: "JobStatus"
};

/**
 * @enum {string}
 */
MapReduceCall.OutgoingMessageTopics = {
    JOB_REGISTRATION: "JobRegistration"
};


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.MapReduceCall', MapReduceCall);
