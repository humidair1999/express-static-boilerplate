// Include the necessary libraries; the 'mimes' file lets the Node server know what type of file it
// should be serving up.

var Mimes  = require('./libs/mimes');
var Http = require('http');
var Path = require('path');
var FS = require('fs');
 
 // HandleRequest is passed as an argument to method createServer at the bottom of the file.
 // The body of this function is executed every time a request is received by the server.
 
 // Request arg: contains information about the request, such as IP and GET/POST commands
 // Response arg: determines what content and headers to return to whomever sent the request
 
function HandleRequest (Request, Response) {
    // url stores the URL that's being requested when a request is received
    var url = Request.url;
        
    // Sanitize url to prevent local file inclusion (directory traversal) attacks
    var url = url.replace('../','');
        
    // Assuming the user went to the root of the server, we'll return the index HTML page
    if (url == '/') {
        var url = 'index.html';
    }
        
    // Now we determine the file extension of the requested file at the given URL
    var ext = Path.extname(url).replace('.','');
        
    // If no extension is given, no file is returned, and a message is displayed instead
    if (ext == '') {
        Response.writeHead(200,{'Content-Type' : 'text/plain'});
        Response.end("Extension was not provided");
        console.log("Failed: " + url + " - No Extension");
        return;
    }
        
    // Assuming we have a valid extension, we can now see if the file actually resides on the server
    FS.stat(__dirname + '/httpdocs/' + url, function (error, stats) {
        if (error) {
            Response.writeHead(404,{'Content-Type' : 'text/html'});
            Response.end("<h1>404 Not Found</h1><p>The page " + url + " was not found!</p>");
            return;
        }
                
        if (stats.isFile() === false) {
            Response.writeHead(404,{'Content-Type' : 'text/html'});
            Response.end("<h1>404 Not Found</h1><p>The page " + url + " was not found!</p>");
            console.log("Failed: " + url);
            return;
        }
                
        // If neither above case is true, the file is real and legitimate, and we can grab the mimetype from
        // the 'mimes' file defined in the requires.
        var contentType = (Mimes[ext]) ? Mimes[ext] : 'application/octec-stream';
                
        // If all went well, we can now declare it's "OK" to serve the file base on its given mimetype
        Response.writeHead(200,{
            'Content-Type' : contentType,
            'Content-Length' : stats.size
        });
                
        // From here, we create a read stream for the found file, which should be located in the
        // 'httpdocs' folder of the server, much like in a typical Apache install.
        FS.createReadStream(__dirname + '/httpdocs/' + url).pipe(Response);
                
        // And here, we output to the console which files are being served
        console.log("Served: " + url);
    });
}

// Here's the function call itself, listening on a port specified as an argument to method 'listen'
Http.createServer(HandleRequest).listen(8080);
console.log("HTTP Server now running on port: 8080");