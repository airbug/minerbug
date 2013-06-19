//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug        = require('buildbug');
var fs              = require('fs');
var path            = require('path');
var zlib            = require('zlib');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject    = buildbug.buildProject;
var buildProperties = buildbug.buildProperties;
var buildTarget     = buildbug.buildTarget;
var buildTask       = buildbug.buildTask;
var enableModule    = buildbug.enableModule;
var parallel        = buildbug.parallel;
var series          = buildbug.series;
var targetTask      = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws             = enableModule("aws");
var bugpack         = enableModule('bugpack');
var bugunit         = enableModule('bugunit');
var core            = enableModule('core');
var nodejs          = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    minerbugserver: {
        packageJson: {
            name: "minerbugserver",
            version: "0.0.1",
            //main: "./lib/minerbug-module.js",
            dependencies: {
                "bugpack": "https://s3.amazonaws.com/airbug/bugpack-0.0.5.tgz",
                "express": "3.1.x",
                "fstream": '0.1.x',
                "mu2express": "0.0.x",
                "socket.io": "0.9.x"
            },
            scripts: {
                "start": "node ./scripts/minerbug-server-application-start.js"
            }
        },
        sourcePaths: [
            "./projects/minerbug/js/src",
            "./projects/minerbugserver/js/src",
            "../bugjs/projects/annotate/js/src",
            "../bugjs/projects/bugcall/js/src",
            "../bugjs/projects/bugflow/js/src",
            "../bugjs/projects/bugfs/js/src",
            "../bugjs/projects/bugioc/js/src",
            "../bugjs/projects/bugjs/js/src",
            "../bugjs/projects/bugtrace/js/src",
            "../bugjs/projects/express/js/src",
            "../bugjs/projects/socketio/bugjars/factoryserver/js/src",
            "../bugjs/projects/socketio/bugjars/server/js/src",
            "../bugjs/projects/socketio/bugjars/socket/js/src",
            "../bugunit/projects/bugdouble/js/src",
            "../bugunit/projects/bugunit/js/src"
        ],
        scriptPaths: [
            "./projects/minerbugserver/js/scripts",
            "../bugunit/projects/bugunit/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugflow/js/test",
            "../bugjs/projects/bugioc/js/test",
            "../bugjs/projects/bugjs/js/test",
            "../bugjs/projects/bugtrace/js/test"
        ],
        resourcePaths: [
            "./projects/minerbugserver/resources"
        ],
        staticPaths: [
            "./projects/minerbugserver/static",
            "../bugjs/external/bootstrap/js/src",
            "../bugjs/external/bootstrap/static",
            "../bugjs/external/jquery/js/src",
            "../bugjs/external/mustache/js/src",
            "../bugjs/external/socket-io/js/src",
            "../bugjs/projects/bugcall/js/src",
            "../bugjs/projects/bugjs/js/src",
            "../bugpack/projects/bugpack-client/js/src"
        ]
    },
    minerbugapi: {
        packageJson: {
            name: "minerbugapi",
            version: "0.0.1",
            main: "./scripts/minerbugapi-module.js",
            dependencies: {
                "bugpack": "https://s3.amazonaws.com/airbug/bugpack-0.0.5.tgz",
                "socket.io-client": "0.9.x"
            }
        },
        sourcePaths: [
            "./projects/minerbug/js/src",
            "./projects/minerbugapi/js/src",
            "../bugjs/projects/annotate/js/src",
            '../bugjs/projects/bugflow/js/src',
            "../bugjs/projects/bugjs/js/src",
            "../bugjs/projects/bugtrace/js/src",
            "../bugunit/projects/bugdouble/js/src",
            "../bugunit/projects/bugunit/js/src"
        ],
        scriptPaths: [
            "./projects/minerbugapi/js/scripts",
            "../bugunit/projects/bugunit/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugjs/js/test"
        ]
    },
    testfile: {
        testFile: path.resolve(__dirname + '/projects/minerbug/tmp/testfile.txt')
    }
});


//-------------------------------------------------------------------------------
// Declare Local Tasks
//-------------------------------------------------------------------------------

    //-------------------------------------------------------------------------------
    // Declare TestFile Properties
    //-------------------------------------------------------------------------------
TestFileProperties = {
    testFile: path.resolve(__dirname + '/projects/minerbug/js/testfile.txt'),
    seedFile: path.resolve(__dirname + '/projects/minerbug/js/seed/ipsumlorem.txt'),
    seedFileEncoding: 'utf8',
    maxTestFileSize: 104857600 //100MB
};

buildTask('createTestFile', function(flow, buildProject, properties){
    var props               = TestFileProperties;
    var testFile            = props.testFile;                                   // props.getProperty("testFile");
    var seedFile            = props.seedFile;                                   // props.getProperty("seedFile");
    var seedFileEncoding    = props.seedFileEncoding;                           // props.getProperty("seedFileEncoding") || null;
    var seedData            = fs.readFileSync(seedFile, seedFileEncoding);
    var seedFileSize        = fs.statSync(seedFile).size;
    var maxTestFileSize     = props.maxTestFileSize;                            // props.getProperty("maxTestFileSize");

    createTestFile(testFile, seedData, seedFileSize, maxTestFileSize, function(error){
        if(!error){
            console.log('\ntestFile successfully created');
            flow.complete();
        } else {
            console.log('\ntestFile could not be created');
            flow.complete(error);
        }
    });
});

buildTask('gzipFile', function(flow, buildProject, properties) {
    // var props       = this.generateProperties(properties); //NOTE: SUNG @BRN Not intuitive. Please consider rewriting;
    var props       = TestFileProperties;
    var inputFile   = props.testFile;       // props.getProperty("testFile");
    var outputFile  = inputFile + '.gz';

    gzipFile(inputFile, outputFile, function(error) {
        flow.complete(error);
    });
});

