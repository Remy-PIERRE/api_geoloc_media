// INITIALISATION DU SERVICE //

// au chargement de la page, on écoute le click sur les boutons pour activer la fonctionnalité demandée //
window.addEventListener("load", initMedia);

function initMedia() {
	if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
		console.log('La fonctionnalité "media" est disponible !');
	} else {
		console.log('La fonctionnalité "media" n\'est pas disponible !');
	}

	// camera - bouton //
	document
		.querySelector("#mediaCameraButton")
		.addEventListener("click", handleCamera);

	// photo - bouton //
	document
		.querySelector("#mediaPhotoButton")
		.addEventListener("click", handlePhoto);
}

// GESTION DE LA CAMERA //

// initialisation de l'état stream //
let stream = null;

function handleCamera() {
	if (stream) {
		setButtonOn();
		stopStream();
	} else {
		setButtonOff();
		startStream();
	}
}

// activation de la camera //
async function startStream() {
	stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	});

	displayCamera();
}

// affichage de l'image dans l'application //
function displayCamera() {
	if (stream) {
		const video = document.querySelector("#mediaVideo");
		video.srcObject = stream;
		video.play();
	}
}

// désactivation de la camera //
function stopStream() {
	if (stream) {
		const videoTrack = stream.getVideoTracks()[0];
		videoTrack.stop();
		stream = null;
	}
}

// modification de l'affichage du bouton //
function setButtonOn() {
	document.querySelector("#mediaCameraButton").innerHTML = "Activer la camera";
}

function setButtonOff() {
	document.querySelector("#mediaCameraButton").innerHTML =
		"Désctiver la camera";
}

// GESTION DE LA PHOTO //

function handlePhoto() {
	if (stream) {
		const canvas = document.querySelector("#canvas");
		const video = document.querySelector("#mediaVideo");
		const photo = document.querySelector("#mediaPhoto");

		const { width, height } = getVideoDimensions();
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		context.drawImage(video, 0, 0, width, height);
		const data = canvas.toDataURL("image/png");

		photo.setAttribute("src", data);
	}
}

function getVideoDimensions() {
	const video = document.querySelector("#mediaVideo");
	return video.getBoundingClientRect();
}
