const mongooise = require('mongoose');

const messageSchema = new mongooise.Schema(
  {
    text: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    sentBy: {
      type: mongooise.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongooise.model('Message', messageSchema);

module.exports = MessageModel;
