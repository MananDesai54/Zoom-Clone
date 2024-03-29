const socket = io('/');

const myPeer = new Peer({
    host:'/',
    port:'5001'
});

const peers = {

}

const videoGrid = document.querySelector('.video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVideoStream(myVideo,stream);

    myPeer.on('call',call=>{
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream);
        })
    })

    socket.on('user-connected',userId=>{
        connectToNewUser(userId,stream);
    });
});

function connectToNewUser(userId,stream) {
    const call = myPeer.call(userId,stream);
    const video = document.createElement('video');
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream);
    });
    call.on('close',()=>{
        video.remove();
    })
    peers[userId] = call;
}

function addVideoStream(video,stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
        videoGrid.appendChild(video);
    })
}

socket.on('user-disconnected',userId=>{
    console.log(userId);
    if(peers[userId])
        peers[userId].close();
})

myPeer.on('open',(id)=>{
    socket.emit('join',ROOM_ID,id);
});

// socket.on('user-connected',userId => {
//     console.log(userId,'connected');
// })