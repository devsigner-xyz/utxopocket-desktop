<template>
    <v-container>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>UtxoPocket and Bitcoin Wiki</v-app-bar-title>
            </template>
        </Header>
        <v-row>
            <v-col cols="12" md="6">
                <p>Wiki</p>
                <p>TODO: How do I use UtxoPocket</p>
                <p>TODO: About bitcoin and best practices.</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-table dense>
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Description</th>
                            <th>When Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Arrow Left</td>
                            <td>Select previous UTXO</td>
                            <td>When UTXOs are available and multi-select is disabled</td>
                        </tr>
                        <tr>
                            <td>Arrow Right</td>
                            <td>Select next UTXO</td>
                            <td>When UTXOs are available and multi-select is disabled</td>
                        </tr>
                        <tr>
                            <td>Arrow Up</td>
                            <td>Increase selected UTXOs</td>
                            <td>When inspect mode is disabled and UTXOs are available</td>
                        </tr>
                        <tr>
                            <td>Arrow Down</td>
                            <td>Decrease selected UTXOs</td>
                            <td>When inspect mode is disabled and UTXOs are available</td>
                        </tr>
                        <tr>
                            <td>Esc</td>
                            <td>Unselect all UTXOs</td>
                            <td>When any UTXO is selected</td>
                        </tr>
                        <tr>
                            <td>Enter</td>
                            <td>View selected UTXOs</td>
                            <td>When at least one UTXO is selected</td>
                        </tr>
                        <tr>
                            <td>i</td>
                            <td>Enable/disable inspect mode</td>
                            <td>Always available</td>
                        </tr>
                        <tr>
                            <td>m</td>
                            <td>Enable/disable multi-select mode</td>
                            <td>Always available</td>
                        </tr>
                        <tr>
                            <td>l</td>
                            <td>Lock/Unlock selected UTXOs</td>
                            <td>When at least one UTXO is selected</td>
                        </tr>
                        <tr>
                            <td>h</td>
                            <td>Show/hide balances</td>
                            <td>Alway available</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
    </v-container>

    <v-navigation-drawer location="right" permanent>
        <v-list desnsity="comfortable">
            <v-list-item title="Wiki" subtitle="Learn about UtxoPocket"></v-list-item>
            <v-divider></v-divider>
            <v-list-item link title="Wallet"></v-list-item>
            <v-list-item link title="Transactions"></v-list-item>
            <v-list-item link title="Collections"></v-list-item>
            <v-list-item link title="Label (BIP-329)"></v-list-item>
            <v-list-item link title="Stats"></v-list-item>
            <v-list-item link title="Settings"></v-list-item>
        </v-list>
    </v-navigation-drawer>

</template>

<script lang="ts" setup>
import Header from '@components/Header.vue';
</script>
