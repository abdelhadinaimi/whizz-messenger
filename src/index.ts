import bodyParser from 'body-parser';
import dotenv from "dotenv";
import express from "express";
import logger from "morgan";

import webhooks from './routes/webhooks';

/* Pre Init */
if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

/* Initializations */
const app = express();
const PORT = process.env.PORT || 3000;


/* Middlewares */
app.use(logger("dev"));


/* Parsers */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


/* Routes */
app.use("/webhook",webhooks);


/* Port */
app.listen(PORT, () => {  
  console.log('Node app is running on port', PORT);
});


export default app;