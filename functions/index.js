require('dotenv').config()

const functions = require("firebase-functions");

const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

exports.helloWorld = functions.https.onRequest((request, response) => {
	// Print to cloud functions logger
  functions.logger.info("Hello logs!", {structuredData: true});
	// Send sms to MY_PHONE_NUMBER using Twilio's client
	twilio.messages
		.create({
			body: "Hello from Firebase! (sms)",
			from: "+18146793741",
			to: `${process.env.MY_PHONE_NUMBER}`
		})
		.then(message => console.log(message.sid))
		.done();
	// Send message in HTTP response body
  response.send("Hello from Firebase! (API response)");
});
