//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugserver')

//@Export('MinerbugApiController')

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack Modules
//-------------------------------------------------------------------------------

var Class   = bugpack.require('Class');
var Obj     = bugpack.require('Obj');
var BugFlow = bugpack.require('bugflow.BugFlow');


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

var MinerbugApiController = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(){

        this._super();

        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {ExpressApp}
         */
        this.expressApp = null;

        /**
         * @private
         * @type {SocketIoManager}
         */
        this.minerbugApiSocketManager = null;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function()} callback
     */
    configure: function(callback){
        var _this = this;


        // Routes
        //-------------------------------------------------------------------------------


        //TODO BRN: Add routes for socket server

        /*
        socket.on('message', function(data){

        });

        socket.on('disconnect', function(){

        });

        socket.on('error', function(reason){

        });*/

        callback();
    }
});

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('minerbugserver.MinerbugApiController', MinerbugApiController);
