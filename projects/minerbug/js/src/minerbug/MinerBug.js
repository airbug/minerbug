//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('minerbug')

//@Export('MinerBug')

//@Require('Class')
//@Require('Obj')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context();
var express         = require('express');
var fs              = require('fs');
var http            = require('http');
var io              = require('socket.io');
var path            = require('path');



//-------------------------------------------------------------------------------
// BugPack Modules
//-------------------------------------------------------------------------------

var Class   = bugpack.require('Class');
var Obj     = bugpack.require('Obj');
var BugFlow                 = bugpack.require('bugflow.BugFlow');

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
        
    },

    /**
     * @param {function()} callback
     */
    initialize: function(callback){
        var _this           = this;
        var callback        = callback || function(){};

        /*
        var configFile      = path.resolve(__dirname, '..', 'sonarbug.config.json');
        var configDefault   = {"currentCompletedId":100,"logRotationInterval":3600000};

        if(fs.existsSync(configFile)){
            _this.config = JSON.parse(BugFs.readFileSync(configFile, 'utf-8'));
            console.log('sonarbug.config.json read in');
        } else {
            console.log("sonarbug.config.json could not be found");
            console.log("writing sonarbug.config.json file...");
            _this.config = configDefault;
            fs.writeFile(configFile, JSON.stringify(configDefault), function(){
                console.log("sonarbug.config.json written with defaults:", configDefault);
            });
        }

        this.logEventManagers           = {};
        this.cronJobs                   = {};
        this.activeFoldersPath          = path.resolve(__dirname, '..', 'logs/', 'active/');
        this.completedFoldersPath       = path.resolve(__dirname, '..', 'logs/', 'completed/');
        this.logsPath                   = path.resolve(__dirname, '..', 'logs/');
        this.packagedFolderPath         = path.resolve(__dirname, '..', 'logs/', 'packaged/');
        this.toPackageFoldersPath       = path.resolve(__dirname, '..', 'logs/', 'toPackage/');
        */
        callback();
    },
    start: function () {
        var _this = this,
            app,
            server;
        console.log("Starting MinerBug...");

        $series([
            $task(function(flow){
                _this.initialize(function(error){
                    if(!error){
                        console.log("Minerbug initialized");
                    } else {
                        console.log("Minerbug failed to initialize");
                    }
                    flow.complete(error);
                })
            }),
            /*
            $task(function(flow){
                _this.initializeLogs(function(error){
                    if(!error){
                        console.log('Log folders initialized and updated');
                        flow.complete();
                    } else {
                        console.log(error);
                        flow.complete();
                    }
                });
            }),
            */
            $parallel([
                $task(function(flow){
                    // Create Server
                    app = _this.app = express();
                    server = _this.server = http.createServer(app);

                    _this.configure(app, express, function(){
                        console.log("SonarBug configured");
                    });

                    /*
                    _this.enableSockets(server, function(){
                        console.log("SonarBug sockets enabled");
                    });
                    */

                    server.listen(app.get('port'), function(){
                        console.log("SonarBug listening on port", app.get('port'));
                    });

                    flow.complete();
/*
                }),
                // Set interval for log rotations
                $task(function(flow){
                    var config = _this.config;
                    setInterval(function(){
                        _this.rotateLogs();
                    }, config.logRotationInterval);
                    flow.complete();
                }),
                $task(function(flow){
                    _this.initializePackageAndUploadCronJob(function(){
                        console.log('packageAndUploadCronJob initialized');
                        _this.startPackageAndUploadCronJob(function(){
                            flow.complete();
                        });
                    });
                    */
                })
            ])
        ]).execute(function(error){
                if(!error){
                    console.log("SonarBug successfully started");
                } else {
                    console.error(error);
                    console.error(error.stack);
                    process.exit(1);
                }
            });
    },

    /**
     * @param {express()} app
     * @param {express} express
     * @param {function()} callback
     */
    configure: function(app, express, callback){
        app.configure(function(){
            app.set('port', process.env.PORT || 8000);
            // app.use(express.favicon());
            app.use(express.logger('dev'));
            // app.use(express.bodyParser());
            // app.use(express.methodOverride());
            app.use(app.router);
            // app.use(express.static(path.join(__dirname, 'public')));
        });

        app.configure('development', function(){
            app.use(express.errorHandler());
        });

        callback();
    }
});

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('minerbug.MinerBug', MinerBug);
