const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

let mediaRecorder;
let recordedChunks = [];

// Request camera access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    video.srcObject = stream;

    // Set up MediaRecorder
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Create video file
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');

      // Send video to backend
      fetch('https://your-backend-url.com/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert('Video uploaded successfully!');
          console.log(data);
        })
        .catch((error) => {
          console.error('Error uploading video:', error);
        });
    };
  })
  .catch((error) => {
    console.error('Error accessing camera:', error);
    alert('Camera access is required to use this app.');
  });

// Start recording
startBtn.addEventListener('click', () => {
  recordedChunks = [];
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

// Stop recording
stopBtn.addEventListener('click', () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});
