# API Géolocalisation

## Description

L'API Geolocation de l'objet Navigator en JavaScript permet aux applications web d'obtenir la localisation géographique d'un utilisateur à partir de son appareil.

Cette API est simple d'utilisation et fournit des fonctionnalités pour récupérer les coordonnées géographiques de l'appareil de l'utilisateur par le biais du GPS intégré, des signaux Wi-Fi, ou de l'adresse IP par exemple.

## Autorisation

Lorsque vous ferez appel aux méthodes de l'API Geolocation depuis votre application et selon les réglages mis en place par l'utilisateur, un pop-up apparaitra depuis le navigateur de l'utilisateur pour qu'il vous autorise ou vous refuse à accéder à ces données. Il convient donc de s'assurer que l'application prend bien en compte les cas où l'utilisateur refuse l'accès à la géolocalisation de l'appareil.

La mise en forme du message d'autorisation est à la charge du navigateur et dépend de ce dernier.

## Obteninr la position actuelle

On souhaite obtenir la localisation de l'utilisateur et l'afficher dans la console lorsque ce dernier actionnera le bouton dédié à cette fonction.

<code>index.html</code> _mise en place du bouton et du script_

```html
<div class="geo--buttons">
	<button id="geoInstantButton">Instannée</button>
	<!-- <button id="geoWatcherButton">Activer la géolocalisation en direct</button> -->
</div>

<script type="module" src="src/scripts/geo.js"></script>
```

<code>src/geo.js</code> _vérification de la prise en charge de la fonctionnalité géolocalisation puis mise en place de l'écouteur d'évenement sur le bouton_

```js
// au chargement de la page, on écoute le click sur les boutons pour activer la fonctionnalité demandée //
window.addEventListener("load", initGeolocalisation);

function initGeolocalisation() {
	// on vérifie si le service est disponible depuis le navigateur de l'utilisateur //
	if ("geolocation" in navigator) {
		console.log('La fonctionnalité "géolocalisation" est disponible !');
	} else {
		return console.log(
			'La fonctionnalité "géolocalisation" n\'est pas disponible !'
		);
	}

	// géolocalisation instantannée - bouton //
	document.querySelector("#geoInstantButton").addEventListener("click", getGeo);
}
```

<code>src/geo.js</code> _la méthode .getCurrentPosition()_

```js
// les options pour paramétrer les méthodes de géolocalisation //
const options = {
	// un booléen qui indique si une précision élevée est requise //
	enableHighAccuracy: false,
	// un entier qui exprime la durée, en millisecondes, avant que la fonction de rappel error soit appelé. Si cette propriété vaut 0, la fonction d'erreur ne sera jamais appelée //
	timeout: 15000,
	// un entier qui exprime une durée en millisecondes ou l'infini pour indiquer la durée maximale pendant laquelle mettre en cache la position //
	maximumAge: 0,
};

function getGeo() {
	// .getCurrentPosition peut recevoir 3 arguments, seul le 1ier est obligatoire //
	navigator.geolocation.getCurrentPosition(
		// callback si la géolocalisation a réussit, reçoit la position //
		getGeoResolve,
		// callBack si la géolocalisation a échouée, reçoit une erreur //
		getGeoReject,
		// options, cf plus haut //
		options
	);
}
```

<code>src/geo.js</code> _en cas de succès_

```js
// callback en cas de réussite de géolocalisation //
function getGeoResolve(position) {
	console.log("Position actuelle : ", position);
}
```

<code>src/geo.js</code> _en cas de d'échec_

```js
// callback en cas d'échec de géolocalisation //
function getGeoReject(error) {
	console.log(
		"Une erreur est survenue lors de la récupération de la position : ",
		error.message
	);

	// voici les codes erreur possibles //
	switch (error.code) {
		case "0":
			console.log("Erreur d'origine inconnue !");
			break;
		case "1":
			console.log("L'utilisateur n'a pas accepté l'utilisation du service !");
			break;
		case "2":
			console.log("La géolocalisation de l'appareil n'est pas disponible !");
			break;
		case "3":
			console.log("Timeout trop court !");
			break;
	}
}
```

En cas de réussite, l'objet <code>position</code> reçu dans la callback est construit de cette manière :

![L'objet gelocationPosition](/public/images/gelocationPosition_object%202024-03-18%20143209.png)

## Mettre à jour la position en direct

Nous avons la possibilité d'écouter les changements de positions de l'utilisateur et d'y réagir à chaque occurence en déclenchant une fonction en réponse.

Nous utiliserons un 2ieme bouton pour soit mettre en route la fonctionnalité, soit y mettre fin.

<code>index.html</code> _mise en place du 2ieme bouton_

```html
<div class="geo--buttons">
	<button id="geoInstantButton">Instannée</button>
	<button id="geoWatcherButton">Activer la géolocalisation en direct</button>
</div>

<script type="module" src="src/scripts/geo.js"></script>
```

<code>src/geo.js</code> _mise en place de l'écouteur d'évenement sur le bouton_

```js
function initGeolocalisation() {
	// ... //

	// géolacalisation en direct - bouton //
	document
		.querySelector("#geoWatcherButton")
		.addEventListener("click", watchGeo);
}
```

Les objets <code>options</code> et fonctions <code>getGeoResolve()</code> et <code>getGeoReject()</code> sont les même que dans le chapitre précédent.

On utilise la variable <code>geoWatcher</code> pour stoquer l'écouteur d'évenement qui nous permettra de suivre les déplacement de l'utilisateur. Cette variable nous permet de vérifier s'il est déjà en route ou non et agir en concéquence, et aussi de le désactiver lorsque nécessaire.

<code>src/geo.js</code> _initialisation de <code>geoWatcher</code> et choix entre activer ou désactiver le service_

```js
// initialisation de l'état de l'écouteur d'évenement //
let geoWatcher = null;

// on active ou désactive le watcher selon la situation actuelle //
function watchGeo() {
	if (geoWatcher) {
		setButtonOn();
		removeGeoWatcher();
	} else {
		setButtonOff();
		setupGeoWatcher();
	}
}
```

<code>src/geo.js</code> _on active le service_

```js
// activation du service //
function setupGeoWatcher() {
	// .watchPosition peut recevoir 3 arguments, seul le 1ier est obligatoire //
	// on place l'écouteur d'évenement dans la variable initialisée plus tôt pour pouvoir désactiver le service si besoin //
	geoWatcher = navigator.geolocation.watchPosition(
		// callback si la géolocalisation a réussit, reçoit la position //
		getGeoResolve,
		// callBacksi la géolocalisation a échouée, reçoit une erreur //
		getGeoReject,
		// options, cf plus haut //
		options
	);
}
```

<code>src/geo.js</code> _on desactive le service_

```js
// arret du service //
function removeGeoWatcher() {
	// .clearWatch() permet de stoper l'écouteur d'évenement, ilprend en argument ce dernier //
	navigator.geolocation.clearWatch(geoWatcher);
	// on réinitialise l'état de l'écouteur d'évenement //
	geoWatcher = undefined;
	console.log("La détéction des changements de position est désactivée !");
}
```

<code>src/geo.js</code> _on modifie l'affichage du bouton selon la situation_

```js
// modification de l'affichage du bouton //
function setButtonOn() {
	document.querySelector("#geoWatcherButton").innerHTML =
		"Activer la géolocalisation en direct";
}

function setButtonOff() {
	document.querySelector("#geoWatcherButton").innerHTML =
		"Désctiver la géolocalisation en direct";
}
```

![Le console nous indique que la position à été modifiée](/public/images/geolocation_watcher_console%202024-03-18%20145721.png)
