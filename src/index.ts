import bodyParser from 'body-parser';
import dotenv from "dotenv";
import express from "express";
import logger from "morgan";

import webhooks from './routes/webhooks';
// import { compilePattern } from './utils/commandCompiler';
import { regex } from './utils/constants';

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
  const command = "wait for {number:} in? {string:|hello}";
  for(let i = 0; i < 5; i++){
    console.log(regex.PATTERN_MATCH.test(command));

  }
  // compilePattern("wait for {number:} in? {string:|hello}").then(e => console.log(e));
  // compilePattern("wait for {number:} in? {string:|hello}").then(e => console.log(e));

  console.log('Node app is running on port', PORT);
});


export default app;