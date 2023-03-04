const useDataChannel = true;
const localVideo = document.getElementById('local_video');
const remoteVideo = document.getElementById('remote_video');
const remoteAudio = document.getElementById('remote_audio');
let localStream = null;
let peerConnection = [];
let dataChannel = null;
const senders = [];
var conCount = 0;

// --- prefix -----
navigator.getDisplayMedia  = navigator.getDisplayMedia    || navigator.webkitGetDisplayMedia ||
                          navigator.mozGetDisplayMedia || navigator.msGetDisplayMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

function _logStream(msg, stream) {
  console.log(msg + ': id=' + stream.id);
  let videoTracks = stream.getVideoTracks();
  if (videoTracks) {
    console.log('videoTracks.length=' + videoTracks.length);
    videoTracks.forEach(function(track) {
      console.log(' track.id=' + track.id);
    });
  }
}

// ---------------------- media handling -----------------------

function isUseVideo() {
  // let useVideo = document.getElementById('use_video').checked;

  return useVideo;
}

function isSendOnly() {
  return false;
}

function isAutoSendSDP() {
  //let sendAudo = document.getElementById('send_auto').checked;
  return sendAudo;
}

// start local video
function startVideo() {
  let useVideo = true;
  if ( (! useVideo) && (! useAudio) ) {
    console.warn('NO media to capture');
    return;
  }

  if(localStream){
    return;
  }

  getDeviceStream({ video: {cursor: "always"},audio: false}) // audio: false
  .then(function (stream) { // success
    logStream('localStream', stream);
    localStream = stream;
    playVideo(localVideo, stream);
  }).catch(function (error) { // error
    console.error('getDisplayMedia error:', error);
    return;
  });
}

// stop local video
function stopVideo() {
  pauseVideo(localVideo);
  stopLocalStream(localStream);
}

function stopLocalStream(stream) {
  let tracks = stream.getTracks();
  if (! tracks) {
    console.warn('NO tracks');
    return;
  }

  for (let track of tracks) {
    track.stop();
  }
}

function logStream(msg, stream) {
  console.log(msg + ': id=' + stream.id);

  var videoTracks = stream.getVideoTracks();
  if (videoTracks) {
    console.log('videoTracks.length=' + videoTracks.length);
    for (var i = 0; i < videoTracks.length; i++) {
      var track = videoTracks[i];
      console.log('track.id=' + track.id);
    }
  }

  var audioTracks = stream.getAudioTracks();
  if (audioTracks) {
    console.log('audioTracks.length=' + audioTracks.length);
    for (var i = 0; i < audioTracks.length; i++) {
      var track = audioTracks[i];
      console.log('track.id=' + track.id);
    }
  }
}

function getDeviceStream(option) {
  if ('getDsplayMedia' in navigator.mediaDevices) {
    console.log('navigator.mediaDevices.getDisplayMedia');
    return navigator.mediaDevices.getDisplayMedia(option);
  }
  else {
    console.log('wrap navigator.getDisplayMedia with Promise');
    return navigator.mediaDevices.getDisplayMedia(option);
  }
}

function playVideo(element, stream) {
  if ('srcObject' in element) {
    if (! element.srcObject) {
      element.srcObject = stream;
    }
    else {
      console.log('stream alreay playnig, so skip');
    }
  }
  else {
    element.src = window.URL.createObjectURL(stream);
  }

  console.log('stream playnig');
  element.play();
  element.volume = 0;

  addTrack('video');
}

function pauseVideo(element) {
  element.pause();
  if ('srcObject' in element) {
    element.srcObject = null;
  }
  else {
    if (element.src && (element.src !== '') ) {
      window.URL.revokeObjectURL(element.src);
    }
    element.src = '';
  }
}

