import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { TimeIcon, CalendarIcon } from '@chakra-ui/icons';
import axios from 'axios';

const ScheduleMessageModal = ({ isOpen, onClose, selectedChat, onScheduleSuccess }) => {
  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || !scheduledDate || !scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Time",
        description: "Scheduled time must be in the future",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message/schedule",
        {
          content: content,
          chatId: selectedChat._id,
          scheduledTime: scheduledDateTime.toISOString(),
        },
        config
      );

      toast({
        title: "Message Scheduled",
        description: `Message will be sent on ${scheduledDateTime.toLocaleString()}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setContent('');
      setScheduledDate('');
      setScheduledTime('');
      onClose();
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to schedule message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setScheduledDate('');
    setScheduledTime('');
    onClose();
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <TimeIcon />
            <Text>Schedule Message</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel>
                  <HStack>
                    <CalendarIcon />
                    <Text>Date</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  <HStack>
                    <TimeIcon />
                    <Text>Time</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </FormControl>
            </HStack>

            {scheduledDate && scheduledTime && (
              <Box
                p={3}
                bg="blue.50"
                borderRadius="md"
                w="100%"
              >
                <Text fontSize="sm" color="blue.600">
                  Message will be sent on: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Scheduling..."
          >
            Schedule Message
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleMessageModal; 