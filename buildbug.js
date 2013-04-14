//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug = require('buildbug');


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
    minerbug: {
        packageJson: {
            name: "minerbug",
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
                "start": "node ./scripts/minerbug-server-start.js"
            }
        },
        sourcePaths: [
            "./projects/minerbug/js/src",
            "../bugjs/projects/bugjs/js/src",
            "../bugjs/projects/bugtrace/js/src",
            '../bugjs/projects/bugflow/js/src',
            '../bugjs/projects/bugboil/js/src',
            "../bugjs/projects/bugfs/js/src",
            "../bugjs/projects/annotate/js/src",
            "../bugunit/projects/bugunit/js/src"
        ],
        scriptPaths: [
            "./projects/minerbug/js/scripts",
            "../bugunit/projects/bugunit/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugjs/js/test"
        ],
        resourcePaths: [
            "./projects/minerbug/resources"
        ],
        staticPaths: [
            "./projects/minerbug/static",
            "../bugjs/external/bootstrap/js/src",
            "../bugjs/external/bootstrap/static",
            "../bugjs/external/jquery/js/src",
            "../bugjs/external/mustache/js/src",
            "../bugjs/projects/bugjs/js/src",
            '../bugpack/projects/bugpack-client/js/src'
        ]
    }
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------

buildTask('gzipFile', function(flow, buildProject, properties) {
    gzipFile(properties, function(error) {
        flow.complete(error);
    });
});

function gzipFile(properties) {
    
}

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
        series([
            targetTask('createNodePackage', {
                properties: {
                    packageJson: buildProject.getProperty("minerbug.packageJson"),
                    sourcePaths: buildProject.getProperty("minerbug.sourcePaths"),
                    scriptPaths: buildProject.getProperty("minerbug.scriptPaths"),
                    testPaths:   buildProject.getProperty("minerbug.testPaths")
                }
            }),
            targetTask('generateBugPackRegistry', {
                init: function(task, buildProject, properties) {
                    var nodePackage = nodejs.findNodePackage(
                        buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version")
                    );
                    task.updateProperties({
                        sourceRoot: nodePackage.getBuildPath()
                    });
                }
            }),
            targetTask('packNodePackage', {
                properties: {
                    packageName:    buildProject.getProperty("minerbug.packageJson.name"),
                    packageVersion: buildProject.getProperty("minerbug.packageJson.version")
                }
            }),
            targetTask('startNodeModuleTests', {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(
                        buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version")
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
                    var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version"));
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
).makeDefault();


// Prod Flow
//-------------------------------------------------------------------------------

buildTarget('prod').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        series([
            targetTask('createNodePackage', {
                properties: {
                    packageJson: buildProject.getProperty("minerbug.packageJson"),
                    sourcePaths: buildProject.getProperty("minerbug.sourcePaths"),
                    scriptPaths: buildProject.getProperty("minerbug.scriptPaths"),
                    testPaths: buildProject.getProperty("minerbug.testPaths")
                }
            }),
            targetTask('generateBugPackRegistry', {
                init: function(task, buildProject, properties) {
                    var nodePackage = nodejs.findNodePackage(
                        buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version")
                    );
                    task.updateProperties({
                        sourceRoot: nodePackage.getBuildPath()
                    });
                }
            }),
            targetTask('packNodePackage', {
                properties: {
                    packageName: buildProject.getProperty("minerbug.packageJson.name"),
                    packageVersion: buildProject.getProperty("minerbug.packageJson.version")
                }
            }),
            targetTask('startNodeModuleTests', {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(
                        buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version")
                    );
                    task.updateProperties({
                        modulePath: packedNodePackage.getFilePath()
                    });
                }
            }),
            targetTask("s3EnsureBucket", {
                properties: {
                    bucket: "airbug"
                }
            }),
            targetTask("s3PutFile", {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("minerbug.packageJson.name"),
                        buildProject.getProperty("minerbug.packageJson.version"));
                    task.updateProperties({
                        file: packedNodePackage.getFilePath(),
                        options: {
                            acl: 'public-read'
                        }
                    });
                },
                properties: {
                    bucket: "airbug"
                }
            })
        ])
    ])
);
