import express from "express";
import { json } from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
require("log-timestamp");

import selenium_handler from "./selenium/selenium_handler";
// defining the Express app
const app = express();

// defining an array to work as the database (temporary solution)

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(json());

// enabling CORS for all requests
app.use(cors({ origin: "*" }));

// adding morgan to log HTTP requests
app.use(morgan("combined"));

// defining an endpoint to return all ads
app.get("/", (req, res) => {
  res.send(200);
});

app.get("/compare", async (req, res) => {
  var searchTerm: string = req.query.search!.toString();
  console.log(`Search Term:${searchTerm}`);
  if (searchTerm == undefined) res.send({ result: "Empty search term" });
  let amazon = await selenium_handler.aliResults(searchTerm!);
  /*   let [ali, amazon, ebay] = await Promise.all([
    selenium_handler.aliResults(searchTerm!),
    selenium_handler.amazonResults(searchTerm!),
    selenium_handler.ebayResults(searchTerm!),
  ]); */

  res.send([
    {
      name: "Amazon",
      products: amazon,
      cheap: amazon[0],
    },
    /*     {
      name: "AliExpress",
      products: ali,
      cheap: ali[0],
    },
    {
      name: "Ebay",
      products: ebay,
      cheap: ebay[0],
    }, */
  ]);
});

// starting the server
app.listen(process.env.PORT || 3001, () => {
  console.log(`listening on port ${process.env.PORT || 3001}`);
});
