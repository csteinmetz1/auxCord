//var socket = io.connect('http://localhost:8888');


//btn.addEventListener('submit',);


function rewrite() {
    document.getElementById('demo').innerHTML('please just do something');
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('src','reponse');
    var remove = document.getElementById('remove');
    var replace = document.getElementById('replace');
    replace.parentNode.insertBefore(ifrm, replace);
}

rewrite();
