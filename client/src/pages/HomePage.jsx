import { Box, Grid, Heading, LinkBox, LinkOverlay, Text, Input, FormControl, Button, Flex } from '@chakra-ui/react';
import { Paginator, Container, PageGroup, usePaginator } from 'chakra-paginator';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../components/customNavbar';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const { currentPage, setCurrentPage } = usePaginator({ initialState: { currentPage: 1 } });
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState(null);
    const [searchDate, setSearchDate] = useState(null);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);

    const fetchEvents = async (search = false) => {
        let url = `http://localhost:8000/event/get?page=${currentPage}&limit=9`;
        if (search) {
            if (searchQuery) url += `&name=${searchQuery}`;
            if (searchDate) url += `&date=${searchDate}`;
        }

        const config = {
            method: 'get',
            url: url,
            headers: {
                'Authorization': `Bearer ${Cookies.get('a_Token')}`
            },
        };

        try {
            const response = await axios(config);
            setEvents(response.data.data);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []); // This will run only once when the component mounts

    useEffect(() => {
        if (searchButtonClicked) {
            fetchEvents(true);
            setSearchButtonClicked(false); // Reset to false after search
        }
    }, [searchButtonClicked]); // This will run when the search button is clicked

    const handleSearch = () => {
        setSearchButtonClicked(true);
    };

    return (
        <>
            <Navbar />
            <Box h="20px" />
            <Flex p={4} justifyContent="space-between">
                <Input placeholder="Search events" onChange={(e) => setSearchQuery(e.target.value)} />
                <FormControl>
                    <Box width="200px" zIndex="3"> {/* Add a high z-index value */}
                        <DatePicker selected={searchDate} onChange={date => setSearchDate(date)} customInput={<Input />} />
                    </Box>
                </FormControl>
                <Button onClick={handleSearch}>Search</Button>
            </Flex>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                {events.map((event, index) => (
                    <LinkBox key={index} as="article">
                        <Box
                            w="full"
                            h="200px"
                            p="10"
                            shadow="lg"
                            borderWidth="1px"
                            bg="purple.500"
                            color="white"
                            borderRadius="lg"
                            _hover={{ transform: 'scale(1.02)' }}
                        >
                            <Heading fontSize="xl" textAlign="center">
                                <LinkOverlay href={`/event/${event.id}`}>{event.name}</LinkOverlay>
                            </Heading>
                            <Text mt={4} textAlign="center">{event.description}</Text>
                        </Box>
                    </LinkBox>
                ))}
            </Grid>
            <Container centerContent>
                <Paginator
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pagesQuantity={totalPages}
                >
                    <Container align="center" justify="space-between" w="full" p={4}>
                        <PageGroup isInline align="center" />
                    </Container>
                </Paginator>
            </Container>
        </>
    );
};

export default HomePage;