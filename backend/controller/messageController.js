const expressAsyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const ScheduledMessage = require("../Models/scheduledMessageModel");
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

// Schedule a message for later
const scheduleMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId, scheduledTime } = req.body;

    if (!content || !chatId || !scheduledTime) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
        return res.status(400).json({
            error: "Scheduled time must be in the future"
        });
    }

    // Check for profane content
    const containsBadWord = await isProfane(content);
    const isAbusive = await isToxic(content);

    if (containsBadWord || isAbusive) {
        return res.status(403).json({ 
            error: "Message contains inappropriate content" 
        });
    }

    try {
        const scheduledMessage = await ScheduledMessage.create({
            sender: req.user._id,
            content: content,
            chat: chatId,
            scheduledTime: scheduledDate
        });

        await scheduledMessage.populate("sender", "name pic");
        await scheduledMessage.populate("chat");

        res.json(scheduledMessage);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Get user's scheduled messages
const getScheduledMessages = expressAsyncHandler(async (req, res) => {
    try {
        const { chatId } = req.query;
        const query = { sender: req.user._id, status: 'pending' };
        
        if (chatId) {
            query.chat = chatId;
        }

        const scheduledMessages = await ScheduledMessage.find(query)
            .populate('chat', 'chatName users')
            .sort({ scheduledTime: 1 });

        res.json(scheduledMessages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Cancel a scheduled message
const cancelScheduledMessage = expressAsyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const scheduledMessage = await ScheduledMessage.findOne({
            _id: messageId,
            sender: req.user._id,
            status: 'pending'
        });

        if (!scheduledMessage) {
            return res.status(404).json({
                error: "Scheduled message not found or already processed"
            });
        }

        await ScheduledMessage.findByIdAndUpdate(messageId, {
            status: 'failed',
            errorMessage: 'Cancelled by user'
        });

        res.json({ success: true, message: 'Scheduled message cancelled' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    sendMessage, 
    allMessages, 
    processMessage,
    scheduleMessage,
    getScheduledMessages,
    cancelScheduledMessage
}