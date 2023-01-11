import { createClient } from "@supabase/supabase-js";
import client from "../../../apollo-client";
import { gql } from "apollo-server-micro";
import { GraphQLError } from "graphql";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLIC_KEY
);

var ONE_HOUR = 60 * 60 * 1000; /* ms */

export const resolvers = {
  Query: {
    updateTokens: async (_, args) => {
      try {
        const tokens = await fetch(`${process.env.API_URL}${args.id}/tokens`)
          .then((res) => res.json())
          .then((data) => {
            const formatted = Object.values(data.tokens);
            return formatted.map(
              ({ address, symbol, name, logoURI, decimals }) => ({
                address,
                symbol,
                name,
                logoURI,
                decimals,
                blockchainId: args.id,
              })
            );
          });

        await supabase.from("tokens").upsert(tokens).select();
        const { error } = await supabase
          .from("blockchains")
          .update({ last_updated: new Date().toISOString() })
          .eq("id", args.id);

        if (error) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          });
        }

        return tokens;
      } catch (err) {
        throw err;
      }
    },
    getToken: async (_, args) => {
      try {
        const lastUpdated = await supabase
          .from("blockchains")
          .select()
          .eq("id", args.id)
          .then((res) => {
            return new Date(res.data[0].last_updated);
          });

        //we check if the data is more than 1hr old
        if (new Date() - lastUpdated < ONE_HOUR) {
          await client.query({
            query: gql`
              query ($id: ID!) {
                updateTokens(id: $id) {
                  address
                }
              }
            `,
            variables: {
              id: args.id,
            },
          });
        }

        const tokens = await supabase
          .from("tokens")
          .select()
          .match({ blockchainId: args.id, address: args.address })
          .then(({ data }) => {
            return data.map(
              ({ address, symbol, name, logoURI, decimals, created_at }) => ({
                address,
                symbol,
                name,
                logoURI,
                decimals,
                blockchainId: args.id,
                created_at,
              })
            );
          });
        return tokens[0];
      } catch (err) {
        throw err;
      }
    },
    getTokens: async (_, args) => {
      try {
        const lastUpdated = await supabase
          .from("blockchains")
          .select()
          .eq("id", args.id)
          .then((res) => {
            return new Date(res.data[0].last_updated);
          });

        //we check if the data is more than 1hr old
        if (new Date() - lastUpdated > ONE_HOUR) {
          console.log("record older than 1hr... updating");
          await client.query({
            query: gql`
              query ($id: ID!) {
                updateTokens(id: $id) {
                  address
                }
              }
            `,
            variables: {
              id: args.id,
            },
          });
        }

        const tokens = await supabase
          .from("tokens")
          .select()
          .match({ blockchainId: args.id })
          .then(({ data }) => {
            return data.map(
              ({ address, symbol, name, logoURI, decimals, created_at }) => ({
                address,
                symbol,
                name,
                logoURI,
                decimals,
                blockchainId: args.id,
                created_at,
              })
            );
          });
        return tokens;
      } catch (err) {
        throw err;
      }
    },
    getLimitOrders: async (_, args) => {
      try {
        let orders = await fetch(
          `${process.env.LIMIT_ORDER_URL}${args.id}/limit-order/all?makerAsset=${args.address}&limit=${args.first}`
        )
          .then((res) => res.json())
          .then((data) => data);

        orders = orders.map((order) => {
          return { ...order.data, ...order };
        });
        return orders;
      } catch (err) {
        throw err;
      }
    },
    getBlockchains: async (_, args) => {
      try {
        const { data, error } = await supabase.from("blockchains").select();
        if (error) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          });
        }
        return data;
      } catch (err) {
        throw err;
      }
    },
    checkBlockchain: async (_, args) => {
      try {
        return await fetch(`${process.env.API_URL}${args.id}/healthcheck`)
          .then((res) => res.json())
          .then((data) => data);
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    addBlockchain: async (_, args) => {
      try {
        const healthCheck = await client
          .query({
            query: gql`
              query ($id: ID!) {
                checkBlockchain(id: $id) {
                  status
                  provider
                }
              }
            `,
            variables: {
              id: args.id,
            },
          })
          .then(({ data }) => {
            return { ...data.checkBlockchain };
          });

        if (!healthCheck.status) {
          throw new GraphQLError("That blockchain doesn't exist.", {
            extensions: { code: 400 },
          });
        }

        const { error } = await supabase.from("blockchains").insert({
          id: args.id,
          name: args.name,
          provider: healthCheck.provider,
          status: healthCheck.status,
          last_updated: new Date().toISOString(),
        });

        if (error) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          });
        }
        //populate the database with this blockchain's tokens
        await client.query({
          query: gql`
            query ($id: ID!) {
              updateTokens(id: $id) {
                address
              }
            }
          `,
          variables: {
            id: args.id,
          },
        });

        return { id: args.id, name: args.name };
      } catch (err) {
        throw err;
      }
    },
    deleteBlockchain: async (_, args) => {
      try {
        const { error } = await supabase
          .from("blockchains")
          .delete()
          .eq("id", args.id);

        if (error) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          });
        }

        return { id: args.id };
      } catch (err) {
        throw err;
      }
    },
  },
};