// ----- hand signaling ----
function onSdpText(value) {
  let text = value;
  if (peerConnection[conCount]) {
    console.log('Received answer text...');
    description = new RTCSessionDescription({
      type : 'answer',
      sdp : text,
    });
    setAnswer(description);
    //}
  }
  else {
    ++conCount;
    console.log('Received offer text...');
    let offer = new RTCSessionDescription({
      type : 'offer',
      sdp : text,
    });
    preparePeerAndSetOffer(offer);
  }
  return
}

function sendSdp(sessionDescription) {
  console.log('---sending sdp ---');
  let action = {room:login_number, type: "offer", sdp:sessionDescription.sdp};
  socket.emit('rtc_connection', action);
}

function copySdp() {
  // textForSendSdp.focus();
  // textForSendSdp.select();
  document.execCommand('copy');
}

function _trimTailDoubleLF(str) {
  const trimed = str.trim();
  return trimed + String.fromCharCode(13, 10);
}

function sendSdpOverDataChannel(sessionDescription) {
  console.log('--- sending sdp over dataChannel --');
  if (! dataChannel) {
    return;
  }
  const str = JSON.stringify(sessionDescription);
  dataChannel.send(str);
}

// ---------------------- connection handling -----------------------
function prepareNewConnection(withDataChannel) {
  let pc_config = {"iceServers":[{"urls": "stun:stun.l.google.com:19302"}]};
  let peer = new RTCPeerConnection(pc_config);

  // --- on get remote stream ---
  if ('ontrack' in peer) {
    peer.ontrack = event =>  {
      console.log('-- peer.ontrack(): track kind=' + event.track.kind);
      let stream = event.streams[0];
      _logStream('ontrack stream', stream);
      if (event.streams.length > 1) {
        console.warn('got multi-stream, but play only 1 stream');
      }
      let track = event.track;
      if (track.kind === 'video') {
        playVideo(remoteVideo, stream);
      }
      else if (track.kind === 'audio') {
        playVideo(remoteAudio, stream);
        remoteAudio.volume = 0.5;
      }

      stream.onaddtrack = evt =>  {
        _logStream('stream.onaddtrack', stream);
        const track = evt.track;
        console.log('stream.onaddtrack(): track kind=', track.kind);
        if (track.kind === 'video') {
          playVideo(remoteVideo, stream);
        }
        else if (track.kind === 'audio') {
          playVideo(remoteAudio, stream);
          remoteAudio.volume = 0.5;
        }
      };
      stream.onremovetrack = evt => {
        _logStream('stream.onremovetrack', stream);
        const track = evt.track;
        console.log('stream.onremovetrack(): track kind=', track.kind);
        if (track.kind === 'video') {
          pauseVideo(remoteVideo);
        }
        else if (track.kind === 'audio') {
          pauseVideo(remoteAudio);
        }
      };
    };

    peer.onaddstream = event =>  {
      // -- log only --
      console.log('-- peer.onaddstream(), but do nothing');
    }
  }
  else {
    peer.onaddstream = event => {
      console.log('-- peer.onaddstream()');
      let stream = event.stream;
      playVideo(remoteVideo, stream);

      _logStream('onaddstream', stream);
    };
  }

  peer.onremovestream = event => {
    console.log('--- peer.onremovestream()');
    let stream = event.stream;
    _logStream('onremovestream', stream);
    stopRemoteMedia(stream);
  };

  // --- on get local ICE candidate
  peer.onicecandidate = evt => {
    if (evt.candidate) {
      console.log(evt.candidate);

      // Trickle ICE の場合は、ICE candidateを相手に送る
      // Vanilla ICE の場合には、何もしない
    } else {
      console.log('empty ice event');

      // Trickle ICE の場合は、何もしない
      // Vanilla ICE の場合には、ICE candidateを含んだSDPを相手に送る
      sendSdp(peer.localDescription);
    }
  };

  peer.onnegotiationneeded = evt => {
    console.log('onnegotiationneeded:', evt);

    if (! dataChannel) {
      return;
    }
    if ( (! peer.localDescription) || (! peer.localDescription.type) || (peer.localDescription.type === '')) {
      return;
    }
    if ( (! peer.remoteDescription) || (! peer.remoteDescription.type) || (peer.remoteDescription.type === '')) {
      return;
    }

    if (false) {
      return;
    }

    const options = {};
      peer.createOffer(options)
      .then(function (sessionDescription) {
        console.log('createOffer() succsess in promise');
        return peer.setLocalDescription(sessionDescription);
      }).then(function() {
        console.log('setLocalDescription() succsess in promise');

        // -- Trickle ICE の場合は、初期SDPを相手に送る --
        // -- Vanilla ICE の場合には、まだSDPは送らない --
        // -- 再生成の場合には、すぐに送る ---
        //sendSdp(peer.localDescription);
        sendSdpOverDataChannel(peer.localDescription);
      }).catch(function(err) {
        console.error(err);
      });
    //}
  };

  // -- add local stream --
  if (withDataChannel) {
    console.log('start for DataChannel');
    peer.ondatachannel = evt => {
      console.log('-- datachannel --');
      if (dataChannel) {
        console.warn('dataChannel ALREAY EXIST');
      }
      dc = evt.channel;
      setupDataChannel(dc);
      dataChannel = dc;
    }
  }

  return peer;
}

