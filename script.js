let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];

// DOM Elements
const preview = document.getElementById("preview");
const grantAccessButton = document.getElementById("grant-access");
const endSessionButton = document.getElementById("end-session");
const uploadStatus = document.getElementById("upload-status");

// Grant camera access
grantAccessButton.addEventListener("click", async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    preview.srcObject = mediaStream;
    endSessionButton.disabled = false;
    grantAccessButton.disabled = true;
    uploadStatus.textContent = "Camera access granted. You can record a video.";
  } catch (error) {
    alert("Unable to access the camera. Please check your permissions.");
    console.error("Error accessing camera:", error);
  }
});

// End session and record video
endSessionButton.addEventListener("click", () => {
  if (mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);

    // Collect video chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Stop recording and upload video
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
      uploadVideo(videoBlob); // Upload video to backend
      recordedChunks = [];
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
      endSessionButton.disabled = true;
    }, 5000); // Record for 5 seconds
  }
});

// Upload video to backend
async function uploadVideo(blob) {
  const formData = new FormData();
  formData.append("video", blob, "session-video.webm");

  try {
    const response = await fetch("https://your-backend-url/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      uploadStatus.textContent = "Video uploaded successfully!";
    } else {
      uploadStatus.textContent = "Failed to upload video.";
    }
  } catch (error) {
    uploadStatus.textContent = "Error uploading video. Check console.";
    console.error("Upload error:", error);
  }
}
