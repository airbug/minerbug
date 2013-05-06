//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MinerBugApplication')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('minerbug.MinerBugWorker')


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
var MinerBugWorker =    bugpack.require('minerbug.MinerBugWorker');


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

var MinerBugApplication = Class.extend(Obj, {

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
         * @type {MinerBugWorker}
         */
        this.currentWorker = null;
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
     * @param callback
     */
    configure: function(callback) {
        //TODO BRN: Process some config here that's supplied by the server
        callback();
    },

    /**
     * @private
     * @param callback
     */
    initialize: function(callback) {
        var _this = this;
        $series([
            $task(function(flow) {
                _this.startWorker(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },

    /**
     * @private
     * @param {function(Error)} callback
     */
    startWorker: function(callback) {

        //TODO BRN: These config values should be pulled from a config object instead of hard coded.

        this.currentWorker = new MinerBugWorker({
            hostname: "localhost",
            port: 8000
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbug.MinerBugApplication", MinerBugApplication);
