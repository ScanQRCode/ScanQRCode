var cameraFrame = document.createElement('iframe');
cameraFrame.src = "https://www.qingsong.plus/camera.html";
cameraFrame.frameBorder = '0';
cameraFrame.allow = 'camera;encrypted-media;'
document.body.appendChild(cameraFrame);
// navigator.mediaDevices.getUserMedia({ audio: false, video: true });
export {};