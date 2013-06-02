//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugapi')

//@Export('MinerbugApi')

//@Require('CallManager')
//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('minerbugapi.JobBuilder')
//@Require('minerbugapi.RegisterJobCall')
//@Require('socketio:client.SocketIoClient')
//@Require('socketio:client.SocketIoConfig')
//@Require('socketio:client.SocketIoClientMessageChannel')
//@Require('socketio:factoryserver.ServerSocketIoFactory')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var CallManager                     = bugpack.require('CallManager');
var Class                           = bugpack.require('Class');
var Obj                             = bugpack.require('Obj');
var Proxy                           = bugpack.require('Proxy');
var JobBuilder                      = bugpack.require('minerbugapi.JobBuilder');
var RegisterJobCall                 = bugpack.require('minerbugapi.RegisterJobCall');
var SocketIoClient                  = bugpack.require('socketio:client.SocketIoClient');
var SocketIoConfig                  = bugpack.require('socketio:client.SocketIoConfig');
var SocketIoClientMessageChannel    = bugpack.require('socketio:client.SocketIoClientMessageChannel');
var ServerSocketIoFactory           = bugpack.require('socketio:factoryserver.ServerSocketIoFactory');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugApi = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(callManager, outgoingMessageChannel) {

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
         * @type {IMessageChannel}
         */
        this.outGoingMessageChannel = outgoingMessageChannel;
    },


    //-------------------------------------------------------------------------------
    // Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<string>} dataSources
     * @return {JobBuilder}
     */
    mine: function(dataSources) {
        return new JobBuilder(dataSources);
    },

    /**
     * @param {Job} job
     * @param {function(error, JobWatcher} callback
     */
    registerJob: function(job, callback) {
        var registerJobCall = new RegisterJobCall(dataSources);
        this.callManager.registerCall(registerJobCall);
        var registerJobMessage = new Message("registerJob", {
            job: job.toObject()
        });
        this.sendMessage(registerJobMessage, this.minerbugMessagingChannel, function(responseChannel) {
            responseChannel.on()
        });
    }
});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {MinerbugApi}
 */
MinerbugApi.instance = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

MinerbugApi.getInstance = function() {
    if (!MinerbugApi.instance) {
        var callManager = new CallManager();
        var serverSocketIoFactory = new ServerSocketIoFactory();
        var socketIoConfig = new SocketIoConfig({
            hostname: "http://localhost.com/minerbug-api",
            port: 8000
        });
        var socketIoClient = new SocketIoClient(serverSocketIoFactory, socketIoConfig);
        var socketIoClientMessageChannel = new SocketIoClientMessageChannel(socketIoClient);
        MinerbugApi.instance = new MinerbugApi(callManager, socketIoClientMessageChannel);
    }
    return MinerbugApi.instance;
};

Proxy.proxy(MinerbugApi, MinerbugApi.getInstance, [
    "mapReduce"
]);


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbugapi.MinerbugApi', MinerbugApi);
