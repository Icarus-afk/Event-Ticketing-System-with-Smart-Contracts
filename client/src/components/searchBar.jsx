import { Input, InputGroup } from '@chakra-ui/react';

const SearchBar = () => {
    return (
        <InputGroup size="md" my={4}>
            <Input
                pr="4.5rem"
                type="text"
                placeholder="Search events"
            />

        </InputGroup>
    );
};

export default SearchBar;