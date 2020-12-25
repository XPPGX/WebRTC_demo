var txtSelfId = document.querySelector("input#txtSelfId");
var txtTargetId = document.querySelector("input#txtTargetId");
var btnRegister = document.querySelector("button#btnRegister");
var btnCall = document.querySelector("button#btnCall");
var localVideo = document.querySelector("video#localVideo");
var remoteVideo = document.querySelector("video#remoteVideo");
var lblFrom = document.querySelector("label#lblFrom");
var videoSelect = document.querySelector("select#videoSelect")

/////test////////////////////////////////////////
var txtMsg = document.querySelector("input#txtMsg");
var tdBox = document.querySelector("td#tdBox");
var btnSend = document.querySelector("button#btnSend");
/////////////////////////////////////////////////

//////////////////////////////test//////////////
var host = window.location.href;
var str = host.substring(8);
var index = str.indexOf(":",1);
var IP = str.substring(0,index);
console.log(IP);
console.log(host);
///////////////////////////////////////////////
let peer = null;
let localConn = null;
let localStream = null;

hashCode = function (str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function gotStream(stream) {
    console.log('received local stream');
    localStream = stream;
    localVideo.srcObject = localStream;
}
//test////////////////////////////////////////////////////

mess = function (message) {
    localConn.send(JSON.stringify(message));
    console.log(message);
    tdBox.innerHTML = tdBox.innerHTML += "<div class='align_left'>" + message.from + " : " + message.body + "</div>";
}

//test/////////////////////////////////////////////////////
function sendMessage(from, to, action) {
    var message = { "from": from, "to": to, "action": action };
    if (!localConn) {
        localConn = peer.connect(hashCode(to));
        localConn.on('open', () => {
            localConn.send(JSON.stringify(message));
            console.log(message);
        });
    }
    if (localConn.open){
        localConn.send(JSON.stringify(message));
        console.log(message);
    }
}

function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

//绑定摄像头列表到下拉框
function gotDevices(deviceInfos) {
    if (deviceInfos===undefined){
        return
    }
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

//开启本地摄像头
function start() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
        });
    }

    const videoSource = videoSelect.value;
    const constraints = {
        audio: true,
        video: { width: {min:1280}, height: {min:720}, deviceId: videoSource ? { exact: videoSource } : undefined}
    };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .then(gotDevices)
        .catch(handleError);
}

window.onload = function () {
    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {
        console.log('webrtc is not supported!');
        alert("webrtc is not supported!");
        return;
    }

    //获取摄像头列表
    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .catch(handleError);

    $("#dialog-confirm").hide();

    //连接到peerjs服务器的选项
   // let connOption = { host: 'localhost', port: 9000, path: '/', debug: 3 };
   let connOption = { host: IP, port: 9000, path: '/', debug: 3 };
//register处理
btnRegister.onclick = function () {
    if (!peer) {
        if (txtSelfId.value.length == 0) {
            alert("please input your name");
            txtSelfId.focus();
            return;
        }
        peer = new Peer(hashCode(txtSelfId.value), connOption);
        peer.on('open', function (id) {
            console.log("register success. " + id);
        });
        peer.on('call', function (call) {
            call.answer(localStream);
        });
        peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                var msg = JSON.parse(data);
                console.log(msg);
                //收到视频邀请时，弹出询问对话框
                if (msg.action === "call") {
                    lblFrom.innerText = msg.from;
                    txtTargetId.value = msg.from;
                    $("#dialog-confirm").dialog({
                        resizable: false,
                        height: "auto",
                        width: 400,
                        modal: true,
                        buttons: {
                            "Accept": function () {
                                $(this).dialog("close");
                                sendMessage(msg.to, msg.from, "accept");
                            },
                            Cancel: function () {
                                $(this).dialog("close");
                            }
                        }
                    });
                }
                
                //接受视频通话邀请
                if (msg.action === "accept") {
                    console.log("accept call => " + JSON.stringify(msg));
                    var call = peer.call(hashCode(msg.from), localStream);
                    call.on('stream', function (stream) {
                        console.log('received remote stream');
                        remoteVideo.srcObject = stream;
                        sendMessage(msg.to, msg.from, "accept-ok");
                    });
                }

                //接受视频通话邀请后，通知另一端    
                if (msg.action === "accept-ok") {
                    console.log("accept-ok call => " + JSON.stringify(msg));
                    var call = peer.call(hashCode(msg.from), localStream);
                    call.on('stream', function (stream) {
                        console.log('received remote stream');
                        remoteVideo.srcObject = stream;                            
                    });
                }
                /////test////////////////////////
                else{
                    tdBox.innerHTML = tdBox.innerHTML += "<div class='align_right'>" + msg.from + "   enter the room." + "</div>";
                    if (txtTargetId.value.length == 0) {
                        txtTargetId.value = msg.from;
                    }
                }
                ///test///////////////////////////
            });
        });
    }
}

    btnCall.onclick = function () {
        if (txtTargetId.value.length == 0) {
            alert("please input target name");
            txtTargetId.focus();
            return;
        }
        sendMessage(txtSelfId.value, txtTargetId.value, "call");
    }
    ///test part/////////////////////////////////////////////////////////////////////////////////
    btnSend.onclick = function () {
        //消息体
        var message = { "from": txtSelfId.value, "to": txtTargetId.value, "body": txtMsg.value };
        if (!localConn) {
            if (txtTargetId.value.length == 0) {
                alert("please input target name");
                txtTargetId.focus();
                return;
            }
            if (txtMsg.value.length == 0) {
                alert("please input message");
                txtMsg.focus();
                return;
            }

            //创建到对方的连接
            /*localConn = peer.connect(hashCode(txtTargetId.value));
            localConn.on('open', () => {
                //首次发送消息
                mess(message);
            });*/
        }

        //发送消息
        if (localConn.open) {
            mess(message);
        }
    }

    /*test part */////////////////////////////////////////////////////////////////////
    videoSelect.onchange = start;

    start();
}

