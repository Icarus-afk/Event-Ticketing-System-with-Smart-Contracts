import { Box, Flex, Input, Button, Grid, LinkBox, LinkOverlay, Image, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { usePaginator, Paginator, Container, PageGroup } from 'chakra-paginator';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../components/customNavbar';
import { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const { currentPage, setCurrentPage } = usePaginator({ initialState: { currentPage: 1 } });
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState(null);
    const [searchDate, setSearchDate] = useState(null);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);

    const fetchEvents = useCallback(async (search = false) => {
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
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} p={4}>
                {events.map((event) => (
                    <LinkBox as={Box} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="lg" bg="white" key={event._id}>
                        <Box boxSize="100%" aspectRatio={16 / 9}>
                            <Image src={event.image} alt={event.name} objectFit="cover" />
                        </Box>
                        <Box p="6">
                            <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                                <LinkOverlay href={`/event/${event._id}`}>{event.name}</LinkOverlay>
                            </Box>
                            <Box d="flex" alignItems="center" mt={2}>
                                <FaRegClock size={20} style={{ marginRight: '5px' }} />
                                {new Date(event.date).toLocaleDateString()} at {event.time}
                            </Box>
                            <Text mt={2}>{event.description}</Text>
                        </Box>
                    </LinkBox>
                ))}
            </Grid>
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