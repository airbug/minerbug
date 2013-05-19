//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('MinerbugServerConfiguration')
//@Autoload

//@Require('Class')
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
//@Require('minerbugserver.MinerbugWorkerController')
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
var MinerbugWorkerController    = bugpack.require('minerbugserver.MinerbugWorkerController');
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
         * @type {MinerbugWorkerController}
         */
        this._minerbugWorkerController = null;
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
        return new ExpressServer(expressApp);
    },

    /**
     * @return {MinerbugApiController}
     */
    minerbugApiController: function() {
        this._minerbugApiController = new MinerbugApiController();
        return this._minerbugApiController;
    },

    /**
     * @return {MinerbugWorkerController}
     */
    minerbugServerController: function() {
        this._minerbugWorkerController = new MinerbugWorkerController();
        return this._minerbugWorkerController;
    },

    /**
     * @param {SocketIoServer} socketIoServer
     * @return {SocketIoManager}
     */
    minerbugApiSocketManager: function(socketIoServer) {
        this._minerbugApiController =
        return new SocketIoManager(socketIoServer, "/minerbug-api");
    },

    /**
     * @param {SocketIoServer} socketIoServer
     * @return {SocketIoManager}
     */
    minerbugWorkerSocketManager: function(socketIoServer) {
        return new SocketIoManager(socketIoServer, "/minerbug-worker");
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
        module("minerbugApiSocketManager")
            .args([
                arg("socketIoServer").ref("socketIoServer")
            ]),
        module("minerbugWorkerSocketManager")
            .args([
                arg("socketIoServer").ref("socketIoServer")
            ]),
        module("minerbugServerController")
            .properties([
                property("expressApp").ref("expressApp"),
                property("expressServer").ref("expressServer")
            ]),
        module("socketIoServer").
            args([
                arg("config").ref("socketIoServerConfig"),
                arg("expressServer").ref("expressServer")
            ]),
        module("socketIoServerConfig")
    ])
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugserver.MinerbugServerConfiguration", MinerbugServerConfiguration);
