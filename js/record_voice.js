function recordVoice(){

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        // store streaming data chunks in array
        const chunks = [];
        // create media recorder instance to initialize recording
        const recorder = new MediaRecorder(stream);
        // function to be called when data is received
        recorder.ondataavailable = e => {
          // add stream data to chunks
          chunks.push(e.data);
          // if recorder is 'inactive' then recording has finished
          if (recorder.state == 'inactive') {
              // convert stream data chunks to a 'webm' audio format as a blob
              const blob = new Blob(chunks, { type: 'audio/webm' });
              console.log(blob);
              //let form = new FormData();
              //form.append('file', blob, "audio.wav");

              fetch("https://jntbmmdzhi.execute-api.us-east-1.amazonaws.com/prod/upload-transcribe/test.webm",{
                  method:"put",
                  headers:{"content-type":"audio/webm"},
                  body: blob
              }).then(resp => console.log(resp));

          }
        };

        // start recording with 1 second time between receiving 'ondataavailable' events
        recorder.start(1000);
        // setTimeout to stop recording after 4 seconds
        setTimeout(() => {
            // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
            recorder.stop();
        }, 4000);
      })
      .catch(console.error);
}
