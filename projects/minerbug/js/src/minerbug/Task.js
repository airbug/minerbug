//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('Task')

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


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Task = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(taskObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.source = "";

        /**
         * @private
         * @type {string}
         */
        this.type = "";

        if (taskObject) {
            if (TypeUtil.isString(taskObject.type)) {
                this.type = taskObject.type;
            }
            if (TypeUtil.isString(taskObject.source)) {
                this.source = taskObject.source;
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
        return this.source;
    },

    /**
     * @return {string}
     */
    getType: function() {
        return this.type;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    execute: function(data) {
        var method = null;
        eval("method = " + this.source);
        var results = method(data);
        return results;
    },

    /**
     * @return {Object}
     */
    toObject: function() {
        return {
            source: this.source,
            type: this.type
        }
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.Task', Task);
