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

// Webhook that recieves and replies to inbound SMS messages
exports.inboundSMS = functions.https.onRequest(async (request, response) => {
	const sender = request.body.From;
	const address = await getAddress(sender);
	if (address) {
		const body = request.body.Body.toUpperCase();
		const reply = new MessagingResponse();
		switch (body) {
			case 'BALANCE':
				;
				break;
			case 'ALERTS':
				;
				break;
			case 'TRIGGER':
				reply.message(`This command will trigger a pre-signed transaction after asking you for confirmation. (Not yet implemented.)`);
				break;
			default:
				reply.message(`That query is not supported... Reply with BALANCE, ALERTS, or TRIGGER to manage your CB Wallet account, or HELP for help.`);
		}
		return response.type("text/xml").send(reply.toString());
	}
	response.sendStatus(401); // Only registered users can use the service
});

exports.helloServer = functions.https.onRequest((request, response) => { 
  // When our twilio number recienves an inbound SMS
  const twiml = new MessagingResponse();
  // Our backend responds with:
  twiml.message("The Robots are coming! Head for the hills!");
  response.type("text/xml").send(twiml.toString());
});

// Get Ethereum addresss associated with a phone number
// Returns undefined if sender doesn't have a Safari Text account
async function getAddress(phoneNumber) {
	const accountsRef = admin.firestore().collection("accounts"); 
	const snapshot = await accountsRef.where("phoneNumber", "==", phoneNumber).get();
	if (snapshot.empty) {
		return undefined;
	}
	// TODO: Deal with case where a phone number is linked to multiple accounts
	for (doc of snapshot.docs) {
		return doc.data().address;
	}
}