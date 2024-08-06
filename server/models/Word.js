const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Constant = require("../common/constant.js");

const wordSchema = new Schema({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  translations: {
    type: Map,
    of: [String], // Array of strings for each language
  },
});

const Word = mongoose.model("words", wordSchema);

Word.update = async function (existedCondition, updateData) {
  try {
    const options = { upsert: false };
    const result = await Word.updateOne(existedCondition, updateData, options);
    return {
      result: Constant.OK_CODE,
      data: result,
    };
  } catch (err) {
    return {
      result: Constant.FAILED_CODE,
      message: Constant.SERVER_ERR,
      err: err,
    };
  }
};

Word.delete = async function (condition) {
  try {
    await Word.deleteOne(condition);
    return {
      result: Constant.OK_CODE,
    };
  } catch (err) {
    return {
      result: Constant.FAILED_CODE,
      message: Constant.SERVER_ERR,
      err: err,
    };
  }
};

Word.insertManyAsync = async function (data) {
  try {
    const result = await Word.insertMany(data);
    return {
      result: Constant.OK_CODE,
      data: result,
    };
  } catch (err) {
    return {
      result: Constant.FAILED_CODE,
      message: Constant.SERVER_ERR,
      err: err,
    };
  }
};

Word.get = async function (condition) {
  try {
    const result = await Word.findOne(condition);
    return {
      result: Constant.OK_CODE,
      data: result,
    };
  } catch (err) {
    return {
      result: Constant.FAILED_CODE,
      message: Constant.SERVER_ERR,
      err: err,
    };
  }
};

module.exports = Word;
