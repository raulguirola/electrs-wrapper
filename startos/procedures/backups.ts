import { sdk } from '../sdk'

export const { createBackup, restoreBackup } = sdk.with_options({exclude: ['db']}).setupBackups('main')
