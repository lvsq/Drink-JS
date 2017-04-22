function Request(command, callback, command_data){
  var self = this;

  if(typeof command_data == 'undefined'){
    command_data = {};
  }
  
  self.command = command;
  self.callback = callback;
  self.command_data = command_data;
}

Request.prototype.run_callback = function(callback_data){
  var self = this;
  self.callback(callback_data);
};

Request.prototype.run_command = function(){
  var self = this;

  self.command(self.command_data);
};
exports.Request = Request;
