import { Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const PrivateElement = ({ children }) => {
  const navigate = useNavigate();
  const refreshToken = Cookies.get('r_Token');

  if (!refreshToken) {
    return <Navigate to="/signin" />;
  }

  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      console.log(originalRequest)

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const data = JSON.stringify({ "token": refreshToken });
          const config = {
            method: 'post',
            url: 'http://localhost:8000/user/refresh-token',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${refreshToken}`
            },
            data : data
          };

          const response = await axios.request(config);
          Cookies.set('a_Token', response.data.accessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.accessToken;
          return axios(originalRequest);
        } catch (err) {
          console.log("error",err)
          Cookies.remove('a_Token');
          Cookies.remove('r_Token');
          navigate('/signin');
        }
      }

      return Promise.reject(error);
    }
  );

  return children;
};

export default PrivateElement;