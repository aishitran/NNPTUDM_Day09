var express = require("express");
var router = express.Router();

let messageController = require("../controllers/messages");
let { CheckLogin } = require("../utils/authHandler");

// Middleware kiểm tra login
router.use(CheckLogin);

// GET / - Lấy message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn cho user hiện tại
router.get("/", async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let latestMessages = await messageController.GetLatestMessagesWithEachUser(
      currentUserId
    );

    res.send(latestMessages);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send({
      message: "Có lỗi xảy ra khi lấy tin nhắn"
    });
  }
});

// GET /:userID - Lấy toàn bộ message giữa user hiện tại và userID
router.get("/:userID", async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let otherUserId = req.params.userID;

    // Validate ObjectId
    if (!otherUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        message: "UserID không hợp lệ"
      });
    }

    let messages = await messageController.GetMessagesBetweenUsers(
      currentUserId,
      otherUserId
    );

    res.send(messages);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send({
      message: "Có lỗi xảy ra khi lấy tin nhắn"
    });
  }
});

// POST / - Gửi message
router.post("/", async function (req, res, next) {
  try {
    let { to, messageType, messageText } = req.body;
    let currentUserId = req.user._id;

    // Validation
    if (!to || !messageType || !messageText) {
      return res.status(400).send({
        message: "to, messageType, và messageText là bắt buộc"
      });
    }

    if (messageType !== "file" && messageType !== "text") {
      return res.status(400).send({
        message: "messageType phải là 'file' hoặc 'text'"
      });
    }

    if (!to.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        message: "UserID recipient không hợp lệ"
      });
    }

    let newMessage = await messageController.SendMessage(
      currentUserId,
      to,
      messageType,
      messageText
    );

    res.status(201).send({
      message: "Gửi tin nhắn thành công",
      data: newMessage
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send({
      message: "Có lỗi xảy ra khi gửi tin nhắn"
    });
  }
});

module.exports = router;
