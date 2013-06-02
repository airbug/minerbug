//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugapi')

//@Export('RegisterJobCall')

//@Require('Class')
//@Require('bugmessage.Call')
//@Require('bugmessage.Message')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Call            = bugpack.require('bugmessage.Call');
var Message         = bugpack.require('bugmessage.Message');


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
    // IMessageChannel Implementation
    //-------------------------------------------------------------------------------

    /**
     * @param {Message} message
     * @param {string} channel
     */
    channelMessage: function(message, channel) {
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
     *
     */
    registerJob: function() {
        if (!this.jobRegistered) {
            this.jobRegistered = true;
            var message = new Message(RegisterJobCall.MessageTopics.JOB_REGISTRATION, {
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
MapReduceCall.MessageTopics = {
    REGISTER_JOB: "RegisterJob"
};


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.MapReduceCall', RE);
