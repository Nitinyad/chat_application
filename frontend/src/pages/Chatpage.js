import { Box } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import ChatbotButton from "../components/miscellaneous/ChatbotButton";
import { useState } from "react";


export const Chatpage = () => {

  const { user } = ChatState();

  const [fetchAgain , setFetchAgain] = useState(false);


  return (
    <div style={{ width: "100%"  }}>
      <div style={{display:"flex"}}>
      {user && <SideDrawer />}
      </div>
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain}  />}
        {user && (
        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
        )}
      </Box>
      <ChatbotButton />
    </div>
  )
}
export default Chatpage;
