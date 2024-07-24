import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import React, { useState } from 'react'
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useHistory } from "react-router";

const Login = () => {
    const [show , setShow ] = useState(false);
    const [email , setEmail ] = useState();
    const [password , setPassword] = useState();
    const [loading,  setLoading] = useState(false);

    const handleClick = () => setShow(!show);
    const toast = useToast();
    const history = useHistory(); 
    // const postDetails = (pics) => { } ;

    const submitHandler = async() =>{
      setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    }

  return (
    <VStack spacing="5px">
    
    <FormControl id="email" isRequired>
      <FormLabel>Email Address</FormLabel>
      <Input
        type="email"
        _placeholder={{color:'grey'}}
        border={'1px solid black'}
        value={email}
        _hover={{border:'1px solid black'}}
        placeholder="Enter Your Email Address"
        onChange={(e) => setEmail(e.target.value)}
      />
    </FormControl>
    <FormControl id="password" isRequired>
      <FormLabel>Password</FormLabel>
      <InputGroup size="md">
        <Input
        _placeholder={{color:'grey'}}
        border={'1px solid black'}
          type={show ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          _hover={{border:'1px solid black'}}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleClick} color={'black'}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
    
    
    <Button
      colorScheme="blue"
      width="100%"
      color={'white'}
      style={{ marginTop: 15 }}
      onClick={submitHandler}
      isLoading={loading}
    >
      Login 
    </Button>
    <Box>OR</Box>
    <Button 
        variant={'solid'}
        colorScheme='red'
        width='100%'
        onClick={()=>{
            setEmail("guest@example.com")
            setPassword('123456')
        }}
    >
        Get Guest User Credentials
    </Button>
  </VStack>
  )
}

export default Login