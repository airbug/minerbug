//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugapi')

//@Export('MinerbugApi')

//@Require('CallManager')
//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('minerbug.MapReduceCall')
//@Require('socketio:client.SocketIoClient')
//@Require('socketio:client.SocketIoConfig')
//@Require('socketio:client.SocketIoMessageTransport')
//@Require('socketio:factoryserver.ServerSocketIoFactory')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var CallManager                 = bugpack.require('CallManager');
var Class                       = bugpack.require('Class');
var Obj                         = bugpack.require('Obj');
var Proxy                       = bugpack.require('Proxy');
var MapReduceCall               = bugpack.require('minerbugapi.MapReduceCall');
var SocketIoClient              = bugpack.require('socketio:client.SocketIoClient');
var SocketIoConfig              = bugpack.require('socketio:client.SocketIoConfig');
var SocketIoMessageTransport    = bugpack.require('socketio:client.SocketIoMessageTransport');
var ServerSocketIoFactory       = bugpack.require('socketio:factoryserver.ServerSocketIoFactory');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugApi = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(callManager, socketIoMessageTransport) {

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
         * @type {SocketIoMessageTransport}
         */
        this.socketIoMessageTransport = socketIoMessageTransport;


        this.socketIoMessageTransport.setIncomingMessageReceiver(this.callManager.getIncomingMessageRouter());
        this.callManager.setOutGoingMessageReceiver(this.socketIoMessageTransport);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<string>} dataSources
     * @return {MapReduceCall}
     */
    mapReduce: function(dataSources) {
        var mapReduceCall = new MapReduceCall(dataSources);
        this.callManager.registerCall(mapReduceCall);
        return mapReduceCall;
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
        var socketIoMessageTransport = new SocketIoMessageTransport(socketIoClient);
        MinerbugApi.instance = new MinerbugApi(callManager, socketIoMessageTransport);
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
