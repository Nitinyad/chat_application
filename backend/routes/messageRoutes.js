const express =  require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    sendMessage, 
    allMessages, 
    scheduleMessage, 
    getScheduledMessages, 
    cancelScheduledMessage 
} = require('../controller/messageController');

const router = express.Router()


router.route('/:chatId').get(protect,allMessages)
router.route('/').post(protect,sendMessage)

// Scheduled message routes
router.route('/schedule').post(protect, scheduleMessage)
router.route('/scheduled').get(protect, getScheduledMessages)
router.route('/scheduled/:messageId').delete(protect, cancelScheduledMessage)

module.exports = router;
