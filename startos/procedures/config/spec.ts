import { configBuilder } from 'start-sdk/lib'
import { Value } from 'start-sdk/lib/config/builder'
const { Config } = configBuilder

/**
 * Here you define the config specification that will ultimately present to the user as validated form inputs
 *
 * Most form controls are available, including text, textarea, number, toggle, select, multiselect, list, color, datetime, object (a subform), and union (a conditional subform)
 *
 */
export const configSpec = Config.of({
  advanced: Value.object(
    {
      name: "Advanced",
      description: "Advanced settings for Bitcoin Proxy",
      warning: null,
    },
    Config.of({
      "log-filters": Value.select({
        name: "Log Filters",
        description: null,
        warning: null,
        required: {
          default: "INFO",
        },
        values: {
          ERROR: "ERROR",
          WARN: "WARN",
          INFO: "INFO",
          DEBUG: "DEBUG",
          TRACE: "TRACE",
        },
      } as const),
      "index-batch-size":
        Value.number({
          name: "Index Batch Size",
          description:
            "Maximum number of blocks to request from bitcoind per batch\n",
          warning: null,
          required: false,
          min: 1,
          max: 10000,
          step: null,
          integer: true,
          units: "blocks",
          placeholder: null,
        }),
      "index-lookup-limit":
        Value.number({
          name: "Index Lookup Limit",
          description:
            "Number of transactions to lookup before returning an error, to prevent 'too popular' addresses from causing the RPC server to get stuck (0 - disable the limit)\"\n",
          warning: null,
          required: false,
          min: 1,
          max: 10000,
          step: null,
          integer: true,
          units: "transactions",
          placeholder: null,
        }),
    }),
  ),
})
export const matchConfigSpec = configSpec.validator()
export type ConfigSpec = typeof matchConfigSpec._TYPE
