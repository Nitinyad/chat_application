import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  useToast,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { DeleteIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';

const ScheduledMessagesList = ({ selectedChat, isOpen, onClose, refresh }) => {
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const toast = useToast();

  const fetchScheduledMessages = async () => {
    if (!selectedChat) return;

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/scheduled?chatId=${selectedChat._id}`,
        config
      );

      setScheduledMessages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scheduled messages",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setDeleteLoading(messageId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`,
        },
      };

      await axios.delete(`/api/message/scheduled/${messageId}`, config);

      setScheduledMessages(prev => 
        prev.filter(msg => msg._id !== messageId)
      );

      toast({
        title: "Success",
        description: "Scheduled message cancelled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel scheduled message",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen && selectedChat) {
      fetchScheduledMessages();
    }
  }, [isOpen, selectedChat]);

  // Add this effect to refetch when 'refresh' changes
  useEffect(() => {
    if (isOpen && selectedChat) {
      fetchScheduledMessages();
    }
  }, [refresh]);

  const formatScheduledTime = (scheduledTime) => {
    const date = new Date(scheduledTime);
    return date.toLocaleString();
  };

  const getTimeUntilScheduled = (scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;

    if (diff <= 0) return "Past due";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <TimeIcon />
            <Text>Scheduled Messages</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={2}>Loading scheduled messages...</Text>
            </Box>
          ) : scheduledMessages.length === 0 ? (
            <Box textAlign="center" py={8}>
              <TimeIcon size="lg" color="gray.400" />
              <Text mt={2} color="gray.500">
                No scheduled messages for this chat
              </Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {scheduledMessages.map((message) => (
                <Box
                  key={message._id}
                  p={4}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {message.content}
                    </Text>
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <TimeIcon size="sm" />
                          <Text fontSize="xs" color="gray.600">
                            {formatScheduledTime(message.scheduledTime)}
                          </Text>
                        </HStack>
                        
                        <Badge
                          colorScheme={
                            getTimeUntilScheduled(message.scheduledTime) === "Past due" 
                              ? "red" 
                              : "blue"
                          }
                          size="sm"
                        >
                          {getTimeUntilScheduled(message.scheduledTime)}
                        </Badge>
                      </VStack>

                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteMessage(message._id)}
                        isLoading={deleteLoading === message._id}
                        aria-label="Cancel scheduled message"
                      />
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduledMessagesList; 