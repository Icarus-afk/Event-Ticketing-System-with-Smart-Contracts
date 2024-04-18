import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateElement = ({ children }) => {
  const token = Cookies.get('token');
  return token ? children : <Navigate to="/signin" />;
};

export default PrivateElement;