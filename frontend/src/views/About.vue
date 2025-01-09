<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>About UtxoPocket</v-app-bar-title>
            </template>
        </Header>
        <v-row justify="center">
            <v-col cols="12" md="4">
                <v-card class="py-4 px-4" href="https://github.com/devsigner-xyz/UtxoPocket" density="comfortable"
                    rel="noopener" target="_blank">
                    <v-list-item title="UtxoPocket repository" subtitle="Check out in GitHub" lines="one">
                        <template v-slot:prepend>
                            <GitHubIcon size="32px" class="mr-4" style="fill: white" />
                        </template>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" />
                        </template>
                    </v-list-item>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="py-4 px-4" density="comfortable" @click="copyNpub">
                    <v-list-item title="Follow me in nostr"
                        subtitle="npub1dd3k7ku95jhpyh9y7pgx9qrh2ykvtfl5lnncqzzt2gyhgw0a04ysm4paad" lines="one">
                        <template v-slot:prepend>
                            <v-img :width="32" aspect-ratio="1/1" src="/icons/nostr.svg" alt="nostr icon"
                                class="mr-4" />
                        </template>
                        <template v-slot:append>
                            <v-icon icon="content_copy" />
                        </template>
                    </v-list-item>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="py-4 px-4" href="https://getalby.com/p/strhodler" density="comfortable" rel="noopener"
                    target="_blank">
                    <v-list-item title="Accepting sats." subtitle="Support the project with sats" lines="one">
                        <template v-slot:prepend>
                            <BitcoinIcon size="32px" style="fill: #F7931A" class="mr-4" />
                        </template>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" />
                        </template>
                    </v-list-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-container :max-width="800">
        <v-row>
            <v-col cols="12">
                <h6 class="text-h6">What is UtxoPocket?</h6>
            </v-col>
            <v-col cols="12">
                <p class="text-body-1">
                    UtxoPocket is an advanced application designed for detailed management of UTXOs (Unspent Transaction
                    Outputs) on the Bitcoin network. This software, still under development, focuses on providing an
                    intuitive interface and powerful tools for users who want to monitor, label, and organize their
                    UTXOs efficiently. With UtxoPocket, you can:
                </p>
            </v-col>
            <v-col cols="12">
                <ul>
                    <li class="mb-3"><strong>Watch-Only Wallet:</strong><br> Currently, UtxoPocket operates as a
                        watch-only wallet,
                        meaning it cannot spend funds but allows you to monitor your Bitcoin holdings securely.</li>
                    <li class="mb-3"><strong>Manage UTXOs:</strong><br> View, label, and organize your UTXOs to maintain
                        precise control
                        over your transactions.</li>
                    <li class="mb-3"><strong>Electrum Connectivity:</strong><br> Connect to Electrum servers via
                        <strong>Electrs</strong>, a server compatible with Bitcoin Core that enables fast and efficient
                        queries on the Bitcoin blockchain.
                    </li>
                    <li class="mb-3"><strong>Address and XPUB Scanning:</strong><br> Scan sets of addresses derived from
                        an
                        XPUB key and
                        receive real-time information on related UTXOs and transactions.</li>
                    <li class="mb-3"><strong>Supported Address Types:</strong><br> UtxoPocket currently supports
                        <strong>Bech32
                            (P2WPKH - Pay-to-Witness-Public-Key-Hash)</strong> script (address) type, ensuring more
                        efficient and
                        secure transactions on the Bitcoin
                        network.
                    </li>
                    <li class="mb-3"><strong>Inspection Mode:</strong><br> Examine each UTXO in detail, including
                        transaction history and
                        script details.</li>
                    <li class="mb-3"><strong>Wallet Visualization:</strong><br> Analyze your wallet's history using
                        charts
                        and analytical
                        tools for better insights.</li>
                    <li class="mb-3"><strong>BIP-329 Label Management:</strong><br> Manage labels according to the
                        BIP-329
                        standard,
                        allowing you to classify and organize your UTXOs more efficiently for easier identification and
                        tracking.</li>
                    <li class="mb-3"><strong>Custom Collections:</strong><br> Create and manage custom collections of
                        UTXOs
                        based on your
                        preferences, making organization and financial planning easier.</li>
                    <li class="mb-3"><strong>Local Connection:</strong><br> UtxoPocket currently only supports local
                        node
                        connections due
                        to the nature of web applications, making it impossible to connect via Tor for remote access.
                    </li>
                </ul>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <h6 class="text-h6">Backlog</h6>
                <li class="mb-3">
                    <strong>Check balance chart</strong><br>
                    Looks like transaction evoluction is not correct. ✔️
                </li>
                <li class="mb-3">
                    <strong>Create side menu balance chart variant</strong><br>
                    Prop "compact" or similar without grid, tooltip and scales. ❌
                </li>
                <li class="mb-3">
                    <strong>Detect and show incoming transactions</strong><br>
                    Show estimated time.
                </li>
                <li class="mb-3">
                    <strong>Indeterminate linear progress bar</strong><br>
                    Use instead circular one. ✔️
                </li>
                <li class="mb-3">
                    <strong>Replace chartjs by Apache echarts</strong><br>
                    https://echarts.apache.org/ ✔️
                </li>
                <li class="mb-3">
                    <strong>Empty state:</strong><br>
                    Improve UX when app is loaded without data, show connection form in main screen. ✔️
                </li>
                <li class="mb-3">
                    <strong>Demo data:</strong><br>
                    Option to load demo data and show how it works without node connection and xpub. ✔️
                </li>
                <li class="mb-3">
                    <strong>Address reuse:</strong><br>
                    Show warning in reused addresses, utxos and transactions
                </li>
                <li class="mb-3">
                    <strong>Coinselect:</strong><br>
                    Review <a href="https://github.com/bitcoinjs/coinselect" target="_blank">coinselect</a> tool
                </li>
                <li class="mb-3">
                    <strong>Receive:</strong><br>
                    Implment receive flow. Show QR. Research.
                </li>
                <li class="mb-3">
                    <strong>Extend script type support :</strong><br>
                    Extend xpub derivation compatibility: P2PKH ✔️, P2SH, P2WSH, P2TR.
                </li>
                <li class="mb-3">
                    <strong>Review bitcoinjs-lib documentation:</strong><br>
                    Implement best practices, browserify?.
                </li>
                <li class="mb-3">
                    <strong>Documentation:</strong><br>
                    Create code docs sequentally and explain what is happenning in every step. Doc in app and in repo.
                </li>
                <li class="mb-3">
                    <strong>Tests:</strong><br>
                    It should be done in first place, but...
                </li>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <h6 class="text-h6">Ideas</h6>
                <ul>
                    <li class="mb-3">
                        <strong>Utxo history like GitHub contribution chart</strong><br>
                        Represent utxo history in a table where I could see days vs. months table. ✔️
                    </li>
                    <li class="mb-3">
                        <strong>Multiple wallets</strong><br>
                        Add multiple xpub and select the active one or view aggregated.
                    </li>
                    <li class="mb-3">
                        <strong>Audit app</strong><br>
                        Fix potential vulnerabilities
                    </li>
                    <li class="mb-3">
                        <strong>Dockerize application:</strong><br>
                        Make development and deployment easier.
                    </li>
                    <li class="mb-3">
                        <strong>Mempool info page</strong><br>
                        Page where show current state of the mempool and blockchain
                    </li>
                    <li class="mb-3">
                        <strong>Mempool:</strong><br>
                        Mempool visualization in wallet.
                    </li>
                    <li class="mb-3">
                        <strong>Onchain metrics:</strong><br>
                        Show some onchain metrics and locate your utxos on it.
                    </li>
                    <li class="mb-3">
                        <strong>Utxo health score:</strong><br>
                        Utxo scoring algorythm.
                    </li>
                    <li class="mb-3">
                        <strong>Anonimity score</strong><br>
                        Based on best practices. Research.
                    </li>
                    <li class="mb-3">
                        <strong>Batching and Consolidation Suggestions:</strong>
                        Suggestions based on mempool and fees realtime state.
                    </li>
                    <li class="mb-3">
                        <strong>Address Type Converter:</strong>
                        Convert between address types and preview derived addresses in other script types.
                    </li>
                    <li class="mb-3">
                        <strong>Fees stats:</strong><br>
                        Total fees paid, average, median...
                    </li>
                    <li class="mb-3">
                        <strong>Watchtower Integration for Monitoring:</strong>
                        Alert user about unexpected spend behavior, etc.
                    </li>
                    <li class="mb-3">
                        <strong>Historical UTXO Set view:</strong>
                        Historical view about how your utxo set has changed in time. Analyze wallet evolution.
                    </li>
                    <li class="mb-3">
                        <strong>UTXO age distribution chart</strong>
                        Visualize your UTXOs depending on how much time it haven't been moved.
                    </li>
                    <li class="mb-3">
                        <strong>Timelock visualization</strong>
                        View and manage UTXOs with timelock. Show when they can be spent.
                    </li>
                    <li class="mb-3">
                        <strong>Alerts</strong>
                        Send alerts to nostr when timelock is done or if unexpected behavior is detected.
                    </li>
                </ul>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { GitHubIcon, BitcoinIcon } from 'vue3-simple-icons';
import Header from '@components/Header.vue';
import { ref } from 'vue';
import { copyToClipboard } from '@utils/utils';

const npub = "npub1dd3k7ku95jhpyh9y7pgx9qrh2ykvtfl5lnncqzzt2gyhgw0a04ysm4paad";
const snackbar = ref({ show: false, message: '' });

const copyNpub = async () => {
    try {
        await copyToClipboard(npub);
        snackbar.value = { show: true, message: 'npub copied to clipboard!' };
    } catch (err) {
        console.error("Failed to copy npub: ", err);
        snackbar.value = { show: true, message: 'Failed to copy npub.' };
    }
};
</script>
