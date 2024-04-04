import Admin from './Admin';
import User from './User';

const routes = [
  {
    path: '/organizer',
    component: Admin,
  },
  {
    path: '/',
    component: User,
  },
];

export default routes;