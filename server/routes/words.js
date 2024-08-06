const express = require("express");
const router = express.Router();
const Word = require("../models/Word.js");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
var Constant = require("../common/constant.js");
const { v4: uuidv4 } = require("uuid");

const upload = multer({ dest: "uploads/" });

router.get("/pp3946p", function (req, res) {
  res.render("words/about", { title: "pp3946p", name: "Mai Phuong" });
});

router.post("/save", async (req, res) => {
  try {
    const wordData = req.body;
    // console.log("Received wordData:", wordData);

    const newWord = new Word(wordData);
    newWord.id = uuidv4(); // Assign a unique ID to the new instance
    // console.log("Instance before save:", newWord); // Check what the new instance looks like

    const savedWord = await newWord.save();
    // console.log("Document after save:", savedWord); // This will confirm what's saved in the database

    res.status(200).json({
      status: 200,
      result: Constant.OK_CODE,
      data: savedWord,
    });
  } catch (error) {
    console.error("Error saving word:", error);
    res.status(500).json({
      result: Constant.FAILED_CODE,
      message: Constant.SERVER_ERR,
      err: error,
    });
  }
});

router.get("/read_list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = `translates.${req.query.sortField}` || "translations.en"; // default to 'English' translation if not provided

    const total = await Word.countDocuments();
    const words = await Word.find()
      .sort({ [sortField]: 1 }) // use the sortField dynamically
      .skip(skip)
      .limit(limit);

    res.json({
      result: Constant.OK_CODE,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      words,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    const language = req.query.language || "english"; // default to 'english' if not provided

    const words = await Word.find({
      [language]: { $regex: query, $options: "i" },
    }).lean();

    if (!words.length) {
      return res.status(404).json({ message: "No words found" });
    }

    res.json({ result: Constant.OK_CODE, data: words });
  } catch (err) {
    console.error("Error searching words:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const wordId = req.params.id;
    const word = await Word.findOne({ id: wordId }).exec();

    if (!word) {
      res.status(404).json({ message: "Word not found" });
    } else {
      result: Constant.OK_CODE,
        res.json({
          result: Constant.OK_CODE,
          data: word,
        });
    }
  } catch (err) {
    console.error("Error fetching word for edit:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const condition = { id: req.params.id };
  try {
    const result = await Word.deleteOne(condition);
    if (result.deletedCount) {
      res.json(result);
    } else {
      res.status(500).json({ message: "Failed to delete data" });
    }
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ message: "Failed to delete data" });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const wordId = req.params.id;
    const word = await Word.findOne({ id: wordId }).exec();

    if (!word) {
      res.status(404).json({ message: "Word not found" });
    } else {
      res.render("words/details", { title: "Word Details", word });
    }
  } catch (err) {
    console.error("Error fetching word details:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const wordId = req.params.id;
    const newWord = req.body;

    const updatedWord = await Word.findOneAndUpdate(
      { id: wordId },
      newWord,
      { new: true }
    );

    if (!updatedWord) {
      res.status(404).json({ message: "Word not found" });
    } else {
      res.json({ result: Constant.OK_CODE, data: updatedWord, status: 200 });
    }
  } catch (err) {
    console.error("Error updating word:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post("/upload_csv", upload.single("file"), async (req, res) => {
  const results = [];
  if (!req.file || !req.file.path) {
    console.error("File upload failed:", req.file);
    return res.status(400).json({ message: "File upload failed" });
  }
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      if (!data.id) {
        data.id = uuidv4(); // Assign a unique ID to each record
      }
      data.others = data.others || {};
      results.push(data);
    })
    .on("end", async () => {
      try {
        const existingWords = await Word.find().lean().exec();
        const existingEnglishs = existingWords.map(word => word.english);

        const newWords = results.filter(
          (word) => !existingEnglishs.includes(word.english)
        );

        const docs = await Word.insertMany(newWords);
        res.status(200).json({ result: Constant.OK_CODE, data: docs });
      } catch (err) {
        res
          .status(500)
          .json({ result: Constant.FAILED_CODE, message: err.message });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
});

router.get("/export_csv", async (req, res) => {
  try {
    const words = await Word.find().lean().exec();

    if (!words.length) {
      return res.status(404).json({ message: "No words found" });
    }

    const fields = ["en", "de", "fr", "vi", "others"];
    const opts = { fields };

    const parser = new Parser(opts);
    const csv = parser.parse(words);

    res.header("Content-Type", "text/csv");
    res.attachment("words.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error exporting words to CSV:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    const words = await Word.find({
      $or: [
        { english: { $regex: query, $options: "i" } },
        { german: { $regex: query, $options: "i" } },
        { french: { $regex: query, $options: "i" } },
      ],
    }).lean();

    if (!words.length) {
      return res.status(404).json({ message: "No words found" });
    }

    res.json({ result: Constant.OK_CODE, data: words });
  } catch (err) {
    console.error("Error searching words:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
