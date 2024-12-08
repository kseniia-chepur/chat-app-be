const ConversationModel = require('../models/conversation.model');
const MessageModel = require('../models/message.model');

const createConversation = async (data) => {
  let conversation = await ConversationModel.findOne({
    $or: [
      { sender: data?.sender, receiver: data?.receiver },
      { sender: data?.receiver, receiver: data?.sender },
    ],
  });

  if (!conversation) {
    const newConversation = await ConversationModel({
      sender: data?.sender,
      receiver: data?.receiver,
    });
    conversation = await newConversation.save();
  }

  const newMessage = new MessageModel({
    text: data.text,
    sentBy: data.sentBy,
  });
  const message = await newMessage.save();

  return {
    conversation,
    message,
  };
};

const updateConversation = async (data, conversation, message) => {
  await ConversationModel.updateOne(
    { _id: conversation?._id },
    {
      $push: { messages: message?._id },
    }
  );

  const conversationMessages = await ConversationModel.findOne({
    $or: [
      { sender: data?.sender, receiver: data?.receiver },
      { sender: data?.receiver, receiver: data?.sender },
    ],
  })
    .populate('messages')
    .sort({ updatedAt: -1 });

  return conversationMessages;
};

const getConversationMessages = async (currentUserId) => {
  let conversation;

  if (currentUserId) {
    const currentUserConversation = await ConversationModel.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ updatedAt: -1 })
      .populate('messages')
      .populate('sender')
      .populate('receiver');

    conversation = currentUserConversation.map((obj) => {
      let unreadMsg = obj.messages.reduce(
        (total, current) => total + (current.read ? 0 : 1),
        0
      );
      return {
        _id: obj?._id,
        sender: obj?.sender,
        receiver: obj?.receiver,
        unreadMsg: unreadMsg,
        lastMsg: obj?.messages[obj?.messages?.length - 1],
      };
    });
  }

  return conversation ?? [];
}

module.exports = {
  createConversation,
  updateConversation,
  getConversationMessages,
};
