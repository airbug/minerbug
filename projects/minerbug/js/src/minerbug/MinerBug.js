//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MinerBug')

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context();
var express         = require('express');
var mu2Express      = require("mu2express");
var fs              = require('fs');
var http            = require('http');
var io              = require('socket.io');
var path            = require('path');


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

var MinerBug = Class.extend(Obj, {

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
         * @type {*}
         */
        this.app = null;

        /**
         * @private
         * @type {*}
         */
        this.server = null;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    start: function () {
        var _this = this;
        console.log("Starting MinerBug...");
        $series([
            $task(function(flow) {
                _this.configure(function(error) {
                    if (!error) {
                        console.log("MinerBug configured");
                        flow.complete();
                    } else {
                        console.log("MinerBug failed to configure");
                        flow.error(error);
                    }
                });
            }),
            $task(function(flow){
                _this.initialize(function(error){
                    if (!error){
                        console.log("Minerbug initialized");
                        flow.complete();
                    } else {
                        console.log("Minerbug failed to initialize");
                        flow.error(error);
                    }
                })
            })
        ]).execute(function(error){
            if (!error){
                console.log("MinerBug successfully started");
            } else {
                console.error(error);
                console.error(error.stack);
                process.exit(1);
            }
        });
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {function()} callback
     */
    initialize: function(callback){
        var _this           = this;
        this.server.listen(this.app.get('port'), function() {
            console.log("MinerBug listening on port", _this.app.get('port'));
        });
        callback();
    },

    /**
     * @param {function()} callback
     */
    configure: function(callback){
        var _this = this;
        this.app = express();
        this.server = http.createServer(this.app);

         /*
         this.enableSockets(server, function(){
            console.log("SonarBug sockets enabled");
         });
         */

        this.app.configure(function(){
            _this.app.engine('mustache', mu2Express.engine);
            _this.app.set('view engine', 'mustache');
            _this.app.set('views', path.resolve(__dirname, '../../resources/views'));

            _this.app.set('root', __dirname);
            _this.app.set('port', process.env.PORT || 8000);
            _this.app.use(express.logger('dev'));
            _this.app.use(express.bodyParser());
            _this.app.use(express.methodOverride());
            _this.app.use(express.static(path.resolve(__dirname, '../../static')));
            _this.app.use(_this.app.router);
        });

        this.app.configure('development', function(){
            _this.app.use(express.errorHandler());
        });


        // Routes
        //-------------------------------------------------------------------------------

        this.app.get('/', function(req, res){
            res.render('minerbug', {
                title: 'minerbug'
            });
        });

        this.app.all('/api/*', function(req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type");
            next();
        });

        // endpoint for new job submission
        // read in the list of job files, save them to disk
        this.app.post('/api/job/register', function(req, res) {

            // add the contents to a job manager which then will read in the file and break the job into tasks when ready

            var job = req.body;
            console.log("job", job);
            if (req.body.jobFiles) {

            }
            var foo = {
                "success": true
            };
            res.json(foo);
            //res.status(200);
            //res.end();
        });


        // Shut Down
        //-------------------------------------------------------------------------------

        // Graceful Shutdown
        process.on('SIGTERM', function () {
            console.log("Server Closing");
            _this.app.close();
        });

        this.app.on('close', function () {
            console.log("Server Closed");
        });

        callback();
    }
});

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('minerbug.MinerBug', MinerBug);
