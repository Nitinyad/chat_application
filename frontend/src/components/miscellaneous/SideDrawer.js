// import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
// import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
// import React, { useState } from 'react'
// import { ChatState } from '../../context/ChatProvider';
// import ProfileModal from './ProfileModal';
// import { useHistory } from 'react-router-dom';
// import axios from 'axios';
// import ChatLoading from '../ChatLoading';
// import UserListItem from '../UserAvatar/UserListItem';

import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon ,ChevronDownIcon, PhoneIcon } from "@chakra-ui/icons";
import { IconButton } from '@chakra-ui/react'
import { Avatar } from "@chakra-ui/avatar";
import {  useHistory } from "react-router-dom";
import { Link } from '@chakra-ui/react'
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
// import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
// import NotificationBadge from "react-notification-badge";
// import { Effect } from "react-notification-badge";
// import { getSender } from "../../config/ChatLogics";
//import UserListItem from "../userAvatar/UserListItem";

import UserListItem from '../UserAvatar/UserListItem';
import { ChatState } from "../../context/ChatProvider";
import { Spinner } from "@chakra-ui/react";


const SideDrawer = () => {

  const [search ,setSearch] = useState('');
  const [searchResult,setSearchResult] = useState([])
  const [loading,setLoading] = useState(false)
  const [loadingChat,setLoadingChat] = useState(false);

  const history = useHistory();
  const {user ,setSelectedChat ,chats , setChats} = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure()

  
  const logoutHandler = () =>{
    localStorage.removeItem("userInfo")
    history.push("/");
  }

  const toast = useToast();

  const handleSearch = async() =>{
    if(!search){
      toast({
        title : "Please Enter something to search",
        status : "warning",
        duration:3000,
        isClosable:true,
        position:"top-left",
      });
      return;
    }

    try{
      setLoading(true);
      const config = {
        headers:{
          Authorization:`Bearer ${user.token}`,
        },
      };

      const {data} = await axios.get(`api/user?search=${search}` , config);


      setLoading(false);
      setSearchResult(data);
    }catch(e){
      toast({
        title:"Error occured!",
        description:"Failed to load the search Results",
        status:"error",
        duration:3000,
        isClosable:true,
        position:"bottom-left",
      })
    }
  }
  
  const accessChat =async(userId) =>{
    try {
      setLoadingChat(true);

      const config ={
        headers : {
          "Content-type" : "application/json",
          Authorization:`Bearer ${user.token}`
        },
      };

      const {data } = await axios.post("/api/chat" , {userId} , config);

      if(!chats.find((c)=>c._id===data._id)) setChats([data , ...chats])

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();

      
    } catch (error) {
      toast({
        title:"Error fetching the chat",
        description:error.message,
        status:"error",
        duration:3000,
        isClosable:true,
        position:"bottom-left",
      });
    }
  }
  return (
    <>
      <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      width="100%"
      p="5px 10px 5px 10px"
      borderWidth="5px"
      >
        <Tooltip label="Search users to chat" hasArrow placement='bottom-end'>
          <Button variant="ghost" onClick={onOpen}> 
          <i class="fas fa-search"></i>
          <Text display={{base:"none" , md:"flex"} } px="4">Search Users</Text>
          </Button>

        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          ChatingFluent
        </Text>

        <div>
          <Menu>
            <MenuButton p="1">
              <BellIcon fontSize="2xl" m={1}/>
            </MenuButton>
            <Link href="https://videocalling11.netlify.app/" target="_blank">
              <IconButton
                  colorScheme='teal'
                  aria-label='Call Segun'
                  size='md'
                  m = {1.5}
                  icon={<PhoneIcon />}
              />
            </Link>
            
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
              <Avatar size="sm"  cursor="pointer" name={user.name} src={user.pic}/>
            </MenuButton>
            <MenuList>
            <ProfileModal user={user}>
            <MenuItem>My profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>
          <DrawerBody>
          <Box display="flex" pb={2}>
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
          </Box>
          {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
        </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer