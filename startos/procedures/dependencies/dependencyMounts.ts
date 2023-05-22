import { sdk } from '../../sdk'
import { manifest as bitcoindManifest } from 'bitcoind-startos/startos/manifest'

export const dependencyMounts = sdk
  .setupDependencyMounts()
  .addPath({
    name: 'dataDir',
    manifest: bitcoindManifest,
    volume: 'main',
    path: '/data/.bitcoin',
    readonly: true,
  })
  .build()
