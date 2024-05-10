import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, HStack, Heading, Flex } from '@chakra-ui/react';
import axios from 'axios';
import Cookies from 'js-cookie';
import BASE_URL from '../config';


const CreateEventPage = () => {
    const [event, setEvent] = useState({
        name: '',
        date: '',
        time: '',
        price: '',
        totalTickets: '',
        eventId: '',
        location: '',
        description: '',
        tags: '',
        image: ''
    });

    const handleChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setEvent({ ...event, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(event).forEach(key => {
            if (key === 'image') {
                formData.append(key, event[key]);
            } else {
                formData.append(key, event[key]);
            }
        })

        let config = {
            method: 'post',
            url: `${BASE_URL}event/create`,
            headers: {
                'Authorization': `Bearer ${Cookies.get('a_Token')}`
            },
            data: formData
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <Flex justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white" flex="0 1 800px">
                <Heading mb={5}>Create Event</Heading>
                <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                    <FormControl id="date-time">
                        <FormLabel>Date and Time</FormLabel>
                        <HStack>
                            <Input type="date" name="date" value={event.date} onChange={handleChange} placeholder="Date" />
                            <Input type="time" name="time" value={event.time} onChange={handleChange} placeholder="Time" />
                        </HStack>
                    </FormControl>
                    <FormControl id="details">
                        <FormLabel>Event Details</FormLabel>
                        <VStack spacing={2}>
                            <Input type="text" name="location" value={event.location} onChange={handleChange} placeholder="Location" />
                            <Input type="number" name="price" value={event.price} onChange={handleChange} placeholder="Price" />
                            <Input type="number" name="totalTickets" value={event.totalTickets} onChange={handleChange} placeholder="Total Tickets" />
                        </VStack>
                    </FormControl>
                    <FormControl id="description">
                        <FormLabel>Description</FormLabel>
                        <Textarea name="description" value={event.description} onChange={handleChange} placeholder="Describe the event..." />
                    </FormControl>
                    <FormControl id="tags">
                        <FormLabel>Tags</FormLabel>
                        <Input type="text" name="tags" value={event.tags} onChange={handleChange} placeholder="Enter tags separated by commas" />
                    </FormControl>
                    <FormControl id="image">
                        <FormLabel>Event Image</FormLabel>
                        <Input type="file" name="image" onChange={handleImageChange} />
                    </FormControl>
                    <Button colorScheme="teal" type="submit">Create Event</Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default CreateEventPage;