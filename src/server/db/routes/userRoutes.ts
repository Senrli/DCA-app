import { ToDoListIcon } from "@fluentui/react-northstar";
import { response } from "express";

const express = require("express");
const userModel = require("../models/user");
const router = express.Router();

/**Returns user reference
 */ 
router.get("/users", async (req, res) => {
  console.log('Retrieval users')  
  const id = req.params.id;
  const users = await userModel.find({"userState.user.aadObjectId": id});

  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Delete user entry */
router.delete("/users", async (req, res) => {
  console.log('Delete users')  
  const id = req.params.id;
  try {
    const user = await userModel.findOneAndDelete({"userState.user.aadObjectId": id});
    if (!user) res.status(404).send("No item found");
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Create user entry */
router.post("/users", async (req, res) => {
console.log('Create users')  
  const user = new userModel(req.body);

  try {
   await user.save();
   res.send(user)
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Update user entry */
router.patch("/users", async (req, res) => {
    console.log('Update users')  
  const id = req.params.id;
  const users = await userModel.find({"userState.user.aadObjectId": id});

  try {
    const user = await userModel.findOneAndUpdate({"userState.user.aadObjectId": id});
  } catch (error) {
    res.status(500).send(error);
  }
});

export default{
  router
}