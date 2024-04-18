import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Box, VStack, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useCustomToast } from '../components/useCustomToast';

const SignIn = () => {
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = {
            method: 'post',
            url: 'http://localhost:8000/user/signin',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ email, password }),
        };

        try {
            const response = await axios(config);
            if (response.data.success) {
                showSuccessToast(response.data.message);
            } else {
                showErrorToast(response.data.message);
            }
        } catch (error) {
            showErrorToast(error.response && error.response.data.message ? error.response.data.message : "An error occurred...");
        }
    };

    return (
        <VStack align="center" justify="center" h="100vh" bg="gray.100">
            <Heading mb="6" size="lg" fontWeight="bold" color="purple.500">Sign In</Heading>
            <Box as="form" onSubmit={handleSubmit} p="6" bg="white" rounded="md" shadow="md" w="md">
                <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} borderColor="purple.500" focusBorderColor="purple.700" />
                <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} mt="4" borderColor="purple.500" focusBorderColor="purple.700" />
                <Button colorScheme="purple" w="full" mt="6" type="submit">Sign In</Button>
                <Text textAlign="center" mt="6">
                   Don't have an account? <Box as={Link} to="/signup" color="purple.500" _hover={{ color: 'purple.700' }}>Sign Up</Box>
                </Text>
            </Box>
        </VStack>
    );
};

export default SignIn;