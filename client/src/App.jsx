import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import CreateEvent from './pages/CreateEvent';
import PrivateElement from './utils/PrivateRoute';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<PrivateElement><HomePage /></PrivateElement>} />
        <Route path="/create" element={<PrivateElement><CreateEvent /></PrivateElement>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;