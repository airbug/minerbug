var bugpackApi = require('bugpack');
bugpackApi.loadContext("", function(error, bugpack) {
    if (!error) {
        var MinerbugApplication = bugpack.require('minerbug.MinerbugApplication');
        var application = new MinerbugApplication();
        console.log("context loaded, starting application");

        application.start(function(error) {
            if (!error) {
                console.log("MinerbugWorker successfully started");
            } else {
                console.error(error);
                //TODO BRN: Handle error
            }
        });
    } else {
        console.error(error);
        //TODO BRN: Handle error
    }
});
