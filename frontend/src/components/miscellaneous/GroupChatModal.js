// import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
// import React, { useState } from 'react'
// import { ChatState } from '../../context/ChatProvider';
// import axios from 'axios';
// import UserListItem from '../UserAvatar/UserListItem';
// import UserBadgeItem from '../UserAvatar/UserBadgeItem';

// const GroupChatModel = ({ children }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [groupChatName, setGroupChatName] = useState();
//   const [selectedUsers, setSelectedUsers] = useState();
//   const [search, setSearch] = useState("");
//   const [searchResult, setSearchResult] = useState([]);
//   const [loading, setLoading] = useState(false);


//   const toast = useToast();
//   const { user, chats, setChats } = ChatState();



//   const handleGroup = (userToAdd) => {
//     if (selectedUsers.includes(userToAdd)) {
//       toast({
//         title: "User already added",
//         status: "warning",
//         duration: 5000,
//         isClosable: true,
//         position: "top",
//       });
//       return;
//     }

//     setSelectedUsers([...selectedUsers, userToAdd]);
//   };
//   const handleSearch = async (query) => {
//     setSearch(query)
//     if (!query) {
//       return;
//     }

//     try {
//       setLoading(true);
//       const config = {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       };

//       const { data } = await axios.get(`/api/user?search=${search}`, config)

//       console.log(data);
//       setLoading(false)
//       setSearchResult(data);


//     } catch (error) {
//       toast({
//         title: "Error occured!",
//         description: "Failed to Load the search Result",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//         position: "bottom-left"
//       })
//     }
//   }

//   const handleSubmit = () => {

//   }
//   const handleDelete = () => {

//   }

//   return (
//     <>
//       <span onClick={onOpen}>{children}</span>

//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader
//             fontSize="35px"
//             fontFamily="Work sans"
//             display="flex"
//             justifyContent="center"

//           >Create Group Chat</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody
//             display="flex"
//             flexDir="column"
//             alignItems="center"
//           >

//             <FormControl>
//               <Input
//                 placeholder='Chat Name'
//                 mb={3}
//                 onChange={(e) => setGroupChatName(e.target.value)}
//               />
//             </FormControl>
//             <FormControl>
//               <Input
//                 placeholder='Add Users eg : Nitin , sajeet , etc'
//                 mb={1}
//                 onChange={(e) => handleSearch(e.target.value)}
//               />
//             </FormControl>
//             {/* List of our selected users */}
//             <Box w="100%" display="flex" flexWrap="wrap">
//               {selectedUsers?.map((u) => (
//                 <UserBadgeItem
//                   key={u._id}
//                   user={u}
//                   handleFunction={() => handleDelete(u)}
//                 />
//               ))}
//             </Box>

//             {/* rendered searched users */}
//             {loading ? <div>loading</div> : (
//               searchResult?.slice(0, 4).map((user) => (
//                 <UserListItem
//                   key={user._id}
//                   user={user}
//                   handleFunction={() => handleGroup(user)}
//                 />
//               ))
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme='blue' onClick={handleSubmit}>
//               Create Chat
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   )
// }

// export default GroupChatModel




import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  const debouncing = (callback, delay) => {
    let timer;
    return (...args) => {
      return new Promise((resolve, reject) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  };


  const searchUsers = useCallback( debouncing(async (query) => {
    const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      console.log(data);
    return data;
  }, 1000) , []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // };
      // const { data } = await axios.get(`/api/user?search=${search}`, config);
      const data = await searchUsers(search);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };




  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // const { data } = await axios.post(
      //   `/api/chat/group`,
      //   {
      //     name: groupChatName,
      //     users: JSON.stringify(selectedUsers.map((u) => u._id)),
      //   },
      //   config
      // );


      const debouncedPost = debouncing(async () => {
        return await axios.post(
          `/api/chat/group`,
          {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
          },
          config
        );
      }, 1000);

      const {data} = await debouncedPost();

      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: Nitin, Sajeet, etc"
                mb={1}
                onKeyUp = {(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;