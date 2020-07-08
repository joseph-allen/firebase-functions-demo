const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const firebase = require("firebase");

admin.initializeApp();
const config = {
  apiKey: "AIzaSyDqOXXofN0ilKwuUIUUJKbdVMNDG2vbiEc",
  authDomain: "socialape-5c8fd.firebaseapp.com",
  databaseURL: "https://socialape-5c8fd.firebaseio.com",
  projectId: "socialape-5c8fd",
  storageBucket: "socialape-5c8fd.appspot.com",
  messagingSenderId: "554741402311",
  appId: "1:554741402311:web:680eb4357b2668659e4ce2",
  measurementId: "G-32L90R3RK1",
};
// Initialize Firebase
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/helloWorld", (request, response) => {
  response.send("Hello from Firebase!");
});

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      return res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  //   TODO: validate data
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
