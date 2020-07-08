const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
admin.initializeApp();

app.get("/helloWorld", (request, response) => {
  response.send("Hello from Firebase!");
});

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
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
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

exports.api = functions.https.onRequest(app);