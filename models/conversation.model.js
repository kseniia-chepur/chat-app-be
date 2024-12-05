const mongooise = require('mongoose');

const conversationSchema = new mongooise.Schema(
  {
    sender: {
      type: mongooise.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    receiver: {
      type: mongooise.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    messages: [
      {
        type: mongooise.Schema.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongooise.model('Conversation', conversationSchema);

module.exports = ConversationModel;
