import { sdk } from '../../sdk'
import { defaultYaml, yamlFile } from '../config/file-models/settings.yml'

export const v0_9_14 = sdk.Migration.of({
  version: '0.9.14',
  up: async ({ effects }) => {
    await yamlFile.write(defaultYaml, effects)

    // remove old start9 dir
    await effects.runCommand(['rm', '-rf', '/root/start9'])
  },
  down: async ({ effects }) => {
    throw new Error('Downgrade not permitted')
  },
})
