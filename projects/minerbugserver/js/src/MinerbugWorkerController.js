//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('minerbugserver.MinerbugWorkerController')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack Modules
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var MinerbugWorkerController = Class.extend(Obj, {

        _name: "minerbugserver.MinerbugWorkerController",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function(){

            this._super();

            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {ExpressApp}
             */
            this.expressApp = null;

            /**
             * @private
             * @type {MessagePublisher}
             */
            this.messagePublisher = null;

            /**
             * @private
             * @type {SocketIoManager}
             */
            this.socketManager = null;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function()} callback
         */
        configure: function(callback){
            var _this = this;


            // Routes
            //-------------------------------------------------------------------------------

            this.expressApp.get('/', function(req, res) {
                res.render('minerbug', {
                    title: 'minerbug'
                });
            });

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

    bugpack.export('minerbugserver.MinerbugWorkerController', MinerbugWorkerController);
});
