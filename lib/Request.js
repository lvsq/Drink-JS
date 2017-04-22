class Request {
  constructor(command, callback, command_data) {
    var self = this;

    if(typeof command_data == 'undefined'){
      command_data = {};
    }

    self.command = command;
    self.callback = callback;
    self.command_data = command_data;
  }
  run_callback(callback_data){
    var self = this;
    self.callback(callback_data);
  }
  run_command(){
    var self = this;
    self.command(self.command_data);
  }
};// Request

exports.Request = Request;