function prepareDataChannel(peer) {
  const dc = peer.createDataChannel("channel");
  setupDataChannel(dc);
  dataChannel = dc;
  return dc;
}

function setupDataChannel(dc) {
  dc.onmessage = evt => {
    const msg = evt.data;
    const obj = JSON.parse(msg);
    if (obj.type === 'text') {
      console.log('text Message over DataChannel:', msg);
    }
    else if (obj.type === 'offer') {
      console.log('--got offer over dataChannel--');
      const sendNow = true;
      setOffer(obj, sendNow);
    }
    else if (obj.type === 'answer') {
      console.log('--got answer over dataChannel--');
      setAnswer(obj);
    }
  };

  dc.onopen = evt => {
    console.log('datachannel open');
  };
  dc.onclose = evt => {
    dataChannel = null;
  };
  dc.onerror = evt => {
    console.error('DataChannel ERROR:', err);
  };
}

function preparePeerAndmakeOffer(withDataChannel) {
  let options = {};
  peerConnection[conCount] = prepareNewConnection(withDataChannel);
  if (withDataChannel) {
    prepareDataChannel(peerConnection[conCount]);
  }

  peerConnection[conCount].createOffer(options)
  .then(function (sessionDescription) {
    console.log('createOffer() succsess in promise');
    return peerConnection[conCount].setLocalDescription(sessionDescription);
  }).then(function() {
    console.log('setLocalDescription() succsess in promise');

    // -- Trickle ICE の場合は、初期SDPを相手に送る --
    // -- Vanilla ICE の場合には、まだSDPは送らない --
  }).catch(function(err) {
    console.error(err);
  });
}

function reSendOffer() {
  if (! peerConnection[conCount]) {
    console.warn('peerConnection[conCount] NOT READY');
    return;
  }

  const options = {};
  peerConnection[conCount].createOffer(options)
  .then(function (sessionDescription) {
    console.log('createOffer() succsess in promise');
    return peerConnection[conCount].setLocalDescription(sessionDescription);
  }).then(function() {
    console.log('setLocalDescription() succsess in promise');

    // -- Trickle ICE の場合は、初期SDPを相手に送る --
    // -- Vanilla ICE の場合には、まだSDPは送らない --
    // -- 再送の場合には、すぐに送る
    sendSdpOverDataChannel(peerConnection[conCount].localDescription);
  }).catch(function(err) {
    console.error(err);
  });
}

function preparePeerAndSetOffer(sessionDescription) {
  const useDataChannel = true;
  if (peerConnection[conCount]) {
    console.error('peerConnection[conCount] alreay exist!');
  }
  peerConnection[conCount] = prepareNewConnection(useDataChannel);

  const sendNow = false;
  setOffer(sessionDescription, sendNow);
}

