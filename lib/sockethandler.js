module.exports = function(socket){
  socket.join(socket.handshake.query.channel);
	socket.emit('message', socket.handshake.user.logged_in);
}
