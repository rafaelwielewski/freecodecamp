const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const moment = require("moment");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];

app.post("/api/users", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const _id = (users.length + 1).toString();
  const user = { username: username, _id: _id };
  users.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  console.log(req.body);
  const userId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration); // Converte duration para número
  const user = users.find((user) => user._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const date = req.body.date
    ? moment(req.body.date).format("ddd MMM DD YYYY")
    : moment().format("ddd MMM DD YYYY");
  const exercise = {
    description: description,
    duration: duration,
    date: date,
  };
  exercises.push({ ...exercise, username: user.username, _id: userId });
  response = {
    username: user.username,
    description: description,
    duration: duration,
    date: date,
    _id: userId,
  };
  console.log(response);
  res.json(response);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const user = users.find((user) => user._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let { from, to, limit } = req.query;
  from = from ? new Date(from) : new Date(0);
  to = to ? new Date(to) : new Date();

  let userExercises = exercises
    .filter((exercise) => exercise._id === userId)
    .filter((exercise) => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= from && exerciseDate <= to;
    })
    .map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    }));

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
