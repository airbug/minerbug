//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('WorkUnit')

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
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.source = null;

        /**
         * @private
         * @type {string}
         */
        this.type = "";

        if (taskObject) {
            if (TypeUtil.isString(taskObject.source)) {
                this.source = taskObject.source;
            } else if (TypeUtil.isFunction(taskObject.source)) {
                this.source = taskObject.source.toSource();
            }
            if (TypeUtil.isString(taskObject.type)) {
                this.type = taskObject.type;
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getMethod: function() {
        return this.method;
    },

    /**
     * @return {string}
     */
    getType: function() {
        return this.type;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    execute: function(data) {
        var method = null;
        eval("method = " + this.method);
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
