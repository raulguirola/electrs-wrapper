import { types as T, compat } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  "electrum-tor-address": {
    name: "Electrum Tor Address",
    description: "The Tor address for the electrum interface.",
    type: "pointer",
    subtype: "package",
    "package-id": "electrs",
    target: "tor-address",
    interface: "electrum",
  },
  bitcoind: {
    variants: {
      internal: {
        type: {
          type: "pointer",
          name: "Bitcoin RPC Type",
          description: "The Bitcoin RPC isntance to connect to",
          subtype: "package",
          "package-id": "bitcoind",
          target: "config",
          multi: false,
          selector: "internal",
        },
        user: {
          type: "pointer",
          name: "RPC Username",
          description: "The username for Bitcoin Core's RPC interface",
          subtype: "package",
          "package-id": "bitcoind",
          target: "config",
          multi: false,
          selector: "$.rpc.username",
        },
        password: {
          type: "pointer",
          name: "RPC Password",
          description: "The password for Bitcoin Core's RPC interface",
          subtype: "package",
          "package-id": "bitcoind",
          target: "config",
          multi: false,
          selector: "$.rpc.password",
        },
      },
    },
  },
  advanced: {
    type: "object",
    name: "Advanced",
    description: "Advanced settings for electrs",
    spec: {
      "log-filters": {
        type: "enum",
        name: "Log Filters",
        values: ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"],
        "value-names": {
          ERROR: "Error",
          WARN: "Warning",
          INFO: "Info",
          DEBUG: "Debug",
          TRACE: "Trace",
        },
        default: "INFO",
      },
      "index-batch-size": {
        type: "number",
        name: "Index Batch Size",
        description:
          "Maximum number of blocks to request from bitcoind per batch\n",
        nullable: true,
        range: "[1,10000]",
        integral: true,
        units: "blocks",
      },
      "index-lookup-limit": {
        type: "number",
        name: "Index Lookup Limit",
        description:
          "Number of transactions to lookup before returning an error, to prevent 'too popular' addresses from causing the RPC server to get stuck (0 - disable the limit)\"\n",
        nullable: true,
        range: "[1,10000]",
        integral: true,
        units: "transactions",
      },
    },
  },
});
