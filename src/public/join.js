var socket = io.connect('http://localhost:8888');

socket.on('error', function(data){
    document.getElementById('message').innerHTML = data;
})