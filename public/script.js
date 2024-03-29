const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');


navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) =>{
        localVideo.srcObject = stream;

        const peerconnection = new RTCPeerConnection();


        stream.getTracks().forEach((track)=>{
            peerconnection.addTrack(track, stream);
        });

        peerconnection.ontrack=(event)=>{
            remoteVideo.srcObject=event.streams[0];
        };


        socket.on('offer', (data)=>{
            peerconnection.setRemoteDescription(data.offer);
            peerconnection.createAnswer()
                .then((answer)=>{
                    peerconnection.setLocalDescription(answer);
                    socket.emit('answer', {answer});
                });
        });

        socket.on('answer', (data)=>{
            peerconnection.setRemoteDescription(data.answer);
        });

        socket.on('icecandidate', (data) =>{
            peerconnection.addIceCandidate(data.candidate);
        });


        peerconnection.createOffer()
            .then((offer)=>{
                peerconnection.setLocalDescription(offer);
                socket.emit('offer', {offer});
            });
    })
    .catch((error)=>{
        console.log('Error accessing media devices:', error);
    });
