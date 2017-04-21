var SundayServer = require('./SundayServer.js').SundayServer,
    MachineServer = require('./MachineServer.js').MachineServer,
    utils = require('./utils.js').utils,
    config = utils.get_config(),
    colors = require('colors'),
    logger = require('./logger.js').logger;
    //net = require('net'), //https://nodejs.org/api/net.html
    //tls = require('tls'); //https://nodejs.org/api/tls.html

logger.log([{msg: utils.get_time(), color: 'green'}, {msg: ' - Drink server starting...', color: null}], 0);

// 1). Create an instance of the SundayServer for each type of connection (SSL/Non-SSL)

// standard TCP, no ssl. 4242
logger.log([{msg: utils.get_time(), color: 'green'},{msg: ' - Server.js Sunday Server----------------------------------------------', color:'green'}],0);
//var sunday_serv = net.Server(); //create a nodejs Net.server
//logger.log([{msg: utils.get_time(), color: 'green'},{msg: typeof(sunday_serv), color:'green'}],0);

var sunday = new SundayServer(logger, config);/*sunday: {host: 'ip address',port: 4242},*/
// SSL connection. 4243
//var sunday_serv_ssl = tls.Server();
//var sunday_ssl = new SundayServer(sunday_serv_ssl, logger, config);

// 2). Create one instance of the machine server
logger.log([{msg: utils.get_time(), color: 'green'},{msg: ' - Server.js Sunday Server create & set machine server------------------', color:'green'}],0);
var machine_server = new MachineServer(sunday, config, logger);
sunday.set_machine_server(machine_server);


// 3). Init the machine server
logger.log([{msg: utils.get_time(), color: 'green'},{msg: ' - Server.js Machine Server Init-----------------------------------------', color:'green'}],0);
machine_server.init();

// 4). init the sunday server
logger.log([{msg: utils.get_time(), color: 'green'},{msg: ' - Server.js Sunday Init------------------------------------------------', color:'green'}],0);
sunday.init();
