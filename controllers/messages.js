const messageModel = require("../schemas/messages");

module.exports = {
  // send message
  SendMessage: async function (from, to, messageType, messageText) {
    let newMessage = new messageModel({
      from: from,
      to: to,
      messageContent: {
        type: messageType,
        text: messageText
      }
    });

    await newMessage.save();
    return newMessage;
  },

  // get all message 
  GetMessagesBetweenUsers: async function (currentUserId, otherUserId) {
    let messages = await messageModel
      .find({
        isDeleted: false,
        $or: [
          { from: currentUserId, to: otherUserId },
          { from: otherUserId, to: currentUserId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate("from")
      .populate("to");

    return messages;
  },

  // last message with each user
  GetLatestMessagesWithEachUser: async function (currentUserId) {
    let messages = await messageModel
      .find({
        isDeleted: false,
        $or: [
          { from: currentUserId },
          { to: currentUserId }
        ]
      })
      .sort({ createdAt: -1 })
      .populate("from")
      .populate("to");

    let userMessagesMap = {};

    for (let message of messages) {
      if (!message.from || !message.to) {
        continue;
      }

      let fromId = message.from._id.toString();
      let toId = message.to._id.toString();
      let currentId = currentUserId.toString();

      let otherUserId = fromId === currentId ? toId : fromId;

      if (!userMessagesMap[otherUserId]) {
        userMessagesMap[otherUserId] = message;
      }
    }

    return Object.values(userMessagesMap);
  }
};