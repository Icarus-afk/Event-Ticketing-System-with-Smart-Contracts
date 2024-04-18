import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// import SignUp from './pages/SignUp'
import { ChakraProvider } from "@chakra-ui/react"


ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </ChakraProvider>

)
