//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MinerBugWorker')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('minerbug.TaskRunner')
//@Require('socketio.SocketIo')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Obj =               bugpack.require('Obj');
var BugFlow =           bugpack.require('bugflow.BugFlow');
var TaskRunner =        bugpack.require('minerbug.TaskRunner');
var SocketIo =          bugpack.require('socketio.SocketIo');


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

var MinerBugWorker = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(config) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {function()}
         */
        this.connectCallback = null;

        /**
         * @private
         * @type {boolean}
         */
        this.connectCallbackFired = false;

        /**
         * @private
         * @type {string}
         */
        this.hostname = config.hostname ? ;

        /**
         * @private
         * @type {boolean}
         */
        this.isConnecting = false;

        /**
         * @private
         * @type {boolean}
         */
        this.isConnected = false;

        /**
         * @private
         * @type {number}
         */
        this.port = NaN;

        /**
         * @private
         * @type {number}
         */
        this.retryAttempts = 0;

        /**
         * @private
         * @type {number}
         */
        this.retryLimit = 3;

        /**
         * @private
         * @type {*}
         */
        this.socket = null;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    start: function() {
        var _this = this;
        $series([
            $task(function(flow) {
                _this.configure(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this.initialize(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(function(error) {
                if (!error) {
                    //TEST
                    console.log("MinerBugApplication successfully started");
                } else {
                    console.log("MinerBugApplication encountered an error on startup");
                    console.error(error);
                }
            });
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Error=} error
     */
    completeConnect: function(error) {
        if (!this.initializeCallbackFired){
            this.initializeCallbackFired = true;
            if (this.initializeCallback) {
                this.initializeCallback(error);
            }
        }
    },

    /**
     * @private
     * @param callback
     */
    configure: function(callback) {
        callback();
    },

    /**
     * @private
     * @param {function()} callback
     */
    connect: function(callback) {
        var _this = this;
        if (!this.isConnected && !this.isConnecting) {
            this.isConnecting = true;
            console.log('MinerBugApplication is attempting to connect...');
            var options = {
                //     port: 80
                //   , secure: false
                //   , document: 'document' in global ? document : false,
                resource: 'socket-api' // defaults to 'socket.io'
                //   , transports: io.transports
                //   , 'connect timeout': 10000
                //   , 'try multiple transports': true
                //   , 'reconnect': true
                //   , 'reconnection delay': 500
                //   , 'reconnection limit': Infinity
                //   , 'reopen delay': 3000
                //   , 'max reconnection attempts': 10
                //   , 'sync disconnect on unload': false
                //   , 'auto connect': true
                //   , 'flash policy port': 10843
                //   , 'manualFlush': false
            };
            this.socket = SocketIo.connect(this.hostname, options);
            this.socket.on('connect', function() {
                _this.isConnected = true;
                _this.isConnecting = false;
                console.log('MinerBugApplication is connected');
            })
                .on('connect_error', function(error) {
                    _this.isConnecting = false;
                    console.log('MinerBugApplication connect_error', error);
                    _this.initializeComplete(error);
                })
                .on('connection_timeout', function() {
                    _this.isConnecting = false;
                    console.log('MinerBugApplication connection_timeout');
                })
                .on('connect_failed', function() {
                    _this.isConnecting = false;
                    console.log('MinerBugApplication connection_failed');
                })
                .on('reconnect', function(websocket) {
                    _this.isConnected = true;
                    console.log('MinerBugApplication reconnected');
                })
                .on('reconnect_error', function(error) {
                    console.log('MinerBugApplication reconnect_error', error);
                })
                .on('reconnect_failed', function() {
                    console.log('MinerBugApplication reconnect_failed');
                })
                .on('error', function(error) {
                    _this..isConnecting = false;
                    console.log('MinerBugApplication error:', error);
                    _this..retryConnect();
                })
                .on('disconnect', function() {
                    _this..isConnecting = false;
                    _this.isConnected = false;
                    console.log('MinerBugApplication disconnected');
                    // socket.io automatically attempts to reconnect on disconnect
                    // defaults to 10 attempts
                    // NOTE: SUNG may want to create a longer running interval here
                });

            this.socket.socket.connect();
        }
    },

    /**
     * @private
     * @param callback
     */
    initialize: function(callback) {
        var _this = this;
        $series([
            $task(function(flow) {
                _this.startConnect(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },

    /**
     * @private
     */
    retryConnect: function() {
        if (this.retryAttempts < this.retryLimit) {
            this.retryAttempts++;
            this.connect();
        } else {
            this.completeConfiguration(new Error("Maximum retries reached. Could not connect to minerbug server."));
        }
    },

    /**
     * @private
     * @param {Task} task
     */
    runTask: function(task, data, callback) {
        var taskRunner = new TaskRunner(task);
        taskRunner.runTask(data, callback);
    },

    /**
     * @private
     * @param {function(Error)} callback
     */
    startConnect: function(callback) {

    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbug.MinerBugWorker", MinerBugWorker);
