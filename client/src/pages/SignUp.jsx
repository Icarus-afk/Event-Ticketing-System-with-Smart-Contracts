import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Box, VStack, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useCustomToast } from '../components/useCustomToast';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';


const SignUp = () => {
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isOrganizer: false,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = JSON.stringify(formData);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${BASE_URL}user/signup`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        try {
            const response = await axios(config);
            if (response.data.success) {
                showSuccessToast(response.data.message);
                navigate('/signin'); 
            } else {
                showErrorToast(response.data.message);
            }
        } catch (error) {
            showErrorToast(error.response && error.response.data.message ? error.response.data.message : "An error occurred...");
        }
    };

    return (
        <VStack align="center" justify="center" h="100vh" bg="gray.100">
            <Heading mb="6" size="lg" fontWeight="bold" color="purple.500">Sign up</Heading>
            <Box as="form" onSubmit={handleSubmit} p="6" bg="white" rounded="md" shadow="md" w="md">
                <Input type="email" name="email" placeholder="Email Address" required onChange={handleChange} borderColor="purple.500" focusBorderColor="purple.700" />
                <Input type="password" name="password" placeholder="Password" required onChange={handleChange} mt="4" borderColor="purple.500" focusBorderColor="purple.700" />
                <Input type="text" name="firstName" placeholder="First Name" required onChange={handleChange} mt="4" borderColor="purple.500" focusBorderColor="purple.700" />
                <Input type="text" name="lastName" placeholder="Last Name" required onChange={handleChange} mt="4" borderColor="purple.500" focusBorderColor="purple.700" />

                <Button colorScheme="purple" w="full" mt="6" type="submit">Sign Up</Button>
                <Text textAlign="center" mt="6">
                    Already have an account? <Box as={Link} to="/signin" color="purple.500" _hover={{ color: 'purple.700' }}>Sign In</Box>
                </Text>
            </Box>

        </VStack>
    );
};

export default SignUp;