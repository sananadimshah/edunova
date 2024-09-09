import bookModel from "../Model/bookModel.js";
import userModel from "../Model/userModel.js";
import transactionModel from "../Model/transactionModel.js";
import { mongoose } from "mongoose";
import { isValid } from "../validator/validator.js";

const bookIssue = async (req, res) => {
  try {
    const { bookname, userId, issueDate } = req.body;
    const reqBody = ["bookname", "userId", "issueDate"];

    for (let element of reqBody) {
      if (!isValid(req.body[element]))
        return res.status(400).send({
          status: false,
          msg: `This filed is required ${element} and must be in valid format`,
        });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        status: false,
        msg: "Invalid userId",
      });
    }
    const bookExists = await bookModel.findOne({ bookname });
    if (!bookExists) {
      return res.status(404).send({
        status: false,
        msg: "Book not found",
      });
    }
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return res.status(404).send({
        status: false,
        msg: "User not found. Please sign up",
      });
    }

    const existingUser = await transactionModel.findOne({
      bookname,
      userId,
      status: "issued",
    });

    if (existingUser) {
      return res.status(400).send({
        status: false,
        msg: "This book is already issued to this user and hasn't been returned yet.",
      });
    }

    const bookIssue = await transactionModel.create({
      bookname,
      userId,
      issueDate,
    });

    return res.status(201).send({
      status: true,
      msg: "Successfully book issued",
      data: bookIssue,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const bookReturn = async (req, res) => {
  try {
    const { bookname, userId, returnDate } = req.body;
    const reqBody = ["bookname", "userId", "returnDate"];

    // Validate required fields
    for (let element of reqBody) {
      if (!isValid(req.body[element])) {
        return res.status(400).send({
          status: false,
          msg: `This field is required: ${element} and must be in valid format`,
        });
      }
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        status: false,
        msg: "Invalid userId",
      });
    }

    // Check if the book is issued
    const isBookIssued = await transactionModel.findOne({
      bookname,
      userId,
      status: "issued",
    });

    if (!isBookIssued) {
      return res.status(404).send({
        status: false,
        msg: "Sorry, the book is not found or it is not issued.",
      });
    }
    if (isBookIssued.status == "returned") {
      return res.status(400).send({
        status: false,
        msg: "This book already returned",
      });
    }

    // Find the book for rent per day
    const findBook = await bookModel.findOne({ bookname });

    if (!findBook) {
      return res.status(404).send({
        status: false,
        msg: "Book not found in the system.",
      });
    }

    // Get issue date and return date
    const issueDate = isBookIssued.issueDate;
    const returnBook = new Date(returnDate);
    const rentPerDay = findBook.rentPerDay;

    // Calculate rent
    const differenceInTime = returnBook.getTime() - issueDate.getTime();
    const differenceInDays = Math.ceil(
      differenceInTime / (1000 * 60 * 60 * 24)
    );

    const totalRent = differenceInDays * rentPerDay;

    // Update the transaction record
    isBookIssued.rent = totalRent;
    isBookIssued.status = "returned";
    isBookIssued.returnDate = returnBook;

    await isBookIssued.save();

    return res.status(200).send({
      status: true,
      msg: "Book returned successfully",
      data: {
        rent: totalRent,
        isBookIssued,
      },
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

// const  = async(req,res) => {
//     try {

//     } catch (error) {
//         return res.status(500).send({ status: false, msg: err.message })
//     }
// };
export { bookIssue, bookReturn };
