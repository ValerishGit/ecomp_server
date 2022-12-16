"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("log-timestamp");
const selenium_handler_1 = __importDefault(require("./selenium/selenium_handler"));
// defining the Express app
const app = (0, express_1.default)();
// defining an array to work as the database (temporary solution)
// adding Helmet to enhance your Rest API's security
app.use((0, helmet_1.default)());
// using bodyParser to parse JSON bodies into JS objects
app.use((0, body_parser_1.json)());
// enabling CORS for all requests
app.use((0, cors_1.default)({ origin: "*" }));
// adding morgan to log HTTP requests
app.use((0, morgan_1.default)("combined"));
// defining an endpoint to return all ads
app.get("/", (req, res) => {
    res.send(200);
});
app.get("/compare", async (req, res) => {
    var searchTerm = req.query.search.toString();
    console.log(`Search Term:${searchTerm}`);
    if (searchTerm == undefined)
        res.send({ result: "Empty search term" });
    let [ali, amazon, ebay] = await Promise.all([
        selenium_handler_1.default.aliResults(searchTerm),
        selenium_handler_1.default.amazonResults(searchTerm),
        selenium_handler_1.default.ebayResults(searchTerm),
    ]);
    res.send([
        {
            name: "Amazon",
            products: amazon,
            cheap: amazon[0],
        },
        {
            name: "AliExpress",
            products: ali,
            cheap: ali[0],
        },
        {
            name: "Ebay",
            products: ebay,
            cheap: ebay[0],
        },
    ]);
});
app.get("/compare_2", async (req, res) => {
    var searchTerm = req.query.search?.toString();
    if (!searchTerm)
        res.send({ result: "Empty search term" });
    let [ebay, ali, amazon] = await Promise.all([
        selenium_handler_1.default.ebayResults(searchTerm),
        selenium_handler_1.default.aliResults(searchTerm),
        selenium_handler_1.default.amazonResults(searchTerm),
    ]);
    res.send([
        {
            name: "Amazon",
            products: amazon,
            cheap: amazon[0],
        },
        {
            name: "Ali",
            products: ali,
            cheap: ali[0],
        },
        {
            name: "Ebay",
            products: ebay,
            cheap: ebay[0],
        },
    ]);
});
// starting the server
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
});
