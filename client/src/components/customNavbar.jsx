import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import deleteCookies from '../utils/DeleteCookies'; // Replace with the actual path to deleteTokens

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        deleteCookies(); // Delete the tokens
        navigate('/signin'); // Redirect to the sign-in page
    };

    return (
        <Box bg="purple.700" w="full" p={4} color="white">
            <Flex align="center">
                <Button variant="ghost" colorScheme="whiteAlpha">
                    Profile
                </Button>
                <Spacer />
                <Button variant="ghost" colorScheme="whiteAlpha" onClick={handleLogout}>
                    Logout
                </Button>
            </Flex>
        </Box>
    );
};

export default Navbar;