//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('MinerbugServerConfiguration')
//@Autoload

//@Require('Class')
//@Require('MessagePublisher')
//@Require('MessageRouter')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugioc.ArgAnnotation')
//@Require('bugioc.ConfigurationAnnotation')
//@Require('bugioc.IConfiguration')
//@Require('bugioc.ModuleAnnotation')
//@Require('bugioc.PropertyAnnotation')
//@Require('express.ExpressApp')
//@Require('express.ExpressServer')
//@Require('minerbugserver.MinerbugApiController')
//@Require('minerbugserver.MinerbugWorkerController')
//@Require('minerbugserver.JobManager')
//@Require('minerbugserver.JobProcessor')
//@Require('socketio:server.SocketIoManager');
//@Require('socketio:server.SocketIoServer')
//@Require('socketio:server.SocketIoServerConfig')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context();
var express     = require('express');
var mu2Express  = require("mu2express");


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                       = bugpack.require('Class');
var MessagePublisher            = bugpack.require('MessagePublisher');
var MessageRouter               = bugpack.require('MessageRouter');
var Obj                         = bugpack.require('Obj');
var Annotate                    = bugpack.require('annotate.Annotate');
var BugFlow                     = bugpack.require('bugflow.BugFlow');
var BugFs                       = bugpack.require('bugfs.BugFs');
var ArgAnnotation               = bugpack.require('bugioc.ArgAnnotation');
var ConfigurationAnnotation     = bugpack.require('bugioc.ConfigurationAnnotation');
var IConfiguration              = bugpack.require('bugioc.IConfiguration');
var ModuleAnnotation            = bugpack.require('bugioc.ModuleAnnotation');
var PropertyAnnotation          = bugpack.require('bugioc.PropertyAnnotation');
var ExpressApp                  = bugpack.require('express.ExpressApp');
var ExpressServer               = bugpack.require('express.ExpressServer');
var MinerbugApiController       = bugpack.require('minerbugserver.MinerbugApiController');
var MinerbugWorkerController    = bugpack.require('minerbugserver.MinerbugWorkerController');
var JobManager                  = bugpack.require('minerbugserver.JobManager');
var JobProcessor                = bugpack.require('minerbugserver.JobProcessor');
var SocketIoManager             = bugpack.require('socketio:server.SocketIoManager');
var SocketIoServer              = bugpack.require('socketio:server.SocketIoServer');
var SocketIoServerConfig        = bugpack.require('socketio:server.SocketIoServerConfig');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate        = Annotate.annotate;
var arg             = ArgAnnotation.arg;
var configuration   = ConfigurationAnnotation.configuration;
var module          = ModuleAnnotation.module;
var property        = PropertyAnnotation.property;
var $series         = BugFlow.$series;
var $task           = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugServerConfiguration = Class.extend(Obj, {

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
         * @type {ExpressApp}
         * @private
         */
        this._expressApp = null;

        /**
         * @private
         * @type {ExpressServer}
         */
        this._expressServer = null;

        /**
         * @private
         * @type {MinerbugApiController}
         */
        this._minerbugApiController = null;

        /**
         * @private
         * @type {SocketIoManager}
         * @private
         */
        this._minerbugApiSocketManager = null;

        /**
         * @private
         * @type {MinerbugWorkerController}
         */
        this._minerbugWorkerController = null;
        
       /**
         * @private
         * @type {SocketIoManager}
         * @private
         */
        this._minerbugWorkerSocketManager = null;
        
        /**
         * @private
         * @type {JobManager}
         */
        this._jobManager = null;

        /**
         * @private
         * @type {JobProcessor}
         */
        this._jobProcessor = null;
    },


    //-------------------------------------------------------------------------------
    // Configuration Lifecycle
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error)}
        */
    initializeConfiguration: function(callback) {
        var _this = this;
        this._expressApp.configure(function() {
            _this._expressApp.engine('mustache', mu2Express.engine);
            _this._expressApp.set('view engine', 'mustache');
            _this._expressApp.set('views', BugFs.resolvePaths([__dirname, '../../resources/views']));

            _this._expressApp.set('root', __dirname);
            _this._expressApp.set('port', process.env.PORT || 8000);
            _this._expressApp.use(express.logger('dev'));
            _this._expressApp.use(express.bodyParser());
            _this._expressApp.use(express.methodOverride());
            _this._expressApp.use(express.static(BugFs.resolvePaths([__dirname, '../../static'])));
            _this._expressApp.use(_this._expressApp.router);
        });

        this._expressApp.configure('development', function() {
            _this._expressApp.use(express.errorHandler());
        });




        $series([
            $task(function(flow) {
                _this._minerbugApiController.configure(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this._minerbugWorkerController.configure(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this._minerbugApiSocketManager.initialize(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this._minerbugWorkerSocketManager.initialize(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this._socketIoServer.start(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this._expressServer.start(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },


    //-------------------------------------------------------------------------------
    // Configuration Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {ExpressApp}
     */
    expressApp: function() {
        this._expressApp = new ExpressApp();
        return this._expressApp;
    },

    /**
     * @param {ExpressApp} expressApp
     * @return {ExpressServer}
     */
    expressServer: function(expressApp) {
        this._expressServer = new ExpressServer(expressApp);
        return this._expressServer;
    },

    /**
     * @return {MinerbugApiController}
     */
    minerbugApiController: function() {
        this._minerbugApiController = new MinerbugApiController();
        return this._minerbugApiController;
    },

    /**
     * @return {MessagePublisher}
     */
    minerbugApiIncomingMessagePublisher: function() {
        return new MessagePublisher();
    },

    /**
     * @return {MessageRouter}
     */
    minerbugApiOutgoingMessageRouter: function() {
        return new MessageRouter();
    },

    /**
     * @param {SocketIoServer} socketIoServer
     * @return {SocketIoManager}
     */
    minerbugApiSocketManager: function(socketIoServer) {
        this._minerbugApiController = new SocketIoManager(socketIoServer, "/minerbug-api");
        return this._minerbugApiController;
    },

    /**
     * @return {MinerbugWorkerController}
     */
    minerbugWorkerController: function() {
        this._minerbugWorkerController = new MinerbugWorkerController();
        return this._minerbugWorkerController;
    },

    /**
     * @return {MessagePublisher}
     */
    minerbugWorkerIncomingMessagePublisher: function() {
        return new MessagePublisher();
    },

    /**
     * @return {MessageRouter}
     */
    minerbugWorkerOutgoingMessageRouter: function() {
        return new MessageRouter();
    },

    /**
     * @param {SocketIoServer} socketIoServer
     * @return {SocketIoManager}
     */
    minerbugWorkerSocketManager: function(socketIoServer) {
        this._minerbugWorkerSocketManager = new SocketIoManager(socketIoServer, "/minerbug-worker");
        return this._minerbugWorkerSocketManager;
    },

    /**
     * @param {SocketIoServerConfig} config
     * @param {ExpressServer} expressServer
     * @return {SocketIoServer}
     */
    socketIoServer: function(config, expressServer) {
        this._socketIoServer = new SocketIoServer(config, expressServer);
        return this._socketIoServer;
    },

    /**
     * @return {SocketIoServerConfig}
     */
    socketIoServerConfig: function() {
        return new SocketIoServerConfig({});
    },

    /**
     * @return {JobManager}
     */
    jobManager: function() {
        this._jobManager = new JobManager();
        return this._jobManager;
    },

    /**
     * @return {JobProcessor}
     */
    jobProcessor: function() {
        this._jobProcessor = new JobProcessor();
        return this._jobProcessor;
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(MinerbugServerConfiguration, IConfiguration);


//-------------------------------------------------------------------------------
// Annotate
//-------------------------------------------------------------------------------

annotate(MinerbugServerConfiguration).with(
    configuration().modules([
        module("expressApp"),
        module("expressServer")
            .args([
                arg("expressApp").ref("expressApp")
            ]),
        module("minerbugApiController")
            .properties([
                property("expressApp").ref("expressApp"),
                property("incomingMessagePublisher").ref("minerbugApiIncomingMessagePublisher"),
                property("outgoingMessageRouter").ref("minerbugApiOutgoingMessageRouter"),
                property("socketManager").ref("minerbugApiSocketManager")
            ]),
        module("minerbugApiIncomingMessagePublisher"),
        module("minerbugApiOutgoingMessageRouter"),
        module("minerbugApiSocketManager")
            .args([
                arg("socketIoServer").ref("socketIoServer")
            ]),
        module("minerbugWorkerController")
            .properties([
                property("expressApp").ref("expressApp"),
                property("incomingMessagePublisher").ref("minerbugWorkerIncomingMessagePublisher"),
                property("outgoingMessageRouter").ref("minerbugWorkerOutgoingMessageRouter"),
                property("socketManager").ref("minerbugWorkerSocketManager")
            ]),
        module("minerbugWorkerIncomingMessagePublisher"),
        module("minerbugWorkerOutgoingMessageRouter"),
        module("minerbugWorkerSocketManager")
            .args([
                arg("socketIoServer").ref("socketIoServer")
            ]),
        module("socketIoServer").
            args([
                arg("config").ref("socketIoServerConfig"),
                arg("expressServer").ref("expressServer")
            ]),
        module("socketIoServerConfig"),
        module("jobManager"),
        module("jobProcessor")
            .properties([
                property("jobManager").ref("jobManager")
            ])
    ])
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugserver.MinerbugServerConfiguration", MinerbugServerConfiguration);
