import { ToDoListIcon } from "@fluentui/react-northstar";
import { response } from "express";

const express = require("express");
const conversationModel = require("../models/conversation");
const router = express.Router();

/**Returns conversation reference
 */ 
router.get("/api/conversations", async (req, res) => {
  const id = req.params.id;
  console.log("retrieve conv")
  const conversations = await conversationModel.find({"conversationState.user.aadObjectId": id});

  try {
    res.send(conversations);
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Delete conversation entry */
router.delete("/api/conversations", async (req, res) => {
  console.log("delete convo")
  const id = req.params.id;
  try {
    const conversation = await conversationModel.findOneAndDelete({"conversationState.user.aadObjectId": id});
    if (!conversation) res.status(404).send("No item found");
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Create conversation entry */
router.post("/api/conversations", async (req, res) => {
  
  const conversation = new conversationModel(req.body);

  try {
   await conversation.save();
   res.send(conversation)
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Update conversation entry */
router.patch("/api/conversations", async (req, res) => {
  const id = req.params.id;
  const conversations = await conversationModel.find({"conversationState.user.aadObjectId": id});

  try {
    const conversation = await conversationModel.findOneAndUpdate({"conversationState.user.aadObjectId": id});
  } catch (error) {
    res.status(500).send(error);
  }
});

export default{
  router
}