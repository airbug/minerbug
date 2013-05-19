//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('WorkAssignment')

//@Require('Class')
//@Require('Obj')
//@Require('minerbug.MapTask')
//@Require('minerbug.ReduceTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var Obj         = bugpack.require('Obj');
var MapTask     = bugpack.require('minerbug.MapTask');
var ReduceTask  = bugpack.require('minerbug.ReduceTask');


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
         * @type {{*}}
         */
        this.data = null;

        /**
         * @private
         * @type {Task}
         */
        this.task = null;

        if (workAssignmentObject) {
            var task = workAssignmentObject.task;
            if (task.type === "map") {
                this.task = new MapTask(task);
            } else if (task.type === "reduce") {
                this.task = new ReduceTask(task);
            } else {
                throw new Error("Unknown task type '" + task.type + "'");
            }
            this.data = workAssignmentObject.data;
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    /**
     * @return {{*}}
     */
    getData: function(){
        return this.data;
    },

    /**
     * @return {Task}
     */
    getTask: function(){
        return this.task;
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
