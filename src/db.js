// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const books = mongoose.createConnection(process.env.MONGODB_URL_Books);

const transactions = mongoose.createConnection(
  process.env.MONGODB_URL_Transactions
);

books.on("connected", () => {
  console.log("Connected to BooksDB");
});

transactions.on("connected", () => {
  console.log("Connected to TransactionsDB");
});

export { books, transactions };
