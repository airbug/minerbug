//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('MinerbugServerConfiguration')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('bugcall.BugCallServer')
//@Require('bugcall.CallSever')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugioc.ArgTag')
//@Require('bugioc.ConfigurationTag')
//@Require('bugioc.IConfiguration')
//@Require('bugioc.ModuleTag')
//@Require('bugioc.PropertyTag')
//@Require('bugmeta.BugMeta')
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

var bugpack                     = require('bugpack').context();
var express                     = require('express');
var http                        = require('http');
var mu2express                  = require("mu2express");


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                       = bugpack.require('Class');
var Obj                         = bugpack.require('Obj');
var BugCallServer               = bugpack.require('bugcall.BugCallServer');
var CallServer                  = bugpack.require('bugcall.CallServer');
var BugFlow                     = bugpack.require('bugflow.BugFlow');
var BugFs                       = bugpack.require('bugfs.BugFs');
var ArgTag               = bugpack.require('bugioc.ArgTag');
var ConfigurationTag     = bugpack.require('bugioc.ConfigurationTag');
var IConfiguration              = bugpack.require('bugioc.IConfiguration');
var ModuleTag            = bugpack.require('bugioc.ModuleTag');
var PropertyTag          = bugpack.require('bugioc.PropertyTag');
var BugMeta                     = bugpack.require('bugmeta.BugMeta');
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

var arg                         = ArgTag.arg;
var bugmeta                     = BugMeta.context();
var configuration               = ConfigurationTag.configuration;
var module                      = ModuleTag.module;
var property                    = PropertyTag.property;
var $series                     = BugFlow.$series;
var $task                       = BugFlow.$task;


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
        // Private Properties
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
    // IConfiguration Implementation
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Throwable=)} callback
     */
    deinitializeConfiguration: function(callback) {
        callback();
    },

    /**
     * @param {function(Throwable=)} callback
     */
    initializeConfiguration: function(callback) {
        var _this = this;
        this._expressApp.configure(function() {
            _this._expressApp.engine('mustache', mu2express.engine);
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

        this._socketIoServerConfig.set('resource', '/home');
        //this._socketIoServer.set('resource', '/home');


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
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {BugCallServer} bugCallServer
     * @return {BugCallRouter}
     */
    bugCallRouter: function(bugCallServer) {
        return new BugCallRouter(bugCallServer);
    },

    /**
     * @param {CallServer} callServer
     * @return {BugCallServer}
     */
    bugCallServer: function(callServer) {
        return new BugCallServer(callServer);
    },

    /**
     * @param {SocketIoManager}
        * @return {CallServer}
     */
    callServer: function(socketIoManager) {
        return new CallServer(socketIoManager);
    },

    /**
     * @return {Express}
     */
    express: function() {
        return express;
    },

    /**
     * @param {Express} express
     * @return {ExpressApp}
     */
    expressApp: function(express) {
        this._expressApp = new ExpressApp(express);
        return this._expressApp;
    },

    /**
     * @param {http} http
     * @param {ExpressApp} expressApp
     * @return {ExpressServer}
     */
    expressServer: function(http, expressApp) {
        this._expressServer = new ExpressServer(http, expressApp);
        return this._expressServer;
    },

    /**
     * @return {*}
     */
    http: function() {
        return http;
    },

    /**
     * @param {
     * @return {MinerbugApiController}
     */
    minerbugApiController: function(bugCallRouter) {
        this._minerbugApiController = new MinerbugApiController();
        return this._minerbugApiController;
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
        this._socketIoServerConfig = new SocketIoServerConfig({});
        return this._socketIoServerConfig;
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
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.tag(MinerbugServerConfiguration).with(
    configuration("minerbugServerConfiguration").modules([
        module("express"),
        module("expressApp")
            .args([
                arg().ref("express")
            ]),
        module("expressServer")
            .args([
                arg().ref("http"),
                arg().ref("expressApp")
            ]),
        module("http"),
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
                arg().ref("socketIoServer")
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
                arg().ref("socketIoServer")
            ]),
        module("socketIoServer").
            args([
                arg().ref("socketIoServerConfig"),
                arg().ref("expressServer")
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