function setOffer(sessionDescription, sendNow) {
  peerConnection[conCount].setRemoteDescription(sessionDescription)
  .then(function() {
    console.log('setRemoteDescription(offer) succsess in promise');
    makeAnswer(sendNow);
  }).catch(function(err) {
    console.error('setRemoteDescription(offer) ERROR: ', err);
  });
}

function makeAnswer(sendNow) {
  console.log('sending Answer. Creating remote session description...' );
  if (! peerConnection[conCount]) {
    console.error('peerConnection[conCount] NOT exist!');
    return;
  }

  let options = {};

  peerConnection[conCount].createAnswer(options)
  .then(function (sessionDescription) {
    console.log('createAnswer() succsess in promise');
    return peerConnection[conCount].setLocalDescription(sessionDescription);
  }).then(function() {
    console.log('setLocalDescription() succsess in promise');

    // -- Trickle ICE の場合は、初期SDPを相手に送る --
    // -- Vanilla ICE の場合には、まだSDPは送らない --
    if (sendNow) {
      sendSdpOverDataChannel(peerConnection[conCount].localDescription);
    }
  }).catch(function(err) {
    console.error(err);
  });
}

function setAnswer(sessionDescription) {
  if (! peerConnection[conCount]) {
    console.error('peerConnection[conCount] NOT exist!');
    return;
  }

  peerConnection[conCount].setRemoteDescription(sessionDescription)
  .then(function() {
    console.log('setRemoteDescription(answer) succsess in promise');

    startVideo();
  }).catch(function(err) {
    console.error('setRemoteDescription(answer) ERROR: ', err);
  });
}

// start PeerConnection
function connect(withDataChannel) {
  if (! peerConnection[conCount]) {
    console.log('make Offer');
    ++conCount;
    preparePeerAndmakeOffer(withDataChannel);
  }
  else {
    console.warn('peer already exist.');
  }
}

// close PeerConnection
function hangUp() {
  if (peerConnection[conCount]) {
    console.log('Hang up.');
    peerConnection[conCount].close();
    peerConnection[conCount] = null;
    pauseVideo(remoteVideo);
  }
  else {
    console.warn('peer NOT exist.');
  }
}

function sendData(data) {
  if (dataChannel) {
    const str = JSON.stringify(data);
    dataChannel.send(str);
  }
}

function addTrack(kind) {
  if (! localStream) {
    return;
  }
  if (! peerConnection[conCount]) {
    return;
  }

  let track = null;
  if (kind === 'video') {
    track = localStream.getVideoTracks()[0];
  }
  else if (kind === 'audio') {
    track = localStream.getAudioTracks()[0];
  }

  // let sender = peerConnection[conCount].addTrack(track); // another stream in chrome, error in firefox
  let sender = peerConnection[conCount].addTrack(track, localStream); // same stream
  senders[kind] = sender;
}

function removeTrack(kind) {
  console.log('removing track kind=' + kind);
  if (! localStream) {
    return;
  }
  if (! peerConnection[conCount]) {
    return;
  }

  let sender = senders[kind];
  if (sender) {
    peerConnection[conCount].removeTrack(sender);
    delete senders[kind];
    sender = null;
  }
  else {
    console.warn('NO sender for kind=' + kind);
  }
}

function stopRemoteMedia(stream) {
  if (! stream) {
    return;
  }

  if (remoteVideo.srcObject && (remoteVideo.srcObject.id === stream.id) ) {
    console.log('--stop remote video streamid=' + stream.id);
    pauseVideo(remoteVideo);
  }

  if (remoteAudio.srcObject && (remoteAudio.srcObject.id === stream.id) ) {
    console.log('--stop remote audio streamid=' + stream.id);
    pauseVideo(remoteAudio);
  }
}

document.getElementById("start-capturing").addEventListener('click', async () => {
  await connect(true);
});
