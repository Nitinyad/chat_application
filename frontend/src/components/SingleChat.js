// import React, { useEffect, useState } from 'react'
// import {ChatState} from '../context/ChatProvider'
// import {Text , Box} from '@chakra-ui/layout'
// import { FormControl, IconButton, Input, Spinner, useToast } from '@chakra-ui/react';
// import { ArrowBackIcon } from '@chakra-ui/icons';
// import ProfileModal from './miscellaneous/ProfileModal';
// import { getSender, getSenderFull } from '../config/ChatLogic';
// import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
// import axios from 'axios';

// const SingleChat = ({fetchAgain,setFetchAgain}) => {

//     const [messages , setMessages ] = useState([])
//     const [loading , setLoading] = useState(false)
//     const [newMessage , setNewMessage ] = useState()
//     const toast = useToast()
//     const {user , selectedChat , setSelectedChat} = ChatState();



//     const fetchMessages = async() =>{
//       if(!selectedChat) return;

//       try {
//         const config = {
//           headers :{
//               Authorization :  `Bearer ${user.token}`
//           },
//         };

//         setLoading(true)

//         const {data } = await axios.get(`/api/message/${selectedChat._id}`,config);

//         console.log(messages)
//         setMessages(data);
//         setLoading(false)

//       } catch (error) {
//         toast({
//           title:"Error Occured!",
//           description:"Failed to Load the Message",
//           status:"error",
//           duration:5000,
//           isClosable:true,
//           position:"bottom",
//         });
//       }
//     }


//     useEffect(()=>{
//       fetchMessages();
//     },[selectedChat])

//     const sendMessage = async(event) =>{
//       if(event.key == "Enter" && newMessage){
//         try {
//           const config = {
//             headers :{
//               "Content-Type" : "application/json",
//               Authorization : `Bearer ${user.token}`,
//             },
//           };
//           //fetching the api 
//           const {data} = await axios.post('/api/message',{
//             content : newMessage ,
//              chatId : selectedChat._id,
//           },config);

//           console.log(data)

//           setNewMessage("");
//           setMessages([...messages , data]);
          
//         } catch (error) {
//           toast({
//             title:"error occured!",
//             description:"Failed to send the message",
//             status:"error",
//             duration:5000,
//             isClosable:true,
//             position:"bottom",
//           })
//         }
//       }
//     };
//     const typingHandler = (e) =>{
//       setNewMessage(e.target.value)

//       // logic for typing indicator
//     };
//   return (
//     <> 
//         {selectedChat ? (
//           <>
//             <Text
//             fontSize={{base:"28px" , md:"30px"}}
//             pb={3}
//             px={5}
//             w="100%"
//             fontFamily="Work sans"
//             display="flex"
//             justifyContent={{base:"space-between"}}
//             alignItems="center"
//             >
//               <IconButton
//                 display={{base:"flex" , md:"none"}}
//                 icon={<ArrowBackIcon/>}
//                 onClick={()=>setSelectedChat("")}
//               />
//               {!selectedChat.isGroupChat ? (
//                 <>
//                   {getSender(user, selectedChat.users)}
//                   <ProfileModal
//                     user={getSenderFull(user, selectedChat.users)}
//                   />
//                 </>
//               ) : (
//                 <>
//                   {selectedChat.chatName.toUpperCase()}
//                   <UpdateGroupChatModal
//                     // fetchMessages={fetchMessages}
//                     fetchAgain={fetchAgain}
//                     setFetchAgain={setFetchAgain}
//                   />
//                 </>
//               )}
//             </Text>
//             <Box
//               display="flex"
//               flexDir="column"
//               justifyContent="flex-end"
//               p={3}
//               bg="#E8E8E8"
//               w="100%"
//               h="100%"
//               borderRadius="lg"
//               overflowY="hidden"
//             >
//               {loading ? (
//                 <Spinner
//                   size ='xl'
//                   w={20}
//                   h={20}
//                   alignSelf="center"
//                   margin="auto"
//                 />
//               ) : (
//                 <div>
//                   {/* message */}
//                 </div>
//               )}
//               <FormControl onKeyDown={sendMessage} isRequired mt={3}>
//                 <Input
//                   variant="filled"
//                   bg='#E0E0E0'
//                   placeholder='Enter a message .. '
//                   onChange={typingHandler}
//                   value={newMessage}
//                 />
//               </FormControl>
//             </Box>
//           </>
//         ):(
//         <Box display="flex" alignItems="center" justifyContent="center" h="100%">
//           <Text fontSize="3xl" pb={3} fontFamily="Work sans">
//             Click on a user to start chatting
//           </Text>
//         </Box>
//         )}
//     </>
//   )
// }

// export default SingleChat


import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, HStack, Tooltip } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogic";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, TimeIcon, CalendarIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScheduleMessageModal from "./miscellaneous/ScheduleMessageModal";
import ScheduledMessagesList from "./miscellaneous/ScheduledMessagesList";
import { ChatState } from "../context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; 
var socket;
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduledListOpen, setIsScheduledListOpen] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        
        setNewMessage("");
        socket.emit("sendMessage", data);
        setMessages([...messages, data]);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Message was blocked due to inappropriate content
          toast({
            title: "Your Message was flagged as abusive",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);//this useeffect only render once when the componet mount

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // get the notification
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              
              <HStack spacing={2}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  flex={1}
                />
                
                <Tooltip label="Schedule Message" placement="top">
                  <IconButton
                    icon={<CalendarIcon />}
                    onClick={() => setIsScheduleModalOpen(true)}
                    colorScheme="blue"
                    variant="ghost"
                    size="md"
                    aria-label="Schedule message"
                  />
                </Tooltip>
                
                <Tooltip label="View Scheduled Messages" placement="top">
                  <IconButton
                    icon={<TimeIcon />}
                    onClick={() => setIsScheduledListOpen(true)}
                    colorScheme="teal"
                    variant="ghost"
                    size="md"
                    aria-label="View scheduled messages"
                  />
                </Tooltip>
              </HStack>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}

      {/* Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedChat={selectedChat}
        onScheduleSuccess={() => {
          // Optionally refresh scheduled messages list
        }}
      />

      {/* Scheduled Messages List Modal */}
      <ScheduledMessagesList
        isOpen={isScheduledListOpen}
        onClose={() => setIsScheduledListOpen(false)}
        selectedChat={selectedChat}
      />
    </>
  );
};

export default SingleChat;
