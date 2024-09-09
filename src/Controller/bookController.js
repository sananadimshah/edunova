import mongoose from "mongoose";
import bookModel from "../Model/bookModel.js";
import { isValid, isValidRent } from "../validator/validator.js";
import userModel from "../Model/userModel.js";
import transactionModel from "../Model/transactionModel.js";

const isValidId = mongoose.Types.ObjectId.isValid;

const createBook = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        status: false,
        msg: "No parameter is found ,Plz provide detail",
      });
    }
    const { bookname, category, userId, rentPerDay } = req.body;
    const reqBody = ["bookname", "category", "userId"];

    for (let element of reqBody) {
      if (!isValid(req.body[element]))
        return res.status(400).send({
          status: false,
          msg: `This filed is required ${element} and must be in valid format`,
        });
    }

    if (!rentPerDay) {
      return res.status(400).send({
        status: false,
        msg: "Please fill rent filed is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        status: false,
        msg: "Invalid userId",
      });
    }

    if (!isValidRent(rentPerDay)) {
      return res.status(400).send({
        status: false,
        msg: "Invalid rent",
      });
    }

    const bookNameExits = await bookModel.findOne({ bookname });
    console.log(bookNameExits);
    if (bookNameExits) {
      return res.status(400).send({
        status: false,
        msg: "This bookName is already Exist",
      });
    }
    const userExits = await userModel.findById(userId);
    if (!userExits) {
      return res.status(400).send({
        status: false,
        msg: "Invalid User",
      });
    }

    const createBook = await bookModel.create({
      bookname,
      category,
      userId,
      rentPerDay,
    });
    return res.status(201).send({
      status: true,
      msg: "Book detail is successfully registered",
      data: createBook,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const allBooks = async (req, res) => {
  try {
    const findAllBooks = await bookModel.find();
    if (!findAllBooks) {
      return res.status(400).send({
        status: false,
        msg: "No book found",
        data: [],
      });
    }
    return res.status(200).send({
      status: true,
      msg: "All books detail is successfully fetch",
      data: findAllBooks,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getBooksByQuery = async (req, res) => {
  try {
    if (Object.keys(req.query).length === 0) {
      return res.status(400).send({
        status: false,
        msg: "Please pass data to get the listOfBook",
      });
    }
    const { bookname, rentRange, category } = req.query;

    let query = {};

    if (bookname) {
      query.bookname = { $regex: String(bookname), $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (rentRange) {
      const rentPrice = rentRange.split("-");

      let minValue = Number(rentPrice[0].trim());
      let maxValue = Number(rentPrice[1].trim());

      if (rentPrice.length !== 2 || isNaN(minValue) || isNaN(maxValue)) {
        return res.status(400).send({
          status: false,
          msg: "Invalid rent price range format. Use min-max format, e.g., 100-500",
        });
      }

      query.rentPerDay = { $gte: minValue, $lte: maxValue };
    }

    const listOfBook = await bookModel.find(query);
    if (listOfBook.length === 0 || !listOfBook) {
      return res.status(404).send({
        status: false,
        msg: "Not any book found with this term",
      });
    }

    return res.status(200).send({
      status: true,
      msg: "Books found",
      data: listOfBook,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getBooksStatus = async (req, res) => {
  try {
    const { bookname } = req.params;
    if (!bookname) {
      return res.status(400).send({
        status: false,
        msg: "Bookname is required",
      });
    }
    const bookStatus = await transactionModel.find({ bookname });
    if (!bookStatus) {
      return res.status(400).send({
        status: false,
        msg: "Book not found",
      });
    }

    const previousIssue = bookStatus.filter(
      (transaction) => transaction.status === "returned"
    );

    const currentlyIssue = bookStatus.filter(
      (transaction) => transaction.status === "issued"
    );

    if (previousIssue.length === 0 || currentlyIssue.length === 0) {
      return res.status(400).send({
        status: false,
        msg: "No one issue the book in the past or present",
      });
    }

    let currentUsers = [];

    if (currentlyIssue.length > 0) {
      for (let transaction of currentlyIssue) {
        const user = await userModel.findById(transaction.userId);
        if (user) {
          currentUsers.push(user.name);
        }
      }

      return res.status(200).send({
        status: true,
        msg: "Book is currently issued to a user",
        pastIssuedUserCount: previousIssue.length,
        currentUsers,
      });
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const rentGeneratedByBook = async (req, res) => {
  try {
    const { bookname } = req.params;
    if (!bookname) {
      return res.status(400).send({
        status: false,
        msg: "Bookname is required",
      });
    }
    const bookStatus = await transactionModel.find({ bookname });
    if (bookStatus.length === 0) {
      return res.status(404).send({
        status: false,
        msg: "Book not found",
      });
    }

    const totalRent = bookStatus.reduce((acc, cur) => {
      return acc + cur.rent || 0;
    }, 0);

    return res.status(200).send({
      status: true,
      msg: "TotalRent of a book",
      TotalRent: totalRent,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getBooksIssuedInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).send({
        status: false,
        msg: "startDate and endDate both are required",
      });
    }

    const findBook = await transactionModel.find({
      issueDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: "issued",
    });

    if (findBook.length === 0) {
      return res.status(404).send({
        status: false,
        msg: "No book is issued in these period",
      });
    }

    const bookIssued = await Promise.all(
      findBook.map(async (issued) => {
        const user = await userModel.findById(issued.userId);

        return {
          bookName: issued.bookname,
          person: user ? user.name : "Unknown User",
          issueDate: issued.issueDate,
        };
      })
    );

    return res.status(200).send({
      status: true,
      msg: "Booke in this period",
      bookIssued,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

export {
  createBook,
  getBooksByQuery,
  allBooks,
  getBooksStatus,
  rentGeneratedByBook,
  getBooksIssuedInRange,
};
