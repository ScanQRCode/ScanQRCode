import { browser } from 'webextension-polyfill-ts';
var mouseClip = function (cb) {
    if(window['clipstation']){
        return;
    }
    var dragwrap = `<div class="dragwrap"><div class="dragleft"></div><div class="dragtop"></div><div class="dragright"></div><div class="dragbottom"></div><div class="eyearea"></div></div><style id="addstyle">body {position: relative;}.dragwrap {top: 0;bottom: 0;left: 0;right: 0;position: absolute;z-index: 999999;cursor: crosshair;}.dragwrap div {position: absolute;}.dragwrap .dragleft,.dragwrap .dragtop,.dragwrap .dragright,.dragwrap .dragbottom {background: #000;opacity: 0.1;top: 0;bottom: 0;left: 0;right: 0;}html{overflow: hidden;padding-right: 17px;padding-bottom: 17px;}</style>`;
    document.body.style.width = document.body.scrollWidth + 'px';
    document.body.style.height = document.body.scrollHeight + 'px';
    var rootdiv = document.createElement('div');
    rootdiv.id = 'clipstation';
    rootdiv.innerHTML = dragwrap;
    document.body.appendChild(rootdiv);
    var wrap = document.querySelector('.dragwrap');
    var left = document.querySelector('.dragleft');
    var topE = document.querySelector('.dragtop');
    var right = document.querySelector('.dragright');
    var bottomE = document.querySelector('.dragbottom');
    var isDown = false;

    var initX = 0, initY = 0, startX = 0, startY = 0, endX = 0, endY = 0; 
    var topT, topB, topL, topR, bottomT, bottomB, bottomL, bottomR, leftT, leftB, leftL, leftR, rightT, rightB, rightL, rightR;

    var keyup,docMouseUp,docMouseDown;

    keyup = function(e){
        if(e.keyCode === 27){
            document.body.removeChild(rootdiv);
            window.removeEventListener('keyup',keyup);
            document.removeEventListener('mousedown', docMouseDown);
            document.removeEventListener('mouseup', docMouseUp);
        }
    };

    window.addEventListener('keyup',keyup);
    
    docMouseDown = function (e) {
        
        startX = e.clientX;
        startY = e.clientY; 
    };
    docMouseUp = function (e) {
        endX = e.clientX;
        endY = e.clientY;
        var x, y, width, height;
        if (startX <= endX) {
            x = startX;
            width = endX - startX;
        } else {
            x = endX;
            width = startX - endX;
        }

        if (startY <= endY) {
            y = startY;
            height = endY - startY;
        } else {
            y = endY;
            height = startY - endY;
        }
        document.body.removeChild(rootdiv);
        document.removeEventListener('mousedown', docMouseDown);
        document.removeEventListener('mouseup', docMouseUp);
        window.removeEventListener('keyup',keyup);
        if (cb) {
            cb({ x, y, width, height });
        }
    };
    
    document.addEventListener('mouseup', docMouseUp);
    document.addEventListener('mousedown', docMouseDown);


    wrap.addEventListener('mousedown', function (e) {
        isDown = true;
        initX = e.pageX - wrap.offsetLeft;
        initY = e.pageY - wrap.offsetTop;
        // initX = e.pageX;
        // initY = e.pageY;
        // initX = e.clientX;
        // initY = e.clientY;
    });

    wrap.addEventListener('mousemove', function (e) {
        var ePageX = e.pageX - wrap.offsetLeft;
        var ePageY = e.pageY - wrap.offsetTop;
        // var ePageX = e.pageX;
        // var ePageY = e.pageY;
        // var ePageX = e.clientX;
        // var ePageY = e.clientY;
        if (isDown) {
            // if (e.clientX + 40 > window.innerWidth) {
            //     window.scrollBy(20, 0)
            // }
            // if (e.clientY + 40 > window.innerHeight) {
            //     window.scrollBy(0, 20)
            // }

            // if (e.clientX - 40 < 0) {
            //     window.scrollBy(-20, 0)
            // }
            // if (e.clientY - 40 < 0) {
            //     window.scrollBy(0, -20)
            // }

            if (ePageX > initX) {
                leftL = 0;
                leftR = wrap.clientWidth - initX;

                rightL = ePageX;
                rightR = 0;

                topL = 0;
                topR = 0;

                bottomL = 0;
                bottomR = 0;
            } else {
                leftL = 0;
                leftR = wrap.clientWidth - ePageX;

                rightL = initX;
                rightR = 0;

                topL = 0;
                topR = 0;

                bottomL = 0;
                bottomR = 0;
            }
            if (ePageY > initY) {
                leftT = initY;
                leftB = wrap.clientHeight - ePageY;

                rightT = initY;
                rightB = wrap.clientHeight - ePageY;

                topT = 0;
                topB = wrap.clientHeight - initY;

                bottomT = ePageY;
                bottomB = 0;
            } else {
                leftT = ePageY;
                leftB = wrap.clientHeight - initY;

                rightT = ePageY;
                rightB = wrap.clientHeight - initY;

                topT = 0;
                topB = wrap.clientHeight - ePageY;

                bottomT = initY;
                bottomB = 0;
            }
            left.style = `top:${leftT}px;bottom:${leftB}px;left:${leftL}px;right:${leftR}px;opacity:0.4;`;
            right.style = `top:${rightT}px;bottom:${rightB}px;left:${rightL}px;right:${rightR}px;opacity:0.4;`;
            topE.style = `top:${topT}px;bottom:${topB}px;left:${topL}px;right:${topR}px;opacity:0.4;`;
            bottomE.style = `top:${bottomT}px;bottom:${bottomB}px;left:${bottomL}px;right:${bottomR}px;opacity:0.4;`
        }
    });

    window.addEventListener('mouseup', function (e) {
        isDown = false;
        initX = 0, initY = 0;
        left.style = "opacity:0.1;top:0;bottom:0;right:0;left:0;";
        topE.style = "opacity:0.1;top:0;bottom:0;right:0;left:0;";
        right.style = "opacity:0.1;top:0;bottom:0;right:0;left:0;";
        bottomE.style = "opacity:0.1;top:0;bottom:0;right:0;left:0;";
    });
};
var aPort = browser.runtime.connect()
aPort.onMessage.addListener(function (message, port) {
    switch (message.action) {
        case 'clip':
            mouseClip(function (rect) {
                port.postMessage({ 
                    action: 'screenshot',
                    rect,
                    windowWidth:window.innerWidth,
                    windowHeight:window.innerHeight
                    
                });
            });
            break;
        case 'error':
            alert(message.errorInfo)
            break;
    }
});
top.addEventListener('keydown',function(e){
    if(e.altKey === true && e.shiftKey === true && e.key === 'D'){
        mouseClip(function (rect) {
            aPort.postMessage({ 
                action: 'screenshot',
                rect,
                windowWidth:window.innerWidth,
                windowHeight:window.innerHeight
                
            });
        });
    }
});
export { }