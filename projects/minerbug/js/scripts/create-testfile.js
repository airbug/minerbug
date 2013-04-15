//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------
var fs              = require('fs');
var path            = require('path');

//-------------------------------------------------------------------------------
// Variables
//-------------------------------------------------------------------------------

var testFile = path.resolve(__dirname + '/testfile.txt');
var seedFile = path.resolve(__dirname + '/../seed/ipsumlorem.txt');
var seedFileSize = fs.statSync(seedFile).size;
var seedFileEncoding = 'utf8';
var seedData = fs.readFileSync(seedFile, seedFileEncoding);
var maxTestFileSize = 104857600; //100MB

//-------------------------------------------------------------------------------
// Functions
//-------------------------------------------------------------------------------

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
// Execute Script
//-------------------------------------------------------------------------------

createTestFile(testFile, seedData, seedFileSize, maxTestFileSize, function(error){
    if(!error){
        console.log('\ntestFile successfully created');
    } else {
        console.log('\ntestFile could not be created');
        console.log(error);
    }
});