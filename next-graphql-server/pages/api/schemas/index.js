import { gql } from "apollo-server-micro";
export const typeDefs = gql`
  type Token {
    address: ID
    blockchainId: Int
    symbol: String
    name: String
    logoURI: String
    decimals: Int
  }
  type Blockchain {
    id: ID
    name: String
    status: String
    provider: String
    last_updated: String
  }
  type BlockchainCheck {
    provider: String
    status: String
  }
  type LimitOrder {
    orderHash: ID
    createDateTime: String
    takerAsset: String
    makerRate: String
    takerRate: String
    makingAmount: String
    takingAmount: String
  }
  type Query {
    #   getBlockchain(id: ID!): Blockchain!
    getBlockchains: [Blockchain]
    updateTokens(id: ID!): [Token]
    getToken(address: ID!, id: Int!): Token
    getTokens(id: ID!): [Token]
    checkBlockchain(id: ID!): BlockchainCheck
    getLimitOrders(id: ID!, address: ID!, first: Int = 100): [LimitOrder]
  }
  type Mutation {
    addBlockchain(id: ID!, name: String!): Blockchain
    deleteBlockchain(id: ID!): Blockchain
  }
`;
