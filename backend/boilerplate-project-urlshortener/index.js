require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
let bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  const urlRegex = /^https?:\/\/(www\.)?[\w-]+\.[a-z]{2,4}/gi;
  if (!urlRegex.test(url)) {
    res.json({ error: "invalid url" });
  } else {
    const hostname = new URL(url).hostname;
    dns.lookup(hostname, (err) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        const shortUrl = urlDatabase.length + 1;
        urlDatabase.push({ shortUrl, url });
        res.json({ original_url: url, short_url: shortUrl });
      }
    });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const urlEntry = urlDatabase.find((entry) => entry.shortUrl == shortUrl);
  if (urlEntry) {
    res.redirect(urlEntry.url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
