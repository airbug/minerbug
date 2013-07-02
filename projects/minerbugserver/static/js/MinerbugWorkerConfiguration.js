//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorkerConfiguration')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugcall.BugCallClient')
//@Require('bugcall.CallClient')
//@Require('bugcall.CallManager')
//@Require('bugioc.ArgAnnotation')
//@Require('bugioc.ConfigurationAnnotation')
//@Require('bugioc.IConfiguration')
//@Require('bugioc.ModuleAnnotation')
//@Require('bugioc.PropertyAnnotation')
//@Require('minerbugworker.MinerbugWorker')
//@Require('minerbugworker.MinerbugWorkerApi')
//@Require('socketio:client.SocketIoClient')
//@Require('socketio:client.SocketIoConfig')
//@Require('socketio:factorybrowser.BrowserSocketIoFactory')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                       = bugpack.require('Class');
var Obj                         = bugpack.require('Obj');
var Annotate                    = bugpack.require('annotate.Annotate');
var BugCallClient               = bugpack.require('bugcall.BugCallClient');
var CallClient                  = bugpack.require('bugcall.CallClient');
var CallManager                 = bugpack.require('bugcall.CallManager');
var ArgAnnotation               = bugpack.require('bugioc.ArgAnnotation');
var ConfigurationAnnotation     = bugpack.require('bugioc.ConfigurationAnnotation');
var IConfiguration              = bugpack.require('bugioc.IConfiguration');
var ModuleAnnotation            = bugpack.require('bugioc.ModuleAnnotation');
var PropertyAnnotation          = bugpack.require('bugioc.PropertyAnnotation');
var MinerbugWorker              = bugpack.require('minerbugworker.MinerbugWorker');
var MinerbugWorkerApi           = bugpack.require('minerbugworker.MinerbugWorkerApi');
var SocketIoClient              = bugpack.require('socketio:client.SocketIoClient');
var SocketIoConfig              = bugpack.require('socketio:client.SocketIoConfig');
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
         * @type {BugCallClient}
         */
        this._bugCallClient = null;

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
     * @param {CallClient} callClient
     * @return {CallApi}
     */
    bugCallClient: function(callClient) {
        this._bugCallClient = new BugCallClient(callClient);
        return this._bugCallClient;
    },

    /**
     * @param {SocketIoClient} socketIoClient
     * @return {CallApi}
     */
    callClient: function(socketIoClient) {
        return new CallClient(socketIoClient);
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
     * @param {CallApi} callApi
     * @return {MinerbugWorkerApi}
     */
    minerbugWorkerApi: function(callApi) {
        return new MinerbugWorkerApi(callApi);
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
        module("bugCallClient")
            .args([
                arg("callClient").ref("callClient")
            ]),
        module("callClient")
            .args([
                arg("socketIoClient").ref("socketIoClient")
            ]),
        module("minerbugWorker")
            .args([
                arg("minerbugWorkerApi").ref("minerbugWorkerApi")
            ]),
        module("minerbugWorkerApi")
            .args([
                arg("callApi").ref("callApi")
            ]),
        module("socketIoClient")
            .args([
                arg("socketFactory").ref("browserSocketIoFactory"),
                arg("config").ref("socketIoConfig")
            ]),
        module("socketIoConfig")
    ])
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugworker.MinerbugWorkerConfiguration", MinerbugWorkerConfiguration);
