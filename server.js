
const http = require('http');
const app=require('./app');
const port=8496;
const server = http.createServer(app);


server.listen(port);