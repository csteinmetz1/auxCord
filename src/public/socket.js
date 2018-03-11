var socket = io.connect('http://localhost:8888');

socket.on('done', function(data){
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('src', data.playlistLink);
    var remove1 = document.getElementById('remove1');
    remove1.parentNode.removeChild(remove1);
    var remove2 = document.getElementById('remove2');
    remove2.parentNode.removeChild(remove2);
    var replace = document.getElementById('replace');
    replace.parentNode.insertBefore(ifrm, replace);
    document.getElementById('replace').innerHTML = "Playlist generated!"
})