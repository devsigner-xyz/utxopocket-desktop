# UTXO Pocket - Bitcoin Watch-Only Wallet

UTXO Pocket is an advanced Bitcoin wallet built with Vue 3 and TypeScript, designed for managing and visualizing Unspent Transaction Outputs (UTXOs). As a watch-only wallet, it leverages a backend developed in NestJS, integrated with Bitcoiner Lab, Redis, and bitcoinjs-lib. It uses `pnpm` workspaces to setup a monorepo. 

The application allows secure and efficient connections to Bitcoin nodes using the Electrum protocol. Connect to your local node or to a remote trusted one. Below is an updated description of the project with key details:

## Features

- **Watch-Only Wallet**: Add multiple Bitcoin wallet descriptors and monitor balances, UTXOs, and transactions without spending permissions.
- **Custom UTXO Collections**: Organize UTXOs into custom collections for streamlined tracking.
- **Detailed UTXO and Transaction Views**: Display Bitcoin transaction details and inspect UTXO information such as addresses, script types, and values.
- **Electrum Server Connectivity**: The application connects to Electrum servers to fetch live Bitcoin data (UTXOs, balances, and transactions), offering secure, read-only access to blockchain information.
- **Data Visualization**: Use dynamic visualizations for UTXO, balance, and transaction histories.
- **Descriptor Wallet**:    Support for Bitcoin Descriptors, which enable detailed wallet structure definitions. Descriptors allow users to specify complex Bitcoin scripts, offering flexibility in how addresses are derived and managed. Supported descriptors:

   - pk(xpub/tpub...): Pay-to-PubKey.
   - pkh(xpub/tpub...): Pay-to-PubKey-Hash.
   - wpkh(xpub/tpub...): Pay-to-Witness-PubKey-Hash.
   - sh(wpkh(xpub/tpub...)): Pay-to-Script-Hash from Native SegWit.

## Architecture

### Frontend

The frontend is developed using Vue 3 with TypeScript for responsive and performant interfaces, Pinia for structured state management, enabling storage of wallet data, UTXO details, and user preferences, Vuetify and Vue Echarts for a visually appealing UI, and is Dockerized for deployment consistency and an isolated frontend environment.

### Backend

The backend uses NestJS with TypeScript for structured and scalable API handling. Bitcoiner Lab is integrated to parse and manage Bitcoin wallet data, while the Electrum Explorer provides real-time data from Electrum servers. Redis caching is implemented to improve performance by minimizing repetitive API calls. The backend is also Dockerized to maintain a consistent environment across development and production setups.

## Setup

### Docker Setup

The application is fully Dockerized for easy setup. Below is a guide to running the application using Docker:

   - [Download, install and start Docker](https://www.docker.com/)

   - Clone the repository:

        -   Run: `git clone https://github.com/strhodler/utxopocket-desktop.git`
        -   Navigate to the directory: `cd utxo-pocket`

   - Start the Application with Docker Compose

     - Build the Docker images

        ```bash
        docker-compose build
        ```

     - Start the services

        ```bash
        docker-compose up
        ```

        If you want the services to run in detached mode (in the background):

        ```bash
        docker-compose up -d

        // Verify the logs and service status:
        docker-compose logs -f backend
        ```

### Access application

   - **Frontend:** Open your browser and navigate to [http://localhost:5173](http://localhost:5173).
     - Navigate to Settings.
     - Choose testnet or mainnet.
     - Add your local Electrum Server host and port or connect to one of the default servers.
     - Add your wallet descriptor or use this Native SegWit wallet for testing purposes: `wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e)`.
     - Click "Add wallet" and wait until you see utxos, transactions and addesses numbers going up.
     - Explore the app and give feedback via GitHub Issues.
  
   - **Backend:** If you need to access the backend endpoints directly, use [http://localhost:3000](http://localhost:3000).


## @TODO

- [frontend] Preview descriptor type when identified while adding wallet.
- [frontend] Wallet Terminal feature.
- [frontend] Rework styles.
- [frontend] Show utxo label in drawer if it has.
- [frontend] Redirect user to wallet view after succesfully add a wallet (at least 1 utxo).
- [frontend] Add and improve more stats.
- [frontend] Variable network, now is fixed testnet.
- [frontend] Select descriptor type from select and input only what is needed inside descriptor type when adding wallets.
- [frontend], [backend] Blockhain data section, inspiration: <https://bolt.schulzemic.net:8091/>.
- [frontend], [backend] document code.
- [frontend], [backend] Tor.
- [frontend], [backend] Fix adding local node.
- [frontend], [backend] test and develop different descriptors.
- [frontend], [backend] fix local node connection and add connection feedback to the user.
- [frontend], [backend] detect and notify incoming transactions hide used addresses from address list.

## Attributions

## Typography

- **[BitcoinerLAB](https://github.com/bitcoinerlab)** 
  Suite of TypeScript modules that streamline the creation of Bitcoin applications, developed by José Luis Landabaso and licensed under the [MIT License](https://opensource.org/licenses/MIT).
  - **Discovery**: Retrieve wallet information using descriptors, including UTXO and transaction history.
  - **Coinselect**: Optimize UTXO selection for Bitcoin transactions.
  - **Miniscript**: Manage complex Bitcoin scripts (Miniscripts) within descriptors.
  - **Secp256k1**: Cryptographic module based on the secp256k1 curve for secure Bitcoin operations.
  - **Explorer**: Integrated with Electrum servers for seamless data access.
  
- **[Hack](https://github.com/source-foundry/Hack)** 
  Typeface, developed by Source Foundry and licensed under the [MIT License](https://opensource.org/licenses/MIT).
