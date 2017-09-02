/*
 # Author: Ege Bilecen
 # Website: http://egebilecen.tk/
 # Contact: blackclown0@gmail.com
*/
var FILE_RETURN; //true if operation was successful, false on fail
var MEMORY = { //file datas will be in "fileData" attribute.
	fileData : {}
};
var SETTINGS = {
	debug : 1
};

/*
 # Global Parameters #

 @param name: File name that some operation will be on it.

 @param save: MEMORY.fileData's attribute name.
 Example    : @param save = example, file data can be reached as MEMORY.fileData.example or MEMORY["fileData"]["example"]

 @param successFunc: If operation successfull, this function will be called.
 @param errorFunc  : If operation fail, this function will be called.

 Example usage at the bottom.
*/

//saves file's data that send as name parameter on function if used alone.
function getFile( name, save,successFunc, errorFunc ){
    if( typeof name == 'undefined' )
        return false;
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - getFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - getFile');} }
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: false, exclusive: false }, function (fileEntry) {
            if(SETTINGS.debug){console.info('file - file found, reading');}
            readFile(fileEntry, save, successFunc, errorFunc);
        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false;errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
}

//!!! Don't use that function. It's a helper function. !!!\\
function readFile( fileEntry, save, successFunc, errorFunc ) {
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - readFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - readFile');} }

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.readAsText(file);

        reader.onloadend = function() {
            if(SETTINGS.debug){console.info('file - file readed and saved');}
            MEMORY.fileData[save] = this.result;
            FILE_RETURN=true;

            successFunc();
        };
    }, function(){ if(SETTINGS.debug){console.info('file - error3 - cannot read file');} FILE_RETURN=false; errorFunc(); });
}

//@param text: Data that will be writed to file.\\
function writeFile( name, text, save,successFunc, errorFunc ) {
    if( typeof name == 'undefined' )
        return false;
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof text == 'undefined' )
        text = '';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - writeFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - writeFile');} }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: false, exclusive: false }, function (fileEntry) {
            
            fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                if(SETTINGS.debug){console.info("file - successfully writed");}
                readFile(fileEntry, save, successFunc, errorFunc);
            };

            fileWriter.onerror = function (e) {
                if(SETTINGS.debug){console.info("file - error - write failed to "+e.toString());}
                FILE_RETURN=false;
                errorFunc();
            };

            // If data object is not passed in,\\
            // create a new Blob instead.\\
            dataObj = new Blob([text], { type: 'text/plain' });

            fileWriter.write(dataObj);
        });

        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false;errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
    
}

function createFile( name, successFunc, errorFunc ){
    if( typeof name == 'undefined' )
        return false;
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - createFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - createFile');} }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: true, exclusive: false }, function (fileEntry) {
            if(SETTINGS.debug){console.info('file - file created');}
            FILE_RETURN=true;
            successFunc();
        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false; errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
}

//If you want to overwrite to exist file, first use this function to clear it. And then use writeFile() function.
function clearFile( name, successFunc, errorFunc ){
    if( typeof name == 'undefined' )
        return false;
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - createFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - createFile');} }

    getFile(name,'temporary',function(){
        var a = '';
        for( var i=1; i <= MEMORY.fileData.temporary.length; i++ )
        { a += ' '; }
        writeFile(name,a,'temporary',function(){ successFunc(); },function(){ errorFunc(); });
    });
}
