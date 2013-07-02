//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbugworker')

//@Export('MinerbugWorkerApplication')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('bugioc.ApplicationContext')
//@Require('bugioc.ConfigurationScan')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var Obj                 = bugpack.require('Obj');
var ApplicationContext  = bugpack.require('bugioc.ApplicationContext');
var ConfigurationScan   = bugpack.require('bugioc.ConfigurationScan');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var MinerbugWorkerApplication = Class.extend(Obj, {

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
         * @type {ApplicationContext}
         */
        this.applicationContext = new ApplicationContext();

        /**
         * @private
         * @type {ConfigurationScan}
         */
        this.configurationScan = new ConfigurationScan(this.applicationContext);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error)}
        */
    start: function(callback) {
        this.configurationScan.scan();
        this.applicationContext.process();
        this.applicationContext.initialize(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("minerbugworker.MinerbugWorkerApplication", MinerbugWorkerApplication);
