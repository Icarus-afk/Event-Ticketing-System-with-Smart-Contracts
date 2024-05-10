import { Box, Flex, Input, Button, Grid, Image, Text, useDisclosure, IconButton } from '@chakra-ui/react';
import { FaRegClock, FaRegEye } from 'react-icons/fa';
import { usePaginator, Paginator, Container, PageGroup } from 'chakra-paginator';
import axios from 'axios';
import Navbar from '../components/customNavbar';
import { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EventModal from '../components/EventModal'
import BASE_URL from '../config';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const { currentPage, setCurrentPage } = usePaginator({ initialState: { currentPage: 1 } });
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState(null);
    const [searchDate, setSearchDate] = useState(null);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();



    const fetchEvents = useCallback(async (search = false) => {
        let url = `${BASE_URL}event/get?page=${currentPage}&limit=9`;
        if (search) {
            if (searchQuery) url += `&name=${searchQuery}`;
            if (searchDate) url += `&date=${searchDate}`;
        }

        const config = {
            method: 'get',
            url: url,
            withCredentials: true
        };

        try {
            const response = await axios(config);
            console.log(response);
            setEvents(response.data.data);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }, [currentPage, searchQuery, searchDate, setCurrentPage]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        if (searchButtonClicked) {
            fetchEvents(true);
            setSearchButtonClicked(false);
        }
    }, [searchButtonClicked, fetchEvents]);

    const handleSearch = () => {
        setSearchButtonClicked(true);
    };

    const handleEventClick = async (eventId) => {
        console.log('handleEventClick called with eventId:', eventId);
    
        event.stopPropagation();
    
        const url = `${BASE_URL}event/get/?eventId=${eventId}`;
        console.log("url -->", url);
        const config = {
            method: 'get',
            url: url,
            withCredentials: true
        };
    
        try {
            const response = await axios(config);
            console.log(response.data)
            setSelectedEvent(response.data.data[0]); // Access the first element of the data array
        } catch (error) {
            console.error('Failed to fetch event:', error);
        }
    };
    
    useEffect(() => {
        if (selectedEvent) {
            console.log(selectedEvent);
            onOpen();
        }
    }, [onOpen, selectedEvent]);


    return (
        <>
            <Navbar />
            <Box h="20px" />
            <Flex p={4} justifyContent="center">
                <Box width="300px" pr={1}>
                    <Input
                        placeholder="Search events"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        color="black"
                        bg="#E6E6FA" // Light purple tint
                        _placeholder={{ color: 'black' }}
                    />
                </Box>
                <Box width="250px" bg="#E6E6FA">
                    <DatePicker
                        showIcon
                        placeholderText="Search by Date"
                        selected={searchDate}
                        onChange={date => setSearchDate(date)}
                        customInput={<Input color="black" _placeholder={{ color: 'black' }} />}
                        isClearable
                    />
                </Box>
                <Button colorScheme="purple" size="md" onClick={handleSearch} ml={1}>Search</Button>
            </Flex>
            <Flex justifyContent="center">
                <Grid
                    templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={6}
                    p={4}
                    justifyContent="start"
                >
                    {events.map((event) => (
                        <Box
                            maxW="md"
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            boxShadow="lg"
                            bg="white"
                            key={event._id}
                        >
                            <Box boxSize="400px">
                                <Image
                                    src={event.image && event.image !== "http://localhost:8000/" ? event.image : "/src/assets/event_placeholder.png"}
                                    alt={event.name}
                                    objectFit="cover"
                                />
                            </Box>
                            <Box p="6">
                                <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                                    {event.name}
                                </Box>
                                <Box d="flex" alignItems="center" mt={2}>
                                    <FaRegClock size={20} style={{ marginRight: '5px' }} />
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                </Box>
                                <Text mt={2}>{event.description}</Text>
                                <IconButton
                                    aria-label="Open event"
                                    icon={<FaRegEye />}
                                    onClick={() => handleEventClick(event.eventId)}
                                />
                            </Box>
                        </Box>
                    ))}
                </Grid>
                {selectedEvent && <EventModal isOpen={isOpen} onClose={onClose} event={selectedEvent} />}

            </Flex>
            <Box display="flex" justifyContent="center" mt={4}>
                <Paginator
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pagesQuantity={totalPages}
                    pagesRendered={5}
                    containerStyles={{
                        justify: "center",
                    }}
                    pageButtonRender={(page, _, props) => (
                        <Button {...props} colorScheme="teal" variant="outline" p={2} m={1}>
                            {page}
                        </Button>
                    )}
                >
                    <Container align="center" justify="center" w="full" p={4}>
                        <PageGroup isInline align="center" />
                    </Container>
                </Paginator>
            </Box>
        </>
    );
};

export default HomePage;