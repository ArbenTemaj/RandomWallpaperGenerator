const fs = require("fs");
const http = require("http");
const https = require("https");

const port = 3000;
const server = http.createServer();
const credentials = require("./auth/credentials.json");

server.on("listening", listen_handler);
server.listen(port);
function listen_handler(){
    console.log(`Now Listening on Port ${port}`);
}

server.on("request", request_handler);
function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === "/"){
        const form = fs.createReadStream("html/index.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        form.pipe(res);
    }
    else if (req.url.startsWith("/enter")){
        res.writeHead(200, {"Content-Type": "text/html"});
        const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;
        let Username = user_input.get(`name`);
        if(Username === ""){ Username = "Guest"; }
        const Password = user_input.get(`password`);
        let end = "";
        let option1 = user_input.get(`check1`);
        let option2 = user_input.get(`check2`);
        if(option1 === null && option2 === null ){ end = "y"; }
        else if(option1 === "y" && option2 === null){ end = "y"; }
        else if(option1 === null && option2 === "g"){ end = "g"; }
        else if(option1 === "y" && option2 === "g"){ end = "yg"; }
      
        const placekeanu_endpoint = `https://placekeanu.com/500/300/${end}`;
        const placekeanu_request = https.get(placekeanu_endpoint, {method:"GET"});
        placekeanu_request.on('response',  (stream) => parse_keanu(placekeanu_endpoint, Username, res));
        get_info(Username, res);
       
    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end(`<h1>404 Not Found</h1>`);
    }
}

function get_info(Username, res){
    const wallhaven_endpoint = `https://wallhaven.cc/api/v1/search?`;
    const wallhaven_request = https.get(wallhaven_endpoint, {headers:credentials});
    wallhaven_request.on("response" , (stream) => process_stream(stream, parse_results, Username, res));
    wallhaven_request.end();
}

function process_stream (stream, callback , ...args){
    let body = "";
    stream.on("data", chunk => body += chunk);
    stream.on("end", () => callback(body, ...args));
}

function parse_results(data, Username, res){
    let wallpapers_objects = JSON.parse(data);
    let test = Object.values(wallpapers_objects)[0][11].path;
    let results = `<img src="${test}" alt="">`;
    res.write(`<p>Here is your wallpaper ${Username}!</p>${results}`);
    res.write(`<div>here is you url link wallpaper:${test}:</div>`);
}

function parse_keanu(placekeanu_endpoint, Username, res){
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(`<h1>Welcome to My project</h1>`);
    res.write(`<p>hi there, you're breathtaking</p><img src="${placekeanu_endpoint}" alt="">`);
    res.write(`Please wait ${Username}, while we get your wallpaper`);
}
