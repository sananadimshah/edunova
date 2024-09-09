import express from "express";
import route from "./routes/route.js";
import dotenv from "dotenv";
import { books, transactions } from "./db.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/", route);

app.listen(process.env.PORT || 3000, () => console.log("Server is Running"));

export { books, transactions };
