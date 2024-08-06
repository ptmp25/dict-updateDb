const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// const { translate } = require("@vitalets/google-translate-api");

const wordsRouter = require("./routes/words");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Connect to MongoDB
// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

mongoose
  .connect(process.env.DbKey, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use("/api/words", wordsRouter);

const { translate } = require("bing-translate-api");

// Define your API endpoint
app.post("/translateText", async (req, res) => {
  const text = req.body.text;
  const fromLang = req.body.fromLang;
  const toLang = req.body.toLang;
  console.log(text, fromLang, toLang);
  try {
    const result = await translate(text, fromLang,  toLang);
    res.json({ translatedText: result.translation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error response
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
