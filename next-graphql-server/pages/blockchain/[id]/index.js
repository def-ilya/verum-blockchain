import { useRouter } from "next/router";
import { gql, useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import {
  Card,
  Spinner,
  CardBody,
  CardFooter,
  Stack,
  Flex,
  Heading,
  Divider,
  Button,
  Image,
  Text,
  Link,
} from "@chakra-ui/react";
const Blockchain = () => {
  const { query, isReady } = useRouter();
  const [tokens, setTokens] = useState([]);

  const { id } = query;

  const GET_TOKENS = gql`
    query ($id: ID!) {
      getTokens(id: $id) {
        address
        name
        symbol
        logoURI
      }
    }
  `;

  const { refetch } = useQuery(GET_TOKENS);
  useEffect(() => {
    if (typeof id !== "string") return;

    refetch({ id: id })
      .then((res) => {
        setTokens(res.data.getTokens.slice(0, 100));
      })
      .catch(() => setTokens(false));
  }, [id]);

  if (!isReady || tokens.length < 1)
    return (
      <Flex
        width={"100vw"}
        height={"100vh"}
        alignContent={"center"}
        justifyContent={"center"}
      >
        <Spinner width={50} height={50} margin={"auto"} />
      </Flex>
    );
  if (!tokens)
    return (
      <Flex
        width={"100vw"}
        height={"100vh"}
        alignContent={"center"}
        justifyContent={"center"}
      >
        <Text margin={"auto"}>Couldn&apos;t find this blockchain.</Text>
      </Flex>
    );
  return (
    <>
      <Flex
        paddingY="10"
        maxW="container.xl"
        justifyContent="center"
        margin="auto"
        direction="row"
        wrap="wrap"
        gap="3"
      >
        {tokens.map((token) => (
          <Card key={token.address} maxW="2xs">
            <CardBody>
              <Image
                width="50%"
                margin="auto"
                src={token.logoURI}
                alt={token.name}
                borderRadius="lg"
              />
              <Stack mt="6" spacing="3">
                <Text color="blue.600" fontSize="2xl">
                  {token.symbol}
                </Text>
                <Heading size="md">{token.name}</Heading>
                <Text>{token.address}</Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Link href={`/blockchain/${id}/address/${token.address}`}>
                <Button variant="solid" colorScheme="blue">
                  View
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </Flex>
    </>
  );
};

export default Blockchain;
