import mongoose from "mongoose";
import { books } from "../db.js";

const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema(
  {
    bookname: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    rentPerDay: {
      type: Number,
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const bookModel = books.model("Book", bookSchema);

export default bookModel;
