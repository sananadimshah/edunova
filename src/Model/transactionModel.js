import mongoose from "mongoose";
import { transactions } from "../db.js";
const ObjectId = mongoose.Schema.Types.ObjectId;

const transactionSchema = new mongoose.Schema(
  {
    bookname: {
      type: String,
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    rent: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["issued", "returned"],
      default: "issued",
    },
  },
  { timestamps: true }
);

const transactionModel = transactions.model("Transaction", transactionSchema); // Use mongoose.model
export default transactionModel;
