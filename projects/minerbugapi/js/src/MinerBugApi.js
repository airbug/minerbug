//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('minerbugapi.MinerbugApi')

//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('Flows')
//@Require('bugcall.CallApi')
//@Require('bugcall.CallClient')
//@Require('minerbugapi.JobBuilder')
//@Require('socketio.SocketIoClient')
//@Require('socketio.SocketIoConfig')
//@Require('socketio.ServerSocketIoFactory')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Obj                     = bugpack.require('Obj');
    var Proxy                   = bugpack.require('Proxy');
    var Flows                 = bugpack.require('Flows');
    var CallApi                 = bugpack.require('bugcall.CallApi');
    var CallClient              = bugpack.require('bugcall.CallClient');
    var JobBuilder              = bugpack.require('minerbugapi.JobBuilder');
    var SocketIoClient          = bugpack.require('socketio.SocketIoClient');
    var SocketIoConfig          = bugpack.require('socketio.SocketIoConfig');
    var ServerSocketIoFactory   = bugpack.require('socketio.ServerSocketIoFactory');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var MinerbugApi = Class.extend(Obj, {

        _name: "minerbugapi.MinerbugApi",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {CallApi} callApi
         */
        _constructor: function(callApi) {

            this._super();

            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {CallApi}
             */
            this.callApi = callApi;

            this.jobWatcherManager = new JobWatcherManager();
        },


        //-------------------------------------------------------------------------------
        // Methods
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
         * @param {function(Error, JobWatcher)} callback
         */
        registerAndWatchJob: function(job, callback) {
            var _this = this;
            var jobUuid = null;
            var jobWatcher = null;
            $series([
                $task(function(flow) {
                     _this.registerJob(job, function(error, _jobUuid) {
                         jobUuid = _jobUuid;
                         flow.complete(error);
                     });
                }),
                $task(function(flow) {
                    _this.watchJob(jobUuid, function(error, _jobWatcher) {
                        jobWatcher = _jobWatcher;
                        flow.complete(error);
                    });
                })
            ]).execute(function(error) {
                callback()
            });
        },

        /**
         * @param {Job} job
         * @param {function(Error, string)} callback
         */
        registerJob: function(job, callback) {
            var callRequest = this.callApi.request(MinerbugApi.RequestTypes.REGISTER_JOB,  {
                job: job.toObject()
            });
            this.callApi.sendOrQueueRequest(callRequest, function(exception, callResponse) {
                if (!exception) {
                    if (callResponse.getType() === "jobRegistered") {
                        callback(null, callResponse.getData().jobUuid);
                    } else {
                        throw new Error("Unhandled response type");
                    }
                } else {
                    callback(error);
                }
            });
        },

        /**
         * @param {string} jobUuid
         * @param {function(Error, JobWatcher)} callback
         */
        watchJob: function(jobUuid, callback) {
            var callRequest = this.callApi.request(MinerbugApi.RequestTypes.WATCH_JOB,  {
                jobUuid: jobUuid
            });
            this.callApi.sendOrQueueRequest(callRequest, function(exception, callResponse) {
                if (!exception) {
                    if (callResponse.getType() === "jobWatched") {

                        callback(null, response.getData().jobUuid);
                    } else {
                        throw new Error("Unhandled response type");
                    }
                } else {
                    callback(error);
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {MinerbugApi}
     */
    MinerbugApi.instance = null;

    /**
     * @enum {string}
     */
    MinerbugApi.RequestTypes = {
        REGISTER_JOB: "registerJob",
        WATCH_JOB: "watchJob"
    };


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    MinerbugApi.getInstance = function() {
        if (!MinerbugApi.instance) {
            var serverSocketIoFactory = new ServerSocketIoFactory();
            var socketIoConfig = new SocketIoConfig({
                hostname: "http://localhost.com/minerbug-api",
                port: 8000
            });
            var socketIoClient = new SocketIoClient(serverSocketIoFactory, socketIoConfig);
            var callClient = new CallClient(socketIoClient);
            var callApi = new CallApi(callClient);
            MinerbugApi.instance = new MinerbugApi(callApi);
        }
        return MinerbugApi.instance;
    };

    Proxy.proxy(MinerbugApi, Proxy.method(MinerbugApi.getInstance), [
        "mine",
        "registerAndWatchJob",
        "registerJob",
        "watchJob"
    ]);


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('minerbugapi.MinerbugApi', MinerbugApi);
});
