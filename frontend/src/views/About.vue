<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>About UtxoPocket</v-app-bar-title>
            </template>
        </Header>
        <v-row justify="center">
            <v-col cols="12" md="4">
                <v-card class="py-4 px-4" href="https://github.com/devsigner-xyz/utxopocket-desktop.git"
                    density="comfortable" rel="noopener" target="_blank">
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
                    <v-list-item title="Accepting sats." subtitle="strhodler@getalby.com" lines="one">
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
                <h6 class="text-h6">What is UTXO Pocket?</h6>
            </v-col>

            <v-col cols="12">
                <p class="text-body-1">
                    UTXO Pocket is an advanced watch-only Bitcoin wallet built with Vue 3 and TypeScript.
                    It leverages a NestJS backend integrated with Bitcoiner Lab, Redis, and bitcoinjs-lib for
                    robust descriptor parsing and real-time Electrum data retrieval. Below are its core
                    features and objectives:
                </p>
            </v-col>

            <v-col cols="12">
                <ul>
                    <li class="mb-3">
                        <strong>Watch-Only Wallet:</strong><br />
                        Connect multiple Bitcoin descriptors (pkh, wpkh, sh(wpkh), etc.) to monitor balances and
                        transactions without spending capabilities.
                    </li>

                    <li class="mb-3">
                        <strong>Custom UTXO Collections:</strong><br />
                        Organize your unspent outputs into personalized collections for streamlined tracking and
                        planning.
                    </li>

                    <li class="mb-3">
                        <strong>Detailed UTXO and Transaction Views:</strong><br />
                        Examine addresses, script types, timestamps, and other transaction details through a clear,
                        data-rich interface.
                    </li>

                    <li class="mb-3">
                        <strong>Electrum Server Connectivity:</strong><br />
                        Securely fetch live Bitcoin data (balances, UTXOs, transaction history) by connecting to
                        your local node or a remote, trusted Electrum server.
                    </li>

                    <li class="mb-3">
                        <strong>Descriptor Support:</strong><br />
                        Handle both simple (pk, pkh) and advanced (wpkh, sh(wpkh)) descriptors, giving flexibility
                        in how addresses and scripts are defined and managed.
                    </li>

                    <li class="mb-3">
                        <strong>Data Visualization and Analytics:</strong><br />
                        Charts and graphical insights help you better understand wallet history, balances, and
                        UTXO distributions.
                    </li>

                    <li class="mb-3">
                        <strong>Dockerized Setup:</strong><br />
                        Both frontend (Vue + Pinia + Vuetify) and backend (NestJS + Redis + Bitcoiner Lab) are
                        containerized for easy, consistent deployment.
                    </li>

                    <li class="mb-3">
                        <strong>BIP-329 Label Management:</strong><br />
                        Label your UTXOs according to the BIP-329 standard, enhancing your ability to categorize
                        and track them effectively.
                    </li>

                    <li class="mb-3">
                        <strong>Address and XPUB Scanning:</strong><br />
                        Quickly scan sets of addresses derived from XPUB/YPUB/TPUB keys and instantly view
                        associated UTXOs and transactions.
                    </li>

                    <li class="mb-3">
                        <strong>Inspection Mode:</strong><br />
                        Dive into each UTXO’s full transaction details, script structure, and any related metadata.
                    </li>
                </ul>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <h6 class="text-h6">Contributors</h6>
            </v-col>
            <v-col>

                <v-list>
                    <v-list-item link title="@devsigner-xyz">
                        <template v-slot:prepend>
                            <GitHubIcon size="32px" class="mr-4" style="fill: white" />
                        </template>
                        <template v-slot:subtitle>
                            <a href="https://github.com/devsigner-xyz"
                                target="_blank">https://github.com/devsigner-xyz</a>
                        </template>
                        <template v-slot:append>
                            Creator
                        </template>
                    </v-list-item>
                    <v-list-item link title="@sergiogragera">
                        <template v-slot:prepend>
                            <GitHubIcon size="32px" class="mr-4" style="fill: white" />
                        </template>
                        <template v-slot:subtitle>
                            <a href="https://github.com/sergiogragera"
                                target="_blank">https://github.com/sergiogragera</a>
                        </template>
                        <template v-slot:append>
                            Contributor
                        </template>
                    </v-list-item>
                </v-list>
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
