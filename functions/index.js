/* eslint-disable */

// Loads environment variables from .env file
require("dotenv").config();

// Cloud Functions SDK to create Cloud Functions and set up triggers
const functions = require("firebase-functions");

// Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Twilio helper library for creating and recieving SMS notifications
const twilio = require("twilio")();
const MessagingResponse = require("twilio").twiml.MessagingResponse;

// Ethers.js library to query the etheruem blockhain
const ethers = require("ethers");
const provider = new ethers.providers.getDefaultProvider();

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
		const body = request.body.Body.toUpperCase().trim();
		const reply = new MessagingResponse();
		switch (body) {
			case 'BALANCE':
				const balance = await provider.getBalance(address);
				reply.message(`Your Ethereum account has a balance of ${Number.parseFloat(ethers.utils.formatEther(balance)).toFixed(6)} ETH or ${(ethers.utils.formatEther(balance) * 1447.41).toFixed(2)} USD`);
				break;
			case 'ALERTS':
				reply.message(`This command will subscribe to Eth price alerts. Reply STOP to unsubscribe. (Not yet implemented.)`);
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
