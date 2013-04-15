//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('WorkAssignment')

//@Require('Class')
//@Require('Obj')
//@Require('minerbug.Task')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var Obj =       bugpack.require('Obj');
var Task =      bugpack.require('minerbug.Task');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var WorkAssignment = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------
    /**
     * @param {{
     *      task: {
     *          source: string,
     *          type: string
     *      },
     *      data: {*}
     * }} workAssignmentObject
     */
    _constructor: function(workAssignmentObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Task}
         */
        this.task = null;

        /**
         * @private
         * @type {{*}}
         */
        this.data = null;

        if(workAssignmentObject){
            var task = workAssignmentObject.task;
            this.task = new Task(task);
            this.data = workAssignmentObject.data;
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Task}
     */
    getTask: function(){
        return this.task;
    },

    /**
     * @return {{*}}
     */
    getData: function(){
        return this.data;
    },

    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    toObject: function(){
        return {
            task: this.task.toObject,
            data: this.data
        }
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('minerbug.WorkAssignment', WorkAssignment);
