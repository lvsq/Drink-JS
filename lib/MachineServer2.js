/**
* Created by JetBrains PhpStorm.
* User: seanmcgary
* Date: 12/21/11
* Time: 11:18 PM
* To change this template use File | Settings | File Templates.
*/
var net = require('net'),
utils = require('./utils.js').utils,
DrinkMachine = require('./DrinkMachine.js').DrinkMachine;

class MachineServer {
  /**
  * constructor
  */
  constructor(sunday_server, config, logger) {
    this.sunday_server = sunday_server;
    this.logger = logger;

    this.machines = config.machines;
    this.machine_config = config.machine_server;
    this.tini_ips = config.tini_ips;

    this.server = null;
    this.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - machine server init', color: null}], 0);
  }//constructor
  /**
  * init
  */
  init(){
    // create the server
    this.server = net.createServer(function(socket){

      //var conn = this;
      var conn = {
        machine: null,
        authenticated: false
      };

      self.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - reserves low feed the needy', color: null}], 0);

      socket.on('data', function(){
        this.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - die in a fire zach', color: null}], 0);
        this.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - Tini connecting from ' + socket.remoteAddress, color: null}], 0);

        // if the requesting IP is that of a valid tini..
        if(socket.remoteAddress in this.tini_ips){
          // get the alias from the config
          var machine_alias = this.tini_ips[socket.remoteAddress];

          // check to make sure the machine isnt already connected
          if(this.machine_connected(machine_alias) == false){
            this.set_machine_connection_status(machine_alias, true);

            conn.machine = this.machines[machine_alias];
            conn.socket = socket;

            this.create_machine_instance(machine_alias, conn);
          } else {
            this.reinit_machine(machine_alias, socket);
          }
        } else {
          // else deny it
          this.logger.log([{msg: this.machine_time(), color: 'gray'}, {msg: ' - Invalid IP address for tini', color: 'gray'}], 0);
          socket.write("2\n");
          socket.destroy();
        }
      });
      this.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - between connect and error', color: null}], 0);
      socket.on('error', (e) => {
        this.logger.log([{msg: this.machine_time(), color: 'gray'}, {msg: ' - fuck', color: 'gray'}], 0);
      });
      socket.on('connect', (e) => {
        this.logger.log([{msg: this.machine_time(), color: 'gray'}, {msg: ' - wtffff', color: 'gray'}], 0);
      });
    });

    this.server.listen(this.machine_config.port, this.machine_config.host);
    this.logger.log([{msg: this.machine_time(), color: 'cyan'}, {msg: ' - Initializing machine server ' + this.machine_config.host + ':' + this.machine_config.port, color: null}], 0);
  }//init
  /**
  * machine_connected
  */
  machine_connected(machine_alias){
    if(machine_alias in this.machines && this.machines[machine_alias].connected == true){
      this.logger.log([{msg: utils.get_time(), color: 'cyan'},{msg: ' - Machine server true', color:null}],0);
      return true;
    } else {
      this.logger.log([{msg: utils.get_time(), color: 'cyan'},{msg: ' - Machine server false', color:null}],0);
      return false;
    }

  }//machine_connected
  /**
  * set_machine_connection_status
  */
  set_machine_connection_status(machine_alias, status){


    if(machine_alias in this.machines){
      this.machines[machine_alias].connected = status;
    }
  }//set_machine_connection_status
  /**
  * create_machine_instance
  */
  create_machine_instance(machine_alias, conn){


    if(machine_alias in this.machines){
      this.machines[machine_alias].machine_inst = new DrinkMachine(conn, this.logger);
    }
  }//create_machine_instance
  /**
  * machine_time
  */
  machine_time(){

    return utils.get_time() + ' (machine_server)';
  }//machine_time
  /**
  * get_name_for_machine
  */
  get_name_for_machine(machine_alias){


    if(machine_alias in this.machines){
      return this.machines[machine_alias].long_name;
    }
  }//get_name_for_machine
  /**
  * is_valid_machine
  */
  is_valid_machine(machine_alias){


    if(machine_alias in this.machines){
      return true;
    } else {
      return false;
    }
  }//is_valid_machine
  /**
  * reinit_machine
  */
  reinit_machine(machine_alias, socket){

    if(this.is_valid_machine(machine_alias)){
      if(machine_alias in this.machines){
        this.machines[machine_alias].machine_inst.reinit(socket);
      }
    }
  }//reinit_machine
};

exports.MachineServer = MachineServer;
