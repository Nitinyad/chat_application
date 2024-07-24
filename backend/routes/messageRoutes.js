const express =  require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessages } = require('../controller/messageController');

const router = express.Router()


router.route('/:chatId').get(protect,allMessages)
router.route('/').post(protect,sendMessage)


module.exports = router;
