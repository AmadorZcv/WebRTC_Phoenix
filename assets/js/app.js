// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html";

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket, { channelJoined as channel } from "./socket";
let localStream, peerConnection;
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let connectButton = document.getElementById("connect");
let callButton = document.getElementById("call");
let hangupButton = document.getElementById("hangup");
console.log("Chaneel é", channel);
hangupButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
hangupButton.onclick = hangup;

function gotStream(stream) {
  console.log("Received local stream");
  console.log(document.getElementById("localVideo"));
  localVideo.src = stream;
  localStream = stream;
  setupPeerConnection();
}
function gotLocalIceCandidate(event) {
  if (event.candidate) {
    console.log("Local ICE candidate: \n" + event.candidate.candidate);
    console.log("Channel tem push?", channel);
    channel.push("message", {
      body: JSON.stringify({
        candidate: event.candidate
      })
    });
  }
}
function setupPeerConnection() {
  connectButton.disabled = true;
  callButton.disabled = false;
  hangupButton.disabled = false;
  console.log("Waiting for call");

  let servers = {
    iceServers: [
      {
        url: "stun:stun.example.org"
      }
    ]
  };

  peerConnection = new RTCPeerConnection(servers);
  console.log("Created local peer connection");
  peerConnection.onicecandidate = gotLocalIceCandidate;
  peerConnection.ontrack = function(event) {
    remoteVideo.srcObject = event.streams[0];
  };
  peerConnection.addStream(localStream);
  console.log("Added localStream to localPeerConnection");
}
function call() {
  callButton.disabled = true;
  console.log("Starting call");
  peerConnection.createOffer(gotLocalDescription, handleError);
}
function gotLocalDescription(description) {
  peerConnection.setLocalDescription(
    description,
    () => {
      channel.push("message", {
        body: JSON.stringify({
          sdp: peerConnection.localDescription
        })
      });
    },
    handleError
  );
  console.log("Offer from localPeerConnection: \n" + description.sdp);
}
function gotRemoteDescription(description) {
  console.log("Answer from remotePeerConnection: \n" + description.sdp);
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(description.sdp))
    .then(() => {
      peerConnection
        .createAnswer()
        .then(answer => gotLocalDescription(answer))
        .catch(error => handleError(error));
    });
}
function gotRemoteStream(event) {
  remoteVideo.src = event.stream;
  console.log("Received remote stream");
}

function handleError(error) {
  console.log(error.name + ": " + error.message);
}
function connect() {
  console.log("Requesting local stream");
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then(stream => {
      console.log("Here", stream);
      gotStream(stream);
    })
    .catch(error => {
      console.log("getUserMedia error: ", error);
      console.log("Code", error.message, "Message", error.message);
    });
}
function gotRemoteIceCandidate(event) {
  callButton.disabled = true;
  if (event.candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    console.log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}
channel.on("message", payload => {
  let message = JSON.parse(payload.body);
  console.log("Messagé é", message);
  if (message.sdp) {
    gotRemoteDescription(message);
  } else {
    gotRemoteIceCandidate(message);
  }
});
