import { ToDoListIcon } from "@fluentui/react-northstar";
import { response } from "express";
import {User} from '../models/user'
const express = require("express");
const router = express.Router();



/**Returns user reference
 */ 
router.get("/api/users", async (req, res) => {
  console.log('Retrieval users')  

  const id = req.params.id;
  const users = await User.find({"userState.user.aadObjectId": id});

  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Delete user entry */
router.delete("/api/users", async (req, res) => {
  console.log('Delete users')  
  const id = req.params.id;
  try {
    const user = await User.findOneAndDelete({"userState.user.aadObjectId": id});
    if (!user) res.status(404).send("No item found");
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Create user entry */
router.post("/api/users", async (req, res) => {
console.log('Create users') 
console.log(req.body) 
  const user = new User(req.body);
  console.log(user)
  try {
   await user.save();
   console.log("response sent")
   res.send(user)
  } catch (error) {
    console.log("error detected")
    res.status(500).send(error);
  }
});

/** Update user entry */
router.patch("/api/users", async (req, res) => {
    console.log('Update users')  
  const id = req.params.id;
  const users = await User.find({"userState.user.aadObjectId": id});

  try {
    const user = await User.findOneAndUpdate({"userState.user.aadObjectId": id});
  } catch (error) {
    res.status(500).send(error);
  }
});

export default{
  router
}