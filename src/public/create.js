var socket = io.connect('http://localhost:8888');

socket.on('done', function(data){
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('src', data);
    ifrm.setAttribute('width','300');
    ifrm.setAttribute('height','380');
    ifrm.setAttribute('frameborder','0');
    ifrm.setAttribute('allowtransparency','true');
    
    var textOut = document.createElement('p');
    textOut.setAttribute('class','desc');
    textOut.setAttribute('id', 'insert');

    document.getElementById('remove1').innerHTML = "aux Synchronized";
    var remove2 = document.getElementById('remove2');
    remove2.parentNode.removeChild(remove2);
    var replace = document.getElementById('replace');
    replace.parentNode.insertBefore(textOut,replace);
    document.getElementById('insert').innerHTML = "Here's the playlist generated for you and your friends.";
    replace.parentNode.insertBefore(ifrm, replace);
    replace.parentNode.removeChild(replace);
})s