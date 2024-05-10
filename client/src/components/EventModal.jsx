import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, Image, Flex, Heading, Button, ModalFooter } from "@chakra-ui/react";
import PropTypes from 'prop-types';


const EventModal = ({ isOpen, onClose, event }) => {
    console.log("modal---->", event)
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{event?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex direction="column" align="center">
                        <Heading size="lg" mb={4}>{event?.name}</Heading>
                        <Image boxSize="200px" objectFit="cover" src={event?.image} alt={event?.name} mb={4} />
                        <Text fontSize="lg" mb={2}>{event?.date}</Text>
                        <Text fontSize="md" mb={2}>{event?.description}</Text>
                        <Text fontSize="md" mb={2}>{event?.location}</Text>
                        <Text fontSize="md" mb={2}>{event?.time}</Text>
                        <Text fontSize="md" mb={2}>{event?.organizer.name}</Text>
                        {/* <Box d="flex" mt={2} flexWrap="wrap">
                            {event?.tags && Array.isArray(event.tags)
                                ? event.tags.map((tag, index) => (
                                    <Badge key={index} mr={2} mb={2} colorScheme="teal">{tag}</Badge>
                                ))
                                : event?.tags && typeof event.tags === 'string'
                                    ? JSON.parse(event.tags.replace(/(^"\s*\[|\]\s*"$)/g, '')).map((tag, index) => (
                                        <Badge key={index} mr={2} mb={2} colorScheme="teal">{tag}</Badge>
                                    ))
                                    : null
                            }
                        </Box> */}
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

EventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    event: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        date: PropTypes.string,
        time: PropTypes.string,
        price: PropTypes.number,
        totalTickets: PropTypes.number,
        organizer: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            email: PropTypes.string,
            isAdmin: PropTypes.bool,
            isOrganizer: PropTypes.bool,
            isActive: PropTypes.bool
        }),
        eventId: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        attendees: PropTypes.array,
        tags: PropTypes.arrayOf(PropTypes.string),
        image: PropTypes.string,
        __v: PropTypes.number
    })
};


export default EventModal;