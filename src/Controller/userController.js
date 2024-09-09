import userModel from "../Model/userModel.js";
import transactionModel from "../Model/transactionModel.js";
import { mongoose } from "mongoose";
import {
  isValidEmail,
  isValidPassword,
  isValid,
  isValidPhone,
} from "../validator/validator.js";

const createUser = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        status: false,
        msg: "No parameter is found ,Plz provide detail",
      });
    }

    const { title, name, phone, email, password } = req.body;
    const reqBody = ["title", "name", "phone", "email", "password"];
    for (let element of reqBody) {
      if (!isValid(req.body[element]))
        return res.status(400).send({
          status: false,
          msg: `This filed is required ${element} and must be in valid format`,
        });
    }

    if (!["Mr", "Mrs", "Miss"].includes(title)) {
      return res.status(400).send({
        status: false,
        msg: "Please write title among this Mr , Mrs , Miss",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        msg: "Please write emailId in proper format",
      });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).send({
        status: false,
        msg: "Please write Phone number in proper format",
      });
    }
    if (!isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        msg: "Please write Password in proper format",
      });
    }
    const emailExits = await userModel.findOne({ email });
    if (emailExits) {
      return res.status(400).send({
        status: false,
        msg: "This email is already exits Please enter another emailId",
      });
    }
    const phoneExits = await userModel.findOne({ phone });
    if (phoneExits) {
      return res.status(400).send({
        status: false,
        msg: "This phone number is already exits Please enter another phone number",
      });
    }
    const createUser = await userModel.create({
      title,
      name,
      email,
      password,
      phone,
    });
    return res.status(201).send({
      status: true,
      msg: "User is successfully registered",
      data: createUser,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const allUsers = async (req, res) => {
  try {
    const findAllUsers = await userModel.find();
    if (!findAllUsers) {
      return res.status(400).send({
        status: false,
        msg: "No user found",
        data: [],
      });
    }
    return res.status(200).send({
      status: true,
      msg: "All users detail is successfully fetch",
      data: findAllUsers,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const issuedBooksToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({ status: false, msg: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        status: false,
        msg: "Invalid userId",
      });
    }
    const bookIssuedByUser = await transactionModel.find({
      userId,
      status: "issued",
    });

    if (bookIssuedByUser.length === 0) {
      return res.status(404).send({
        status: false,
        msg: "Not any book is issued by this userId",
      });
    }

    let issuedBookName = [];
    if (bookIssuedByUser.length > 0) {
      for (let book of bookIssuedByUser) {
        if (book) {
          issuedBookName.push(book.bookname);
        }
      }
    }

    return res.status(200).send({
      status: true,
      msg: "Successfully fetch user issued books",
      bookName: issuedBookName,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

export { createUser, allUsers, issuedBooksToUser };
