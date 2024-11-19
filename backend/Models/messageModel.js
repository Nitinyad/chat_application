const mongoose = require('mongoose');

const messageModel = mongoose.Schema(
    {
        sender:{type : mongoose.Schema.Types.ObjectId , ref : "User"},
        content : {type : String , trim : true},
        chat : {type : mongoose.Schema.Types.ObjectId , ref : "Chat"},
        scheduleTime: Date,
    },
    {
        timestamps : true,
    }
);

const Message = mongoose.model("Message" , messageModel);

Message.find({}).then(messages => {
    console.log(messages);
  }).catch(error => {
    console.error(error);
  });

module.exports = Message; 