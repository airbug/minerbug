var bugpackApi = require('bugpack');
bugpackApi.loadContext("", function(error, bugpack) {
    if (!error) {
        var MinerBugApplication = bugpack.require('minerbug.MinerBugApplication');
        var application = new MinerBugApplication();

        //TEST
        console.log("context loaded, starting application");

        application.start();
    } else {
        console.log(error);
        //TODO BRN: Handle error
    }
});