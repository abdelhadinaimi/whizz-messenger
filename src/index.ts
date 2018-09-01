import bodyParser from 'body-parser';
import express, { Request, Response } from "express";

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

app.listen(PORT, () => {
  console.log('Node app is running on port', PORT);
});
