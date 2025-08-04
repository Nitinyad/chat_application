import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {
  BrowserRouter as Router
} from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import ChatProvider from './context/ChatProvider';
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ChatProvider>
    <Router>
      <ChakraProvider>
      <App />
      </ChakraProvider>
    </Router>
  </ChatProvider>
  </BrowserRouter>
);
