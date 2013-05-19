//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('MinerbugServerConfiguration')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugfs.BugFs')
//@Require('bugioc.ArgAnnotation')
//@Require('bugioc.ConfigurationAnnotation')
//@Require('bugioc.IConfiguration')
//@Require('bugioc.ModuleAnnotation')
//@Require('bugioc.PropertyAnnotation')
//@Require('express.ExpressApp')
//@Require('express.ExpressServer')
//@Require('minerbugserver.MinerbugWorkerController')
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
var BugFs                       = bugpack.require('bugfs.BugFs');
var ArgAnnotation               = bugpack.require('bugioc.ArgAnnotation');
var ConfigurationAnnotation     = bugpack.require('bugioc.ConfigurationAnnotation');
var IConfiguration              = bugpack.require('bugioc.IConfiguration');
var ModuleAnnotation            = bugpack.require('bugioc.ModuleAnnotation');
var PropertyAnnotation          = bugpack.require('bugioc.PropertyAnnotation');
var ExpressApp                  = bugpack.require('express.ExpressApp');
var ExpressServer               = bugpack.require('express.ExpressServer');
var MinerbugWorkerController    = bugpack.require('minerbugserver.MinerbugWorkerController');
var SocketIoServer              = bugpack.require('socketio:server.SocketIoServer');
var SocketIoServerConfig        = bugpack.require('socketio:server.SocketIoServerConfig');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate =      Annotate.annotate;
var arg =           ArgAnnotation.arg;
var configuration = ConfigurationAnnotation.configuration;
var module =        ModuleAnnotation.module;
var property =      PropertyAnnotation.property;


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

        this._minerbugWorkerController.start(callback);
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
     * @return {MinerbugWorkerController}
     */
    minerbugServerController: function() {
        this._minerbugWorkerController = new MinerbugWorkerController();
        return this._minerbugWorkerController;
    },

    /**
     * @param {SocketIoServerConfig} config
     * @param {ExpressServer} expressServer
     * @return {SocketIoServer}
     */
    socketIoServer: function(config, expressServer) {
        return new SocketIoServer(config, expressServer);
    },

    /**
     * @return {SocketIoServerConfig}
     */
    socketIoServerConfig: function() {
        return new SocketIoServerConfig({
            transports: [
                'websocket',
                'flashsocket',
                'htmlfile',
                'xhr-polling',
                'jsonp-polling'
            ]
        })
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
        module("minerbugServerController")
            .properties([
                property("expressApp").ref("expressApp"),
                property("expressServer").ref("expressServer")
            ]),
        module("socketIoServer").
            args([
                arg("config").ref("socketIoServerConfig")
            ]),
        module("socketIoServerConfig")
    ])
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugserver.MinerbugServerConfiguration", MinerbugServerConfiguration);
