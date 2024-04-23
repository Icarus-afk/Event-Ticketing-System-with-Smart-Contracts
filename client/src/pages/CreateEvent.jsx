import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack } from '@chakra-ui/react';
import axios from 'axios';
import Cookies from 'js-cookie';


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
            url: 'http://127.0.0.1:8000/event/create',
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
        <Box p={5}>
            <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                <FormControl id="name">
                    <FormLabel>Event Name</FormLabel>
                    <Input type="text" name="name" value={event.name} onChange={handleChange} />
                </FormControl>
                <FormControl id="date">
                    <FormLabel>Date</FormLabel>
                    <Input type="date" name="date" value={event.date} onChange={handleChange} />
                </FormControl>
                <FormControl id="time">
                    <FormLabel>Time</FormLabel>
                    <Input type="time" name="time" value={event.time} onChange={handleChange} />
                </FormControl>
                <FormControl id="price">
                    <FormLabel>Price</FormLabel>
                    <Input type="number" name="price" value={event.price} onChange={handleChange} />
                </FormControl>
                <FormControl id="totalTickets">
                    <FormLabel>Total Tickets</FormLabel>
                    <Input type="number" name="totalTickets" value={event.totalTickets} onChange={handleChange} />
                </FormControl>
                <FormControl id="location">
                    <FormLabel>Location</FormLabel>
                    <Input type="text" name="location" value={event.location} onChange={handleChange} />
                </FormControl>
                <FormControl id="description">
                    <FormLabel>Description</FormLabel>
                    <Textarea name="description" value={event.description} onChange={handleChange} />
                </FormControl>
                <FormControl id="tags">
                    <FormLabel>Tags</FormLabel>
                    <Input type="text" name="tags" value={event.tags} onChange={handleChange} />
                </FormControl>
                <FormControl id="image">
                    <FormLabel>Image</FormLabel>
                    <Input type="file" name="image" onChange={handleImageChange} />
                </FormControl>
                <Button colorScheme="blue" type="submit">Create Event</Button>
            </VStack>
        </Box>
    );
};

export default CreateEventPage;