/**
 * @param {string} inputFile
 * @param {string} outputFile
 */
function gzipFile(inputFile, outputFile, callback) {
    var gzip = zlib.createGzip();
    var inp = fs.createReadStream(inputFile);
    var out = fs.createWriteStream(outputFile);

    inp.pipe(gzip).on('end', callback).pipe(out);
};

/**
 * @param {string} testFile
 * @param {string} seedData
 * @param {number} seedFileSize
 * @param {number} maxTestFileSize
 * @param {function(error)} callback
 */
function createTestFile(testFile, seedData, seedFileSize, maxTestFileSize, callback){
    var validateParameters = function(testFile, seedData, seedFileSize, maxTestFileSize, callback){
        if( typeof testFile         !== 'string' ||
            typeof seedData         !== 'string' ||
            typeof seedFileSize     !== 'number' ||
            typeof maxTestFileSize  !== 'number' ||
            typeof callback         !== 'function'){
            throw new Error('Type Error in parameters');
        }
    };

    var createFile = function(testFile, seedData, seedFileSize, maxTestFileSize, callback){
        var testFileSize = fs.statSync(testFile).size;
        var percentage = (testFileSize / maxTestFileSize * 100).toString().substring(0,4);
        process.stdout.write('\r' + percentage + '% complete');

        if(testFileSize > (maxTestFileSize - seedFileSize)){
            callback();
        } else {
            fs.appendFile(testFile, seedData, function(error){
                if(!error){
                    createFile(testFile, seedData, seedFileSize, maxTestFileSize, callback)
                } else {
                    callback(error);
                }
            });
        }
    };

    if(!fs.existsSync(testFile)){
        fs.writeFileSync(testFile);
    }
    validateParameters(testFile, seedData, seedFileSize, maxTestFileSize, callback);
    createFile(testFile, seedData, seedFileSize, maxTestFileSize, callback);
};

//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean Flow
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local Flow
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        parallel([

            // minerbug server
            //------------------------------------

            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("minerbugserver.packageJson"),
                        sourcePaths: buildProject.getProperty("minerbugserver.sourcePaths"),
                        scriptPaths: buildProject.getProperty("minerbugserver.scriptPaths"),
                        testPaths:   buildProject.getProperty("minerbugserver.testPaths"),


                        //TODO BRN: This is temporary until we get client js packages working.

                        resourcePaths: buildProject.getProperty("minerbugserver.resourcePaths"),
                        staticPaths: buildProject.getProperty("minerbugserver.staticPaths")
                    }
                }),
                parallel([
                    targetTask('generateBugPackRegistry', {
                        init: function(task, buildProject, properties) {
                            var nodePackage = nodejs.findNodePackage(
                                buildProject.getProperty("minerbugserver.packageJson.name"),
                                buildProject.getProperty("minerbugserver.packageJson.version")
                            );
                            task.updateProperties({
                                sourceRoot: nodePackage.getBuildPath(),
                                ignore: ["static"]
                            });
                        }
                    }),
                    targetTask('generateBugPackRegistry', {
                        init: function(task, buildProject, properties) {
                            var nodePackage = nodejs.findNodePackage(
                                buildProject.getProperty("minerbugserver.packageJson.name"),
                                buildProject.getProperty("minerbugserver.packageJson.version")
                            );
                            task.updateProperties({
                                sourceRoot: nodePackage.getBuildPath().getAbsolutePath() + "/static"
                            });
                        }
                    })
                ]),
                targetTask('packNodePackage', {
                    properties: {
                        packageName:    buildProject.getProperty("minerbugserver.packageJson.name"),
                        packageVersion: buildProject.getProperty("minerbugserver.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("minerbugserver.packageJson.name"),
                            buildProject.getProperty("minerbugserver.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("minerbugserver.packageJson.name"),
                            buildProject.getProperty("minerbugserver.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                acl: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                })
            ]),


            // minerbug api
            //------------------------------------

            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("minerbugapi.packageJson"),
                        sourcePaths: buildProject.getProperty("minerbugapi.sourcePaths"),
                        scriptPaths: buildProject.getProperty("minerbugapi.scriptPaths"),
                        testPaths:   buildProject.getProperty("minerbugapi.testPaths")
                    }
                }),

                targetTask('generateBugPackRegistry', {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("minerbugapi.packageJson.name"),
                            buildProject.getProperty("minerbugapi.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath(),
                            ignore: ["static"]
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName:    buildProject.getProperty("minerbugapi.packageJson.name"),
                        packageVersion: buildProject.getProperty("minerbugapi.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("minerbugapi.packageJson.name"),
                            buildProject.getProperty("minerbugapi.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("minerbugapi.packageJson.name"),
                            buildProject.getProperty("minerbugapi.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                acl: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                })
            ])
        ])
    ])
).makeDefault();


// Prod Flow
//-------------------------------------------------------------------------------

//TODO BRN:


// TestFile Flow
//-------------------------------------------------------------------------------

buildTarget('testfile').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        series([
            targetTask("createTestFile", {
        
            }),
            targetTask("gzipFile", {
        
            }),
            targetTask("s3EnsureBucket", {
                properties: {
                    bucket: buildProject.getProperty("local-bucket")
                }
            }),
            targetTask("s3PutFile", {
                init: function(task, buildProject, properties) {
                    task.updateProperties({
                        file: buildProject.getProperty("testfile.testFile") + '.gz',
                        options: {
                            acl: 'public-read'
                        }
                    });
                },
                properties: {
                    bucket: buildProject.getProperty("local-bucket")
                }
            })
        ])
    ])
);
