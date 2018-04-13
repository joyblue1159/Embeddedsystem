var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//All users
var AllUsers = [];
var AllSockets = [];
var typingUsers = [];

//Link to html file
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
//I. New User Event
  socket.on('New User', function(userName){
	if(AllUsers.indexOf(userName)==-1){//userName 不存在list中
		AllUsers.push(userName);
		AllSockets.push(socket);
		io.emit('New user join', userName);
		io.emit('add userList', userName);
	}
	else{
		socket.emit('Name exist', userName);
	}
  });
    //when a new client connected add current users to client selector
  for (var i = 0; i < AllUsers.length; i++) {
    socket.emit('add userList', AllUsers[i]);
  }

//II. Show typing 
  socket.on('start typing', function(name){
	if(typingUsers.indexOf(name)==-1){
		typingUsers.push(name);
	}
	io.emit('typing', typingUsers);//sending to all
  });
  
  socket.on('stop typing', function(name){
	if(typingUsers.indexOf(name)!=-1){
		typingUsers.splice(typingUsers.indexOf(name),1);
	}
	io.emit('typing', typingUsers);//sending to all
  });  



//III. Chatting
  socket.on('chat message', function(userName, receiveName, msg, currentdate){
	if(receiveName == 'all'){
		socket.broadcast.emit('chat message', userName, receiveName, msg, currentdate);
	}
	else{
		AllSockets[AllUsers.indexOf(receiveName)].emit('chat message', userName, receiveName, msg, currentdate);
	}
  });
  
 
 ///IV. Left
  socket.on('disconnect', function(){
	if(AllSockets.indexOf(socket)!=-1){
		if(AllUsers[AllSockets.indexOf(socket)] != null){
			io.emit('user left', AllUsers[AllSockets.indexOf(socket)]);
		}
		if(typingUsers.indexOf(AllUsers[AllSockets.indexOf(socket)])!=-1){
			typingUsers.splice(typingUsers.indexOf(AllUsers[AllSockets.indexOf(socket)]),1);
			io.emit('typing', typingUsers);
		}
		//移除user names
		AllUsers.splice(AllSockets.indexOf(socket),1);
		AllSockets.splice(AllSockets.indexOf(socket),1);
	}
  });
  

});

http.listen(process.env.PORT || 3000, function(){
  console.log('Wow it\'s working 66666!');
});
