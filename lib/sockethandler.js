module.exports = function(socket){
	//console.log('socket-user:', socket.handshake.user);
	socket.emit('message', socket.handshake.user.logged_in);
}