require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const morgan = require("morgan");
const app = express();
let bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev")); // Adiciona o middleware morgan

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware para registrar o corpo das requisições
app.use((req, res, next) => {
  console.log("Request Body:", req.body);
  next();
});

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let urlDatabase = [];

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  console.log(url);
  const hostname = new URL(url).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      const shortUrl = urlDatabase.length + 1;
      urlDatabase.push({ shortUrl: shortUrl, url: url });
      console.log(urlDatabase);
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find((entry) => entry.shortUrl === shortUrl);
  if (urlEntry) {
    res.redirect(urlEntry.url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
