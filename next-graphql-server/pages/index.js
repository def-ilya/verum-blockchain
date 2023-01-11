import Head from "next/head";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Link,
  Stack,
  Badge,
  Flex,
  Center,
} from "@chakra-ui/react";

import { Stat, StatLabel, StatNumber } from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";

import { gql, useMutation } from "@apollo/client";
import client from "../apollo-client";

export default function Home({ blockchains }) {
  const DELETE_BLOCKCHAIN = gql`
    mutation ($id: ID!) {
      deleteBlockchain(id: $id) {
        id
        name
      }
    }
  `;
  const toast = useToast();
  const [items, setItems] = useState(blockchains);

  const remove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const [deleteBlockchain, { data, error }] = useMutation(DELETE_BLOCKCHAIN);
  return (
    <Flex>
      {items.length < 1 && (
        <Center width="100vw" height="80vh">
          <Text fontSize={18}>
            Doesn't look like there's anything here.{" "}
            <Link color="teal" href="/add-blockchain">
              Try add a blockchain.
            </Link>
          </Text>
        </Center>
      )}
      <SimpleGrid
        paddingY={20}
        maxWidth="container.xl"
        margin="auto"
        justifyContent="center"
        alignItems="center"
        spacing={4}
      >
        {items.map((item, index) => {
          return (
            <Card key={item.id} paddingX="5">
              <CardHeader>
                <Heading size="md">{item.name}</Heading>
              </CardHeader>
              <CardBody>
                <Stack direction="row" spacing={10} paddingBottom={3}>
                  <Stat>
                    <StatLabel>ID</StatLabel>
                    <StatNumber>{item.id}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Status</StatLabel>
                    <StatNumber>{item.status}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Provider</StatLabel>
                    <StatNumber>{item.provider}</StatNumber>
                  </Stat>
                </Stack>
                <Badge>
                  {(
                    (new Date() - new Date(item.last_updated)) /
                    60 /
                    1000
                  ).toFixed(0)}{" "}
                  minutes ago
                </Badge>
              </CardBody>
              <CardFooter>
                <Link href={"/blockchain/" + item.id}>
                  <Button variant="solid" colorScheme="blue">
                    View here
                  </Button>
                </Link>
                <Link
                  onClick={(e) =>
                    deleteBlockchain({ variables: { id: item.id } })
                      .then((res) => {
                        toast({
                          title: "Successfully deleted",
                          description: JSON.stringify(res.data),
                          status: "success",
                          duration: 9000,
                          isClosable: true,
                        });
                        remove(index);
                      })
                      .catch((err) => {
                        toast({
                          title: "Something went wrong",
                          description: JSON.stringify(err),
                          status: "error",
                          duration: 9000,
                          isClosable: true,
                        });
                      })
                  }
                  marginLeft="auto"
                >
                  <Button fontWeight="light" color="red.300" variant="unstyled">
                    Remove
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}

export async function getServerSideProps() {
  const GET_BLOCKCHAINS = gql`
    query {
      getBlockchains {
        id
        name
        provider
        status
        last_updated
      }
    }
  `;

  const blockchains = await client
    .query({
      fetchPolicy: "no-cache",
      query: GET_BLOCKCHAINS,
    })
    .then((res) => res.data.getBlockchains);
  return {
    props: { blockchains: blockchains }, // will be passed to the page component as props
  };
}
