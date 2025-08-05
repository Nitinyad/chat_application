# Message Scheduling Feature

## Overview
The chat application now includes a comprehensive message scheduling feature that allows users to schedule messages to be sent at a later time. This feature includes both frontend UI components and backend scheduling infrastructure.

## Features

### 1. Schedule Messages
- Users can schedule messages to be sent at a specific date and time
- Messages are validated for inappropriate content before scheduling
- Scheduled messages are stored in the cloud and processed automatically

### 2. View Scheduled Messages
- Users can view all their scheduled messages for a specific chat
- Shows scheduled time and time remaining until message is sent
- Real-time countdown display

### 3. Cancel Scheduled Messages
- Users can cancel any pending scheduled message
- Immediate cancellation with confirmation

### 4. Automatic Processing
- Backend scheduler runs every minute to check for messages to send
- Messages are automatically sent at their scheduled time
- Real-time socket notifications when scheduled messages are sent

## How to Use

### Scheduling a Message
1. Open a chat conversation
2. In the message input area, you'll see two new buttons:
   - **Calendar Icon** (Blue): Schedule a new message
   - **Clock Icon** (Teal): View scheduled messages
3. Click the calendar icon to open the scheduling modal
4. Enter your message in the text area
5. Select the date and time for when you want the message to be sent
6. Click "Schedule Message" to confirm

### Viewing Scheduled Messages
1. Click the clock icon next to the message input
2. A modal will open showing all scheduled messages for the current chat
3. Each message shows:
   - The message content
   - Scheduled date and time
   - Time remaining until sending
   - Cancel button to remove the message

### Canceling a Scheduled Message
1. Open the scheduled messages list
2. Click the delete (trash) icon next to any message
3. The message will be immediately canceled

## Technical Implementation

### Backend Components

#### 1. ScheduledMessage Model (`backend/Models/scheduledMessageModel.js`)
- Stores scheduled messages with status tracking
- Includes sender, content, chat, scheduled time, and status fields
- Indexed for efficient querying

#### 2. Scheduler Service (`backend/services/schedulerService.js`)
- Runs every minute to check for messages to send
- Processes scheduled messages and sends them automatically
- Handles content filtering and error management
- Emits real-time socket events when messages are sent

#### 3. Message Controller Updates (`backend/controller/messageController.js`)
- `scheduleMessage`: Creates new scheduled messages
- `getScheduledMessages`: Retrieves user's scheduled messages
- `cancelScheduledMessage`: Cancels pending scheduled messages

#### 4. API Routes (`backend/routes/messageRoutes.js`)
- `POST /api/message/schedule`: Schedule a new message
- `GET /api/message/scheduled`: Get user's scheduled messages
- `DELETE /api/message/scheduled/:messageId`: Cancel a scheduled message

### Frontend Components

#### 1. ScheduleMessageModal (`frontend/src/components/miscellaneous/ScheduleMessageModal.js`)
- Modal for scheduling new messages
- Date and time picker interface
- Form validation and error handling
- Success/error notifications

#### 2. ScheduledMessagesList (`frontend/src/components/miscellaneous/ScheduledMessagesList.js`)
- Modal for viewing scheduled messages
- Real-time countdown display
- Cancel functionality
- Loading states and error handling

#### 3. SingleChat Updates (`frontend/src/components/SingleChat.js`)
- Added scheduling buttons to message input
- Integrated modals for scheduling functionality
- Enhanced UI with tooltips and icons

## Database Schema

### ScheduledMessage Collection
```javascript
{
  sender: ObjectId,           // Reference to User
  content: String,            // Message content
  chat: ObjectId,             // Reference to Chat
  scheduledTime: Date,        // When to send the message
  status: String,             // 'pending', 'sent', 'failed'
  sentAt: Date,              // When the message was actually sent
  errorMessage: String,       // Error message if failed
  timestamps: true            // Created/updated timestamps
}
```

## Security Features

1. **Content Filtering**: All scheduled messages are checked for inappropriate content before scheduling and before sending
2. **User Authorization**: Users can only schedule, view, and cancel their own messages
3. **Time Validation**: Scheduled times must be in the future
4. **Error Handling**: Comprehensive error handling for all scheduling operations

## Real-time Features

1. **Socket Integration**: Scheduled messages are sent via socket.io for real-time delivery
2. **Live Updates**: Users receive immediate notifications when scheduled messages are sent
3. **Status Tracking**: Real-time status updates for scheduled message processing

## Performance Considerations

1. **Efficient Querying**: Database indexes on scheduled time and status
2. **Minimal Processing**: Scheduler runs every minute, not continuously
3. **Memory Management**: Proper cleanup of processed messages
4. **Error Recovery**: Failed messages are marked and logged for debugging

## Future Enhancements

1. **Recurring Messages**: Schedule messages to repeat at regular intervals
2. **Bulk Scheduling**: Schedule multiple messages at once
3. **Template Messages**: Pre-defined message templates for quick scheduling
4. **Advanced Scheduling**: More complex scheduling patterns (weekdays only, etc.)
5. **Notification Preferences**: Customize how users are notified about scheduled messages

## Troubleshooting

### Common Issues

1. **Message not sent at scheduled time**
   - Check server logs for scheduler service errors
   - Verify the message wasn't filtered for inappropriate content
   - Ensure the server is running and the scheduler is active

2. **Cannot schedule messages**
   - Verify user authentication
   - Check that scheduled time is in the future
   - Ensure message content passes content filtering

3. **Scheduled messages not appearing in list**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check browser console for JavaScript errors

### Debug Information

The scheduler service logs important information:
- Number of messages found for processing
- Success/failure of message sending
- Socket emission status
- Error details for failed operations

Check the server console for these logs when troubleshooting scheduling issues. 