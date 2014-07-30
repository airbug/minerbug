//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('minerbugserver.MinerbugApiController')

//@Require('Class')
//@Require('Map')
//@Require('MessageReceiver')
//@Require('Obj')
//@Require('socketio.SocketIoManager')
//@Require('socketio.SocketIoConnection')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack Modules
    //-------------------------------------------------------------------------------

    var Class                               = bugpack.require('Class');
    var Map                                 = bugpack.require('Map');
    var MessageReceiver                     = bugpack.require('MessageReceiver');
    var Obj                                 = bugpack.require('Obj');
    var SocketIoManager                     = bugpack.require('socketio.SocketIoManager');
    var SocketIoConnection                  = bugpack.require('socketio.SocketIoConnection');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var MinerbugApiController = Class.extend(Obj, {

        _name: "minerbugserver.MinerbugApiController",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();

            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {ExpressApp}
             */
            this.expressApp = null;

            /**
             * @private
             * @type {MessagePublisher}
             */
            this.incomingMessagePublisher = null;

            /**
             * @private
             * @type {JobService}
             */
            this.jobService = null;

            /**
             * @private
             * @type {MessageRouter}
             */
            this.outgoingMessageRouter = null;

            /**
             * @private
             * @type {SocketIoManager}
             */
            this.socketManager = null;

            /**
             * @private
             * @type {Map.<SocketIoConnection, SocketIoConnectionMessageChannel>}
             */
            this.socketConnectionToMessageChannelMap = new Map();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function()} callback
         */
        configure: function(callback){

            this.socketManager.addEventListener(SocketIoManager.EventTypes.CONNECTION, this.hearSocketIoManagerConnection, this);


            // Routes
            //-------------------------------------------------------------------------------

            this.incomingMessagePublisher.addMessageChannelForTopic("JobRegistration", new MessageReceiver(function(message, channel) {
                if (message.job) {
                    var job = new MapReduceJob(message.job);
                    this.jobService.registerJob(job, function(error) {
                        if (!error) {
                            //TODO BRN: The jobAccepted message needs to go back, but the messageDestination won't be registered by this point... figure out how to handle this...
                        } else {
                            //TODO BRN: Handle error
                        }
                    });
                } else {
                    //TODO BRN: How do we handle errors? Do we send these back out as messages on the error channel? Or should they be events? (events would have problems because they would broadcast to everyone)
                }
            }));



            callback();
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearSocketIoManagerConnection: function(event) {
            var socketConnection = event.getData().socket;
            var socketIoConnectionMessageChannel = new SocketIoConnectionMessageChannel(socketConnection);
            socketIoConnectionMessageChannel.setIncomingMessageChannel(this.incomingMessagePublisher);
            socketIoConnectionMessageChannel.initialize();
            this.outgoingMessageRouter.addMessageChannel(socketIoConnectionMessageChannel);
            this.socketConnectionToMessageChannelMap.put(socketConnection, socketIoConnectionMessageChannel);
            socketConnection.addEventListener(SocketIoConnection.EventTypes.DISCONNECT, this.hearSocketIoConnectionDisconnect, this);
        },

        hearSocketIoConnectionDisconnect: function(event) {
            var socketConnection = event.getTarget();
            var socketIoConnectionMessageChannel = this.socketConnectionToMessageChannelMap.get(socketConnection);
            socketIoConnectionMessageChannel.setIncomingMessageChannel(null);
            socketIoConnectionMessageChannel.deinitialize();
            this.outgoingMessageRouter.removeMessageChannel(socketIoConnectionMessageChannel);
            this.socketConnectionToMessageChannelMap.remove(socketConnection);
            socketConnection.removeAllListeners();
        }
    });

    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('minerbugserver.MinerbugApiController', MinerbugApiController);
});
