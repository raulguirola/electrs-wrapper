import { Backups } from "../../deps.ts";

export const { createBackup, restoreBackup } = Backups.with_options({exclude: ['db']}).volumes("main").build();