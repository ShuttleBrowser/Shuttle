const settings = require("electron-settings");
const $ = require("jquery");
const firebase = require("firebase");

const signUpBtn = document.getElementById('signUpBtn');
const signBtn = document.getElementById('signBtn');

if (settings.get('userId')) {
	location.replace(`http://localhost?userid=${settings.get('userId')}&password=${settings.get('password')}`);
}

$(' #signUpBtn ').hide();
$(' #signIn-Text ').hide();
$(' #repassword ').hide();
document.getElementById('title-auth').innerHTML = "sign-in";


// Initialize Firebase
const config = {
  apiKey: "AIzaSyDNkot4KwDdTLtz5fcpOy6HwW4ZtpKE2x4",
  authDomain: "shuttle-wb.firebaseapp.com",
  databaseURL: "https://shuttle-wb.firebaseio.com",
  projectId: "shuttle-wb",
  storageBucket: "shuttle-wb.appspot.com",
  messagingSenderId: "436629298210"
};
firebase.initializeApp(config);

document.getElementById('GoToSignUp').addEventListener('click', () => {
	document.getElementById('title-auth').innerHTML = "sign-up";
	$(' #repassword ').show();
	$(' #signUp-Text ').hide();
	$(' #signIn-Text ').show();
	$(' #signUpBtn ').show();
	$(' #signInBtn ').hide();
});
document.getElementById('GoToSignIn').addEventListener('click', () => {
	document.getElementById('title-auth').innerHTML = "sign-in";
	$(' #repassword ').hide();
	$(' #signUp-Text ').show();
	$(' #signIn-Text ').hide();
	$(' #signUpBtn ').hide();
	$(' #signInBtn ').show();
});

signUpBtn.addEventListener('click', () => {
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  let repassword = document.getElementById('repassword').value;

  if (password == repassword) {
	  firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
	      alert("account created !");
			$(' .auth ').hide();
	      	settings.set('userId', user.uid);
	      	settings.set('password', password);
			fs.readFile(__dirname+"/data.json", 'utf8', (err, data) => {  
			    if (err) throw err;
			    console.log(data);
				writeUser(user.uid, data);
			});
			location.replace(`http://localhost?userid=${user.uid}&password=${password}`);
	  }).catch((error) => {
	    if(error != null) {
	      alert(error.message);
	      return;
	    }
	  });
  } else {
  	console.log("bad password");
  }

});

signInBtn.addEventListener('click', () => {
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
    $( ".auth" ).fadeOut(500);
	settings.set('userId', user.uid);
	settings.set('password', password);
	location.replace(`http://localhost?userid=${user.uid}&password=${password}`);
  }).catch((error) => {
    if(error != null) {
      alert(error.message);
      return;
    }
  });

});

function writeUser(userId, BkmsData) {
  firebase.database().ref('users/' + userId).set({
    BkmsData: BkmsData,
  });
}