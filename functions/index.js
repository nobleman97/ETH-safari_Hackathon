// Loads environment variables from .env file
require('dotenv').config()

// Cloud Functions SDK to create Cloud Functions and set up triggers
const functions = require("firebase-functions");

// Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Twilio helper library for creating and recieving SMS notifications
const twilio = require("twilio")();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Listens for new accounts added to /accounts/:documentId
// and sends an onboarding SMS to the associated phone numbers
exports.addAccount = functions.firestore.document("/accounts/{documentId}")
	.onCreate((snap, context) => {
		const { phoneNumber } = snap.data();
		return twilio.messages
			.create({
				body: "Welcome to Safari Text! Reply with BALANCE, ALERTS, or TRIGGER to manage your CB Wallet account, or HELP for help.",
				from: `${process.env.TWILIO_PHONE_NUMBER}`,
				to: `${phoneNumber}`
			})
			.catch(error => console.log(error));
	});


exports.helloServer = functions.https.onRequest((request, response) => { 
  // When our twilio number recienves an inbound SMS
  const twiml = new MessagingResponse();
  // Our backend responds with:
  twiml.message("The Robots are coming! Head for the hills!");
  response.type("text/xml").send(twiml.toString());
});