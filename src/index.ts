import bodyParser from 'body-parser';
import express, { Request, Response } from "express";
import secrets from "./secrets.json";
const app = express();

const PORT = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get("/", (req,res) => {
  console.log("Got Home");
});

app.post('/webhook', (req : Request, res : Response) => {  
  console.log("Getting request from", req.ip);
  
  const body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry : any) => {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = secrets.FACEBOOK_VERIFY_TOKEN;
    
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.listen(PORT, () => {
  console.log('Node app is running on port', PORT);
});
