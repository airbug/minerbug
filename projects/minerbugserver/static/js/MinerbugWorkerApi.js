//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorkerApi')

//@Require('Class')
//@Require('Obj')
//@Require('minerbugworker.WorkAssignmentCall')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var Obj                 = bugpack.require('Obj');
var WorkAssignmentCall  = bugpack.require('minerbugworker.WorkAssignmentCall');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugWorkerApi = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(callManager, socketIoClientMessageChannel) {

        this._super();

        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {CallManager}
         */
        this.callManager = callManager;

        /**
         * @private
         * @type {SocketIoClientMessageChannel}
         */
        this.socketIoClientMessageChannel = socketIoClientMessageChannel;


        this.socketIoClientMessageChannel.setIncomingMessageChannel(this.callManager.getIncomingMessageRouter());
        this.callManager.setOutgoingMessageChannel(this.socketIoClientMessageChannel);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {WorkAssignmentCall}
     */
    workAssignment: function() {
        var workAssignmentCall = new WorkAssignmentCall();
        this.callManager.registerCall(workAssignmentCall);
        return workAssignmentCall;
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugworker.MinerbugWorkerApi', MinerbugWorkerApi);
