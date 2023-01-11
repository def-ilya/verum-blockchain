import { useState } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Flex,
  Button,
} from "@chakra-ui/react";

import { gql, useMutation } from "@apollo/client";

export default function AddBlockchain() {
  const ADD_BLOCKCHAIN = gql`
    mutation ($id: ID!, $name: String!) {
      addBlockchain(id: $id, name: $name) {
        id
        name
      }
    }
  `;

  const [input, setInput] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(false);
  const [addBlockchain, { error, data }] = useMutation(ADD_BLOCKCHAIN);

  const handleInputChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  async function submitForm() {
    setLoading(true);
    await addBlockchain({ variables: { id: input.id, name: input.name } })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
  }

  return (
    <Flex
      maxWidth="container.xl"
      height="80vh"
      margin="auto"
      justifyContent="center"
      alignItems="center"
    >
      <FormControl maxWidth="md">
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          name="name"
          value={input.name}
          onChange={handleInputChange}
          marginBottom="3"
        />
        <FormLabel>Blockchain ID</FormLabel>
        <Input
          type="text"
          name="id"
          value={input.id}
          onChange={handleInputChange}
        />
        <FormHelperText>
          Fill in the Blockchain's details. You can get these from 1inch.
        </FormHelperText>

        <Button mt={4} colorScheme="teal" type="submit" onClick={submitForm}>
          {loading ? "Loading..." : "Add Blockchain"}
        </Button>
        <FormHelperText color="green.500">
          {data ? JSON.stringify(data) : ""}
        </FormHelperText>
        <FormHelperText color="red.500">
          {error ? error.message : ""}
        </FormHelperText>
      </FormControl>
    </Flex>
  );
}
