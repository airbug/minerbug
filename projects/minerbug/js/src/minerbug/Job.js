//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('Job')

//@Require('Class')
//@Require('Obj')
//@Require('TypeUtil')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var Obj =       bugpack.require('Obj');
var TypeUtil =  bugpack.require('TypeUtil');
var Queue =  bugpack.require('Queue');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Job = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(jobObject) {
        var _this = this;
        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.customer = "";

        /**
         * @private
         * @type {string}
         */
        this.name = "";

        /**
         * @private
         * @type {array}
         */
        this.sources = [];

        /**
         * @private
         * @type {array}
         */
        this.tasks = new Queue();

        if (jobObject) {
            if (TypeUtil.isString(jobObject.customer)) {
                this.customer = jobObject.customer;
            }
            if (TypeUtil.isString(jobObject.name)) {
                this.name = jobObject.name;
            }
            if (TypeUtil.isArray(jobObject.sources)) {
                this.sources = jobObject.sources;
            }
            if (TypeUtil.isArray(jobObject.tasks)) {
                jobObject.tasks.forEach(function(task){
                    _this.tasks.add(task);
                });
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getSource: function() {
        return this.customer;
    },

    /**
     * @return {string}
     */
    getType: function() {
        return this.name;
    },

    /**
     * @return {array}
     */
    getSources: function() {
        return this.sources;
    },

    /**
     * @return {array}
     */
    getTasks: function() {
        return this.tasks;
    },

    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject: function() {
        return {
            customer: this.customer,
            name: this.name,
            sources: this.sources,
            tasks: this.tasks
        }
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.Job', Job);
