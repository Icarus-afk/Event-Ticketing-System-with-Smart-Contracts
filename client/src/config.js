let BASE_URL = '';


const NODE_ENV='development';

if (NODE_ENV === 'development') {
    BASE_URL = 'http://127.0.0.1:8000/';
} else if (NODE_ENV === 'production') {
    BASE_URL = 'https://your-production-url.com/';
}

export default BASE_URL;