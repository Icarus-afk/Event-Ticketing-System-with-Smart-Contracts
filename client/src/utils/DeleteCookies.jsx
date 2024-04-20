import Cookies from 'js-cookie';

const deleteCookies = () => {
  Cookies.remove('a_Token');
  Cookies.remove('r_Token');
};

export default deleteCookies;