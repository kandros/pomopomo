import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyD7xvWywaq3y44gstYQLeiMAWFJGfD0PiE",
  authDomain: "pomopomo-bf97a.firebaseapp.com",
  databaseURL: "https://pomopomo-bf97a.firebaseio.com",
  projectId: "pomopomo-bf97a",
  storageBucket: "pomopomo-bf97a.appspot.com",
  messagingSenderId: "285806575217"
};

export default function initFirebase() {
  firebase.initializeApp(config);
}