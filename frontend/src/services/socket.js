import { io } from "socket.io-client";
import { useToast } from "@chakra-ui/react";
const socket = io("http://localhost:5000");
const toast = useToast();
socket.on("messageBlocked", (msg) => {
    // alert(msg);
    toast({
        title: "Your Message was flagged as abusive",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
});

export default socket;
