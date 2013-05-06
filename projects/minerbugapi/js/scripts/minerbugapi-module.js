//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var MinerBugApi = bugpack.require('minerbug.MinerBugApi');


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

// NOTE BRN: This file is the entry point for the node js module. So we also export this file as a node js module here
// so that users can simple 'require('buildbug') in their build scripts.

module.exports = MinerBugApi;
