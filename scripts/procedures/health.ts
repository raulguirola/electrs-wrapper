import { healthUtil, matches, types as T, util, YAML } from "../deps.ts";

export const health: T.ExpectedExports.health = {
  async "electrum"(effects, duration) {
    try {
      await healthUtil.guardDurationAboveMinimum({
        duration: duration,
        minimumTime: 5000,
      });
    } catch (e) {
      return e;
    }
    const result = await effects.runCommand({
      command: "check-electrum.sh",
      args: [],
    });
    if ("result" in result) {
      return { result: null };
    }
    return result;
  },
  async "synced"(effects) {
    const result = await effects.runCommand({
      command: "check-synced.sh",
      args: [],
    });
    if ("result" in result) {
      return { result: null };
    }
    return result;
  },
};
