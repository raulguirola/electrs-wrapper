import { setupManifest } from 'start-sdk/lib/manifest'
import { actionsMetadata } from './procedures/actions'

/**
 * In this function you define static properties of the service
 */
export const manifest = setupManifest({
  id: 'electrs',
  title: 'electrs',
  version: '0.9.14',
  releaseNotes: 'Initial release for StartOS 0.4.0',
  license: 'mit',
  replaces: Array<string>(),
  wrapperRepo: 'https://github.com/Start9Labs/electrs-wrapper',
  upstreamRepo: 'https://github.com/romanz/electrs/',
  supportSite: 'https://github.com/romanz/electrs/issues',
  marketingSite: 'https://github.com/romanz/electrs',
  donationUrl: 'https://donate.start9.com/',
  description: {
    short: 'An efficient re-implementation of Electrum Server in Rust',
    long: 'An efficient re-implementation of Electrum Server, inspired by ElectrumX, Electrum Personal Server and bitcoincore-indexd. The motivation behind this project is to enable a user to self host an Electrum server, with required hardware resources not much beyond those of a full node. The server indexes the entire Bitcoin blockchain, and the resulting index enables fast queries for any given user wallet, allowing the user to keep real-time track of balances and transaction history using the Electrum wallet. Since it runs on the users own machine, there is no need for the wallet to communicate with external Electrum servers, thus preserving the privacy of the users addresses and balances.',
  },
  assets: {
    license: 'LICENSE',
    icon: 'assets/icon.png',
    instructions: 'assets/instructions.md',
  },
  volumes: {
    // This is the image where files from the project asset directory will go
    main: 'data',
  },
  containers: {
    main: {
      // Identifier for the main image volume, which will be used when other actions need to mount to this volume.
      image: 'main',
      // Specifies where to mount the data volume(s), if there are any. Mounts for pointer dependency volumes are also denoted here. These are necessary if data needs to be read from / written to these volumes.
      mounts: {
        // Specifies where on the service's file system its persistence directory should be mounted prior to service startup
        main: '/data',
      },
    },
  },
  actions: actionsMetadata,
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    'bitcoind': {
      version: '>=25.0.0',
      description: 'electrs must have access to the bitcoin blockchain',
      requirement: { type: 'required' },
      /** uncomment for Hello World conditional */
      // requirement: { type: 'opt-in', how: 'Enable in config' }
    },
  },
})

export type Manifest = typeof manifest
