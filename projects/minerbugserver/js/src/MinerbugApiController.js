//TODO BRN: Generate a new Visit here, Also gen


var logFileName = userID + '-' + visitID + '.log';
var logFilePath = activeFoldersPath + '/' + logFileName;

socket.on('tracklog', function(data){

    if (data.eventName === "connect") {

    }
    data.userID = userID;
    data.visitID = visitID;
    _this.logsManager.appendToLogFile(logFilePath, data, function(error){

    });
});

socket.on('disconnect', function(){
    var logsManager                 = _this.logsManager;
    var currentCompletedFolderName  = _this.logsManager.currentCompletedFolderName; //BUGBUG
    var logEventManager             = _this.logsManager.logEventManagers[currentCompletedFolderName];

    logEventManager.incrementMoveCount(); //Why is logEventManager undefined? it doesn't exist

    var completedUserFolderPath = completedFoldersPath + '/' + currentCompletedFolderName + '/' + userID + '/';
    var data = {
        eventName: 'disconnect',
        userID: userID,
        visitID: visitID,
        timestamp: new Date(),
        data: null
    };


    logsManager.appendToLogFile(logFilePath, data, function(error){
        if(!error){
            fs.exists(completedUserFolderPath, function(exists){
                if(!exists){
                    fs.mkdir(completedUserFolderPath, 0777, function(error){
                        if(!error){
                            logsManager.moveLogFileToCompletedUserFolder(logFilePath, currentCompletedFolderName, completedUserFolderPath, function(error){
                                if(error){
                                    console.log(error);
                                } else {
                                    console.log("successfully moved log file to completed user folder");
                                }
                            });
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    logsManager.moveLogFileToCompletedUserFolder(logFilePath, currentCompletedFolderName, completedUserFolderPath, function(error){
                        if(error){
                            console.log(error);
                        } else {
                            console.log("successfully moved log file to completed user folder");
                        }
                    });
                }
            });
        } else {
            console.log(error);
        }
    });
});

socket.on('error', function(reason){
    console.log('Error:', reason, "userID:", userID, "visitID:", visitID);
});