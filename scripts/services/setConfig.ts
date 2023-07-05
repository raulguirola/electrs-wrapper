import {
  compat,
  types as T,
} from "../deps.ts";

export const setConfig: T.ExpectedExports.setConfig = async (effects: T.Effects, input:
  ) => {
    
    // deno-lint-ignore no-explicit-any
    const newConfig = input as any;

    const dependsOnBitcoind: T.DependsOn = newConfig?.bitcoind?.type === "internal" ? { bitcoind: [] } : {};

  return await compat.setConfig(effects, input, {
    ...dependsOnBitcoind,
  });
}
