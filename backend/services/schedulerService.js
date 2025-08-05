const ScheduledMessage = require('../Models/scheduledMessageModel');
const Message = require('../Models/messageModel');
const Chat = require('../Models/chatModel');
const User = require('../Models/userModel');
const { isProfane, isToxic } = require('../utils/filter');

class SchedulerService {
    constructor() {
        this.interval = null;
        this.startScheduler();
    }

    startScheduler() {
        // Check for scheduled messages every minute
        this.interval = setInterval(async () => {
            await this.processScheduledMessages();
        }, 60000); // 1 minute interval
    }

    stopScheduler() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async processScheduledMessages() {
        try {
            const now = new Date();
            
            // Find all pending messages that should be sent now
            const pendingMessages = await ScheduledMessage.find({
                status: 'pending',
                scheduledTime: { $lte: now }
            }).populate('sender', 'name pic')
              .populate('chat')
              .populate({
                  path: 'chat.users',
                  select: 'name pic email',
              });

            console.log(`Found ${pendingMessages.length} messages to process`);

            for (const scheduledMsg of pendingMessages) {
                await this.sendScheduledMessage(scheduledMsg);
            }
        } catch (error) {
            console.error('Error processing scheduled messages:', error);
        }
    }

    async sendScheduledMessage(scheduledMsg) {
        try {
            // Check for inappropriate content before sending
            const containsBadWord = await isProfane(scheduledMsg.content);
            const isAbusive = await isToxic(scheduledMsg.content);

            if (containsBadWord || isAbusive) {
                // Mark as failed due to inappropriate content
                await ScheduledMessage.findByIdAndUpdate(scheduledMsg._id, {
                    status: 'failed',
                    errorMessage: 'Message contains inappropriate content'
                });
                return;
            }

            // Create the actual message
            const newMessage = {
                sender: scheduledMsg.sender._id,
                content: scheduledMsg.content,
                chat: scheduledMsg.chat._id
            };

            const message = await Message.create(newMessage);
            
            // Populate the message with sender and chat details
            await message.populate("sender", "name pic");
            await message.populate("chat");
            await User.populate(message, {
                path: 'chat.users',
                select: 'name pic email',
            });

            // Update the chat's latest message
            await Chat.findByIdAndUpdate(scheduledMsg.chat._id, {
                latestMessage: message,
            });

            // Mark scheduled message as sent
            await ScheduledMessage.findByIdAndUpdate(scheduledMsg._id, {
                status: 'sent',
                sentAt: new Date()
            });

            console.log(`Scheduled message sent: ${message._id}`);

            // Emit socket event for real-time updates
            if (global.io) {
                global.io.to(scheduledMsg.chat._id.toString()).emit("message recieved", message);
            }

        } catch (error) {
            console.error('Error sending scheduled message:', error);
            
            // Mark as failed
            await ScheduledMessage.findByIdAndUpdate(scheduledMsg._id, {
                status: 'failed',
                errorMessage: error.message
            });
        }
    }

    // Method to schedule a new message
    async scheduleMessage(senderId, content, chatId, scheduledTime) {
        try {
            const scheduledMessage = await ScheduledMessage.create({
                sender: senderId,
                content: content,
                chat: chatId,
                scheduledTime: scheduledTime
            });

            return scheduledMessage;
        } catch (error) {
            console.error('Error scheduling message:', error);
            throw error;
        }
    }

    // Method to get user's scheduled messages
    async getUserScheduledMessages(userId, chatId = null) {
        try {
            const query = { sender: userId, status: 'pending' };
            if (chatId) {
                query.chat = chatId;
            }

            const scheduledMessages = await ScheduledMessage.find(query)
                .populate('chat', 'chatName users')
                .sort({ scheduledTime: 1 });

            return scheduledMessages;
        } catch (error) {
            console.error('Error fetching scheduled messages:', error);
            throw error;
        }
    }

    // Method to cancel a scheduled message
    async cancelScheduledMessage(messageId, userId) {
        try {
            const scheduledMessage = await ScheduledMessage.findOne({
                _id: messageId,
                sender: userId,
                status: 'pending'
            });

            if (!scheduledMessage) {
                throw new Error('Scheduled message not found or already processed');
            }

            await ScheduledMessage.findByIdAndUpdate(messageId, {
                status: 'failed',
                errorMessage: 'Cancelled by user'
            });

            return { success: true, message: 'Scheduled message cancelled' };
        } catch (error) {
            console.error('Error cancelling scheduled message:', error);
            throw error;
        }
    }
}

module.exports = SchedulerService; 