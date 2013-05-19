//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorkerConfiguration')
//@Autoload

//@Require('CallManager')
//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugioc.ArgAnnotation')
//@Require('bugioc.ConfigurationAnnotation')
//@Require('bugioc.IConfiguration')
//@Require('bugioc.ModuleAnnotation')
//@Require('bugioc.PropertyAnnotation')
//@Require('minerbugworker.MinerbugWorker')
//@Require('minerbugworker.MinerbugWorkerApi')
//@Require('socketio:client.SocketIoClient')
//@Require('socketio:client.SocketIoConfig')
//@Require('socketio:client.SocketIoMessageTransport')
//@Require('socketio:factorybrowser.BrowserSocketIoFactory')


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
var Annotate                    = bugpack.require('annotate.Annotate');
var ArgAnnotation               = bugpack.require('bugioc.ArgAnnotation');
var ConfigurationAnnotation     = bugpack.require('bugioc.ConfigurationAnnotation');
var IConfiguration              = bugpack.require('bugioc.IConfiguration');
var ModuleAnnotation            = bugpack.require('bugioc.ModuleAnnotation');
var PropertyAnnotation          = bugpack.require('bugioc.PropertyAnnotation');
var MinerbugWorker              = bugpack.require('minerbugworker.MinerbugWorker');
var MinerbugWorkerApi           = bugpack.require('minerbugworker.MinerbugWorkerApi');
var SocketIoClient              = bugpack.require('socketio:client.SocketIoClient');
var SocketIoConfig              = bugpack.require('socketio:client.SocketIoConfig');
var SocketIoMessageTransport    = bugpack.require('socketio:client.SocketIoMessageTransport');
var BrowserSocketIoFactory      = bugpack.require('socketio:factorybrowser.BrowserSocketIoFactory');


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

var MinerbugWorkerConfiguration = Class.extend(Obj, {

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
         * @type {MinerbugWorker}
         */
        this._minerbugWorker = null;
    },


    //-------------------------------------------------------------------------------
    // Configuration Lifecycle
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error)}
        */
    initializeConfiguration: function(callback) {
        this._minerbugWorker.start(callback);
    },


    //-------------------------------------------------------------------------------
    // Configuration Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {BrowserSocketIoFactory}
     */
    browserSocketIoFactory: function() {
        return new BrowserSocketIoFactory();
    },

    /**
     * @return {CallManager}
     */
    callManager: function() {
        return new CallManager();
    },

    /**
     * @return {AirbugJar}
     */
    minerbugWorker: function() {
        this._minerbugWorker = new MinerbugWorker();
        return this._minerbugWorker;
    },

    /**
     * @param {CallManager} callManager
     * @param {SocketIoMessageTransport} socketIoMessageTransport
     * @return {MinerbugWorkerApi}
     */
    minerbugWorkerApi: function(callManager, socketIoMessageTransport) {
        return new MinerbugWorkerApi(callManager, socketIoMessageTransport);
    },

    /**
     * @param {ISocketFactory} socketFactory
     * @param {SocketIoConfig} config
     * @return {SocketIoClient}
     */
    socketIoClient: function(socketFactory, config) {
        return new SocketIoClient(socketFactory, config);
    },

    /**
     * @return {SocketIoConfig}
     */
    socketIoConfig: function() {
        return new SocketIoConfig({
            host: "http://localhost/minerbug-worker",
            port: 8000
        })
    },

    /**
     * @param {SocketIoClient} socketIoClient
     * @return {SocketIoMessageTransport}
     */
    socketIoMessageTransport: function(socketIoClient) {
        return new SocketIoMessageTransport(socketIoClient);
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(MinerbugWorkerConfiguration, IConfiguration);


//-------------------------------------------------------------------------------
// Annotate
//-------------------------------------------------------------------------------

annotate(MinerbugWorkerConfiguration).with(
    configuration().modules([
        module("browserSocketIoFactory"),
        module("callManager"),
        module("minerbugWorker")
            .properties([
                property("socketIoClient").ref("socketIoClient")
            ]),
        module("minerbugWorkerApi")
            .args([
                arg("callManager").ref("callManager"),
                arg("socketIoMessageTransport").ref("socketIoMessageTransport")
            ]),
        module("socketIoClient")
            .args([
                arg("socketFactory").ref("browserSocketIoFactory"),
                arg("config").ref("socketIoConfig")
            ]),
        module("socketIoConfig"),
        module("SocketIoMessageTransport")
            .args([
                arg("socketIoClient").ref("socketIoClient")
            ])
    ])
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugworker.MinerbugWorkerConfiguration", MinerbugWorkerConfiguration);
