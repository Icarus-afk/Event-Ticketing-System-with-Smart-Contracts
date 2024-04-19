import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Spinner } from '@chakra-ui/react';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokensChanged, setTokensChanged] = useState(false); // Add tokensChanged state
  const location = useLocation();

  useEffect(() => {
    const a_Token = Cookies.get('a_Token');
    const r_Token = Cookies.get('r_Token');

    setTokensChanged(true); // Set tokensChanged to true when tokens change
  }, []);

  useEffect(() => {
    if (!tokensChanged) {
      return;
    }

    const checkAuthentication = async () => {
      setIsLoading(true); // Start loading

      const a_Token = Cookies.get('a_Token');
      const r_Token = Cookies.get('r_Token');

      console.log('Access Token:', a_Token);
      console.log('Refresh Token:', r_Token);

      if (!r_Token) {
        console.log('No refresh token found');
        setIsAuthenticated(false);
        setIsLoading(false); // End loading
        return;
      }

      if (a_Token) {
        const [, payload] = a_Token.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);

        console.log('Decoded Payload:', decodedPayload);
        console.log('Current Time:', currentTime);

        if (decodedPayload.exp > currentTime) {
          console.log('Access token is valid');
          setIsAuthenticated(true);
          setIsLoading(false); // End loading
          return;
        } else {
          console.log('Access token is expired');
        }
      }

      try {
        const response = await axios({
          method: 'post',
          url: 'http://localhost:8000/user/refresh-token',
          headers: { 
            'Content-Type': 'application/json', 
          },
          data: JSON.stringify({ token: r_Token })
        });

        console.log('Refresh Token Response:', response);

        if (response.data.success) {
          console.log('Refresh token is valid');
          setIsAuthenticated(true);
        } else {
          console.log('Refresh token is not valid');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
        setIsAuthenticated(false);
      }

      setIsLoading(false); // End loading
    };

    checkAuthentication();

    setTokensChanged(false); // Set tokensChanged back to false after check
  }, [tokensChanged]); // Run this hook when tokensChanged changes

  if (isLoading) {
    return <Spinner />; // Render loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/signin" state={{ from: location }} />;
};

export default PrivateRoute;