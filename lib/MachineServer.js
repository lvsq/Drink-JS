/**
* Created by JetBrains PhpStorm.
* User: seanmcgary
* Date: 12/21/11
* Time: 11:18 PM
* To change self template use File | Settings | File Templates.
*/
var net = require('net'),
utils = require('./utils.js').utils,
DrinkMachine = require('./DrinkMachine.js').DrinkMachine;

/**
 * Machine server
 * The class that facilitates communication between the sunday server and one of
 * the many clients that may be connected to the server.
 */
class MachineServer {
  /**
  * constructor
  * constructs a new Machine server object for clients to connect to.
  * @param sunday_server- the instance of the sunday server.
  * @param config- either drink_config.js or drink_config_dev.js.
  * @param Logger- an instance of the logger class.
  */
  constructor(sunday_server, config, Logger) {
    var self = this;
    self.sunday_server = sunday_server;
    self.logger = Logger;

    self.machines = config.machines;
    self.machine_config = config.machine_server;
    self.rasPi_ips = config.rasPi_ips;

    self.server = null;
    self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - machine server init', color: null}], 0);
  }//constructor
  /**
  * init
  * Initializes the machine server to start accepting communication from client
  * machines.
  */
  init(){
    var self = this;

    // create the server
    self.server = net.createServer(function(socket){

      //var conn = self;
      var conn = {
        machine: null,
        authenticated: false
      };
      self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - reserves low feed the needy', color: null}], 0);

      socket.on('data', function(){
        self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - die in a fire zach', color: null}], 0);
        self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - rasPi connecting from ' + socket.remoteAddress, color: null}], 0);

        // if the requesting IP is that of a valid rasPi..
        if(socket.remoteAddress in self.rasPi_ips){
          // get the alias from the config
          var machine_alias = self.rasPi_ips[socket.remoteAddress];

          // check to make sure the machine isnt already connected
          if(self.machine_connected(machine_alias) == false){
            self.set_machine_connection_status(machine_alias, true);

            conn.machine = self.machines[machine_alias];
            conn.socket = socket;

            self.create_machine_instance(machine_alias, conn);
          } else {
            self.reinit_machine(machine_alias, socket);
          }
        } else {
          // else deny it
          self.logger.log([{msg: self.machine_time(), color: 'gray'}, {msg: ' - Invalid IP address for rasPi', color: 'gray'}], 0);
          socket.write("2\n");
          socket.destroy();
        }
      });
      self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - between connect and error', color: null}], 0);
      socket.on('error', (e) => {
        self.logger.log([{msg: self.machine_time(), color: 'gray'}, {msg: ' - fuck', color: 'gray'}], 0);
      });
      socket.on('connect', (e) => {
        self.logger.log([{msg: self.machine_time(), color: 'gray'}, {msg: ' - wtffff', color: 'gray'}], 0);
      });
    });

    self.server.listen(self.machine_config.port, self.machine_config.host);
    self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - Initializing machine server ' + self.machine_config.host + ':' + self.machine_config.port, color: null}], 0);
  }//init
  /**
  * machine_connected
  */
  machine_connected(machine_alias){
    var self = this;

    if(machine_alias in self.machines && self.machines[machine_alias].connected == true){
      self.logger.log([{msg: utils.get_time(), color: 'cyan'},{msg: ' - Machine server true', color:null}],0);
      return true;
    } else {
      self.logger.log([{msg: utils.get_time(), color: 'cyan'},{msg: ' - Machine server false', color:null}],0);
      return false;
    }

  }//machine_connected
  /**
  * set_machine_connection_status
  * Changes the config file to refelct the status of currently connected clients.
  * @param machine_alias- The alias of the machine that is connecting to be used
  *                       to reference the machine in the config file.
  * @param status- [true, false], The conneciton status.
  */
  set_machine_connection_status(machine_alias, status){
    var self = this;

    if(machine_alias in self.machines){
      self.machines[machine_alias].connected = status;
    }
  }//set_machine_connection_status
  /**
  * create_machine_instance
  * Create a new drink machine for the newly connected client.
  * @param machine_alias- the alias for the machine that has connected.
  * @param conn- the websocket connection to that client machine.
  */
  create_machine_instance(machine_alias, conn){
    var self = this;

    if(machine_alias in self.machines){
      self.machines[machine_alias].machine_inst = new DrinkMachine(conn, self.logger);
    }
  }//create_machine_instance
  /**
  * machine_time
  * returns the current local machine time usually for logging output.
  */
  machine_time(){
    var self = this;

    return utils.get_time() + ' (machine_server)';
  }//machine_time
  /**
  * get_name_for_machine
  * uses the machine alias to fetch the long name in the config file.
  * @param String machine_alias- short name for the client drink machine.
  *  @return String long_name- long name of the connected client machine.
  */
  get_name_for_machine(machine_alias){
    var self = this;

    if(machine_alias in self.machines){
      return self.machines[machine_alias].long_name;
    }
  }//get_name_for_machine
  /**
  * is_valid_machine
  * Checks to see if the machine_alias exists in the configuration file.
  * @param string machine_alias - the alias for the client machine.
  * @return bool- true if in configuration file, false otherwise.
  */
  is_valid_machine(machine_alias){
    var self = this;

    if(machine_alias in self.machines){
      return true;
    } else {
      return false;
    }
  }//is_valid_machine
  /**
  * reinit_machine
  * In the even the websocket is unexpectedly closed, the server will try to to
  * re-establish a websoket.
  */
  reinit_machine(machine_alias, socket){
    var self = this;

    if(self.is_valid_machine(machine_alias)){
      if(machine_alias in self.machines){
        self.machines[machine_alias].machine_inst.reinit(socket);
      }
    }
  }//reinit_machine
};

exports.MachineServer = MachineServer;
