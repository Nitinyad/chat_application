import React from 'react';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const ChatbotButton = () => {
  const handleChatbotClick = () => {
    window.open('https://aichatbot-n.netlify.app/', '_blank');
  };

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex="1000"
    >
      <Tooltip label="AI Chatbot" placement="left" hasArrow>
        <IconButton
          aria-label="AI Chatbot"
          icon={<ChatIcon />}
          onClick={handleChatbotClick}
          size="lg"
          colorScheme="teal"
          borderRadius="50%"
          width="60px"
          height="60px"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          _hover={{
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
          }}
          transition="all 0.2s ease-in-out"
        />
      </Tooltip>
    </Box>
  );
};

export default ChatbotButton; 