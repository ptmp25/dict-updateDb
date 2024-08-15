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
    // for (const language in wordData.translations) {
    for (const word of wordData.translations['en']) {
      const existingWord = await Word.findOne({
        [`translations.en`]: word,
      }).exec();
      if (existingWord) {
        return res.json({
          status: 200,
          result: Constant.FAILED_CODE,
          code: 11000,
          message: "Word already exists",
        });
      }
    }
    // }
    // const existingWord = await Word.findOne({
    //   "translations.en": wordData.translations.en,
    // }).exec();
    // if (existingWord) {
    //   return res.json({
    //     status: 200,
    //     result: Constant.FAILED_CODE,
    //     code: 11000,
    //     message: "Word already exists",
    //   });
    // }
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
      code: 500,
      err: error,
    });
  }
});

router.get("/read_list", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const language = req.query.sortField || "en"; // Default to English if no sortField is provided

    // Debugging logs
    console.log("Page:", page);
    console.log("Limit:", limit);
    console.log("Skip:", skip);
    console.log("Sort Field:", language);

    // Use aggregation to handle sorting by language and then by id
    const total = await Word.countDocuments();

    const words = await Word.aggregate([
      {
        $addFields: {
          hasLanguage: {
            $cond: [
              {
                $gt: [
                  { $size: { $ifNull: [`$translations.${language}`, []] } },
                  0,
                ],
              },
              1,
              0,
            ],
          },
          firstMeaning: {
            $arrayElemAt: [{ $ifNull: [`$translations.${language}`, []] }, 0],
          },
        },
      },
      {
        $sort: {
          hasLanguage: -1, // Sort by presence of language (descending)
          firstMeaning: 1, // Sort by the first meaning in the specified language
          id: 1, // Finally, sort by id
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Debugging logs for aggregation results
    // console.log("Words:", words);

    res.json({
      result: "OK",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      words,
    });
  } catch (err) {
    console.error("Error fetching word list:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Define the /search route
router.get("/search", async (req, res) => {
  try {
    const term = req.query.q || "";
    const language = req.query.language || "en"; // Default to English if not provided
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Construct the regex for case-insensitive search
    const regex = new RegExp(term, "i");

    // Query the MongoDB collection
    const results = await Word.find({
      [`translations.${language}`]: { $elemMatch: { $regex: regex } },
    })
      .skip()
      .limit()
      .lean(); // Use lean() to get plain JavaScript objects

    // Get total count of matching documents
    const total = await Word.countDocuments({
      [`translations.${language}`]: { $elemMatch: { $regex: regex } },
    });
    // console.log("Total:", results);
    res.json({
      result: "OK",
      data: results,
      page,
      totalPages: 1,
      total,
    });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
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

router.patch("/update/:id", async (req, res) => {
  try {
    const wordId = req.params.id;
    const newWord = req.body;

    const updatedWord = await Word.findOneAndUpdate({ id: wordId }, newWord, {
      new: true,
    });

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
    .on("data", (row) => {
      const translations = {};
      // Extract translations for each language from CSV row
      Object.keys(row).forEach((language) => {
        const lowercaseTranslations = row[language]
          .split(",")
          .map((word) => word.trim().toLowerCase());
        translations[language.toLowerCase()] = lowercaseTranslations;
      });
      results.push({
        id: uuidv4(), // Assign a unique ID to each record
        translations: translations,
      });
    })
    .on("end", async () => {
      try {
        // Get all existing words from the database
        const existingWords = await Word.find().lean().exec();

        // Build a set of existing translations to avoid duplicates
        const existingTranslations = new Set(
          existingWords.flatMap((word) =>
            Object.entries(word.translations).flatMap(([language, words]) =>
              words.map((w) => `${language}:${w}`)
            )
          )
        );

        // Filter out duplicate words from the results
        const newWords = results.filter((word) =>
          Object.entries(word.translations).some(([language, words]) =>
            words.some((w) => !existingTranslations.has(`${language}:${w}`))
          )
        );

        // Insert new words that are not duplicates
        const docs = await Word.insertMany(newWords);
        res.status(200).json({ result: "OK", data: docs });
      } catch (err) {
        console.error("Error processing CSV:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
      } finally {
        fs.unlinkSync(req.file.path); // Clean up the uploaded file
      }
    })
    .on("error", (err) => {
      console.error("CSV Parsing Error:", err);
      res
        .status(500)
        .json({ message: "CSV Parsing Error", error: err.message });
    });
});

router.get("/export_csv", async (req, res) => {
  try {
    // Get the languageList from the query parameters
    const languageList = req.query.languages
      ? req.query.languages.split(",")
      : ["en", "fr", "de", "vi"];

    const words = await Word.find().lean().exec();

    if (!words.length) {
      return res.status(404).json({ message: "No words found" });
    }

    // Prepare the fields for CSV based on the languageList
    const fields = languageList.map((lang) => ({
      label: lang.toUpperCase(),
      value: (row) => {
        if (row.translations && row.translations[lang]) {
          return row.translations[lang].join("; ");
        }
        return "";
      },
    }));

    // // Add the 'id' field at the beginning
    // fields.unshift({ label: "ID", value: "id" });

    const opts = { fields };

    const parser = new Parser(opts);
    const csv = parser.parse(words);
    res.header("Content-Type", "text/csv");
    console.log("CSV:", csv);
    // res.attachment("words.csv");
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
