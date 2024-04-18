import { Box, Button, Flex, Spacer } from '@chakra-ui/react';

const Navbar = ({ onLogout }) => {
    return (
        <Box bg="purple.700" w="full" p={4} color="white">
            <Flex align="center">
                <Button variant="ghost" colorScheme="whiteAlpha">
                    Profile
                </Button>
                <Spacer />
                <Button variant="ghost" colorScheme="whiteAlpha" onClick={onLogout}>
                    Logout
                </Button>
            </Flex>
        </Box>
    );
};

export default Navbar;