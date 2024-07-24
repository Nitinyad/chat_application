// import logo from './logo.svg';
import { Route } from "react-router-dom";
import './App.css';
import { HomePage } from "./pages/HomePage";
import Chatpage from "./pages/Chatpage";
// import { Button } from '@chakra-ui/react'


function App() {
  return (
    <div className="App">
      <Route exact path="/" component = {HomePage}/>
      <Route path="/chats" component = {Chatpage}/>
    </div>
  );
}

export default App;
