//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

const chatWindow = document.querySelector("#chatwindow");
const subButton = document.querySelector("#submitbutton");

function getText() {
	const job_url = "https://jntbmmdzhi.execute-api.us-east-1.amazonaws.com/prod/upload-transcribe/{object}";

	// Start transcribe job
	fetch(job_url,{method: "GET"})
	.then((res) => res.json())
	.then((data) => {

		// set job_name globally
		const job_name = data.body
		console.log("Processing Transcribe Job");
		setTimeout(function(){
				console.log("Sending Request");
				const s3_url = "https://823mdaf6hg.execute-api.us-east-1.amazonaws.com/prod"
				const data = {"jobName": job_name}

				// search s3 for transcribed text
				fetch(s3_url,{
					method: "post",
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify(data)
				})
				.then((result) => result.json())
				.then((data) => {
					console.log(data);
					chatWindow.value += "Transcribed Text: "+ data.body + "\n\n";
				})
				chatWindow.scrollTo(0, chatWindow.scrollHeight);
	},75000)
	})
}


function startRecording() {
	console.log("startRecording() called")

  var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

		audioContext = new AudioContext();

		//assign to gumStream for later use
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		recorder = new WebAudioRecorder(input, {
		  workerDir: "js/", // must end with slash
		  encoding: "mp3",
		  numChannels:2, //2 is the default, mp3 encoding supports only 2
		  onEncoderLoading: function(recorder, encoding) {
		    // show "loading encoder..." display
		    console.log("Loading "+encoding+" encoder...");
		  },
		  onEncoderLoaded: function(recorder, encoding) {
		    // hide "loading encoder..." display
		    console.log(encoding+" encoder loaded");
		  }
		});

		recorder.onComplete = function(recorder, blob) {
			console.log;("Encoding complete");

			fetch("https://jntbmmdzhi.execute-api.us-east-1.amazonaws.com/prod/upload-transcribe/demo_recording.mp3",{
					method:"put",
					headers:{"content-type":"audio/mpeg"},
					// headers:{"content-type":"audio/wav"},
					body: blob
			}).then(resp => console.log(resp));

			getText()

			createDownloadLink(blob,recorder.encoding);
			// encodingTypeSelect.disabled = false;
		}

		recorder.setOptions({
		  timeLimit:120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();

		 __log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;

	});

	//disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
	console.log("stopRecording() called");

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	stopButton.disabled = true;
	recordButton.disabled = false;

	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();

	__log('Recording stopped');
}

function createDownloadLink(blob,encoding) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//link the a element to the blob
	link.href = url;
	link.download = new Date().toISOString() + '.'+encoding;
	link.innerHTML = link.download;

	//add the new audio and a elements to the li element
	li.appendChild(au);
	li.appendChild(link);

	//add the li element to the ordered list
	recordingsList.appendChild(li);
}



//helper function
function __log(e, data) {
	log.innerHTML += "\n" + e + " " + (data || '');
}
