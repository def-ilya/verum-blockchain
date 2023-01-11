import { useRouter } from "next/router";
import { gql, useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Flex,
  Spinner,
  Text,
  Tr,
  Th,
  Td,
  Link,
  Stack,
  Tooltip,
  TableContainer,
  useClipboard,
} from "@chakra-ui/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  Image,
} from "@chakra-ui/react";

const Address = () => {
  const { query, isReady } = useRouter();

  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(false);

  const { onCopy, value, setValue, hasCopied } = useClipboard("");

  const { id, address } = query;

  const GET_ORDERS = gql`
    query ($id: ID!, $address: ID!) {
      getLimitOrders(id: $id, address: $address, first: 100) {
        orderHash
        createDateTime
        takerAsset
        makerRate
        takerRate
        makingAmount
        takingAmount
      }
    }
  `;

  const GET_TOKEN = gql`
    query ($address: ID!, $id: Int!) {
      getToken(address: $address, id: $id) {
        address
        blockchainId
        name
        symbol
        logoURI
      }
    }
  `;

  const [getOrders] = useLazyQuery(GET_ORDERS);
  const [getToken] = useLazyQuery(GET_TOKEN);

  useEffect(() => {
    if (typeof id !== "string" || typeof address !== "string") return;
    getToken({ variables: { id: Number(id), address: address } })
      .then((res) => {
        setToken(res.data.getToken);
      })
      .catch(() => setToken(false));
    getOrders({ variables: { id: id, address: address } })
      .then((res) => {
        setOrders(res.data.getLimitOrders);
      })
      .catch(() => setOrders(false));
  }, [id, address]);

  if (!isReady || !token)
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
  if (!orders)
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
      <Stack paddingY="10" margin="auto" maxWidth="container.xl" marginY>
        <Card
          paddingY="10"
          direction={{ base: "column", sm: "row" }}
          overflow="hidden"
          variant="unstyled"
          justifyContent="center"
        >
          <Image
            objectFit="cover"
            maxW={{ base: "100%", sm: "200px" }}
            src={token.logoURI}
            alt={token.name}
            paddingX="10"
          />

          <Stack marginY="auto" justifyContent="center" alignItems="center">
            <CardBody justifyContent="center" alignItems="center" margin="auto">
              <Heading size="md">{token.symbol}</Heading>
              <Text py="2">{token.name}</Text>
              <Link href={"/blockchain/" + token.blockchainId}>
                <Button variant="solid" colorScheme="blue">
                  View Blockchain
                </Button>
              </Link>
            </CardBody>
          </Stack>
        </Card>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order Hash</Th>
                <Th>Taker Asset</Th>
                <Th>Taking Amount</Th>
                <Th>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.length > 0 &&
                orders.map((order) => {
                  return (
                    <Tr key={order.orderHash}>
                      <Td maxWidth={20} isTruncated>
                        <Tooltip marginTop={"-50%"} label="copy">
                          <Link
                            onClick={(e) => {
                              setValue(e.target.innerText);
                              onCopy();
                            }}
                          >
                            {order.orderHash}
                          </Link>
                        </Tooltip>
                      </Td>
                      <Td isTruncated>
                        <Tooltip placement="right-end" label="copy">
                          <Link
                            onClick={(e) => {
                              setValue(e.target.innerText);
                              onCopy();
                            }}
                          >
                            {order.takerAsset}
                          </Link>
                        </Tooltip>
                      </Td>
                      <Td isTruncated>
                        <Tooltip placement="right-end" label="copy">
                          <Link
                            onClick={(e) => {
                              setValue(e.target.innerText);
                              onCopy();
                            }}
                          >
                            {order.makingAmount}
                          </Link>
                        </Tooltip>
                      </Td>
                      <Td>{order.createDateTime}</Td>
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
};

export default Address;
