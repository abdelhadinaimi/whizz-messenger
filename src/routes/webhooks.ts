import express, { Request, Response } from "express";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {  
  
  const body = req.body;
  
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry: any) => {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      if(entry){
        const webhookEvent = entry.messaging[0];
        console.log(webhookEvent);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

/**
 * Used so that Facebook can check that this is the right webhook location
 */
router.get("/", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === process.env.WEBHOOK_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

export default router;
