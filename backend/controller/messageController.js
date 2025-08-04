const expressAsyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const { isProfane, isToxic } = require("../utils/filter");


const sendMessage = expressAsyncHandler(async(req,res)=>{
    const {content , chatId} = req.body

    if(!content || !chatId){
        console.log('Invaild data passed into request')
        return res.sendStatus(400)
    }

    // Check for profane content BEFORE saving to database
    const containsBadWord = await isProfane(content);
    const isAbusive = await isToxic(content);
    console.log("Message content:", content);
    console.log("Profane:", containsBadWord, "Toxic:", isAbusive);

    if (containsBadWord || isAbusive) {
        return res.status(403).json({ 
            error: "Message contains inappropriate content" 
        });
    }

    var newMessage = {
        sender : req.user._id,
        content : content,
        chat : chatId
    };

    try {
        var message = await Message.create(newMessage)

        message = await message.populate("sender" , "name pic")
        message = await message.populate("chat" )
        message = await User.populate(message,{
            path : 'chat.users',
            select : 'name pic email',
        });
        await Chat.findByIdAndUpdate(req.body.chatId ,{
            latestMessage : message,
        });
        res.json(message);

    } catch (e) {
        res.status(400)
        throw new Error(e.message)
    }
});



const allMessages =expressAsyncHandler(async(req,res)=>{
    try {
        const messages = await Message.find({chat : req.params.chatId}).populate(
            "sender",
            "name pic email"
        ).populate("chat");
        res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

const processMessage = async (socket, message) => {
    const containsBadWord = await isProfane(message.content); // ✅ now async again
    const isAbusive = await isToxic(message.content);
    console.log("Message content:", message.content);
    console.log("Profane:", containsBadWord, "Toxic:", isAbusive);

    if (containsBadWord || isAbusive) {
        socket.emit("messageBlocked", "Your message was flagged as abusive.");
        return;
    }

    // Emit to all clients in the chat room if message is clean
    socket.to(message.chat._id).emit("message recieved", message);
};


module.exports = {sendMessage , allMessages , processMessage}