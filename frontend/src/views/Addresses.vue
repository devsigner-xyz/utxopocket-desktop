<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>Addresses</v-app-bar-title>
            </template>
        </Header>
        <v-row dense>
            <v-col cols="12" md="6">
                <v-card>
                    <template v-slot:text>
                        <v-card-title class="d-flex ga-8 py-0 px-0">
                            <div>
                                <p class="text-body-1 font-weight-bold">Receive addresses</p>
                                <p class="text-caption">
                                    {{ externalAddressesWithoutBalance.length }} receive addresses found
                                </p>
                            </div>
                            <v-spacer />
                            <v-text-field v-if="externalAddressesWithoutBalance.length" v-model="searchExternal"
                                label="Search" prepend-inner-icon="search" variant="filled" hide-details single-line
                                density="compact" />
                        </v-card-title>
                    </template>
                    <v-progress-linear v-if="isScanning" color="primary" indeterminate />
                    <v-data-table hover density="comfortable" :items="externalAddressesWithoutBalance"
                        :search="searchExternal" :items-per-page="10">
                        <template v-slot:header="{ headers }">
                            <thead>
                                <tr>
                                    <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                                </tr>
                            </thead>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr @click="openAddressDialog(item)" style="cursor: pointer;">
                                <td>{{ item.address }}</td>
                                <td>{{ item.balance }} sats</td>
                            </tr>
                        </template>
                        <template v-slot:no-data>
                            No addresses found
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-card>
                    <template v-slot:text>
                        <v-card-title class="d-flex ga-8 py-0 px-0">
                            <div>
                                <p class="text-body-1 font-weight-bold">Change addresses.</p>
                                <p class="text-caption">{{ internalAddressesWithoutBalance.length }} change addresses
                                    found
                                </p>
                            </div>
                            <v-spacer />
                            <v-text-field v-if="internalAddressesWithoutBalance.length" v-model="searchInternal"
                                label="Search" prepend-inner-icon="search" density="compact" variant="filled"
                                hide-details single-line clearable />
                        </v-card-title>
                    </template>
                    <v-progress-linear v-if="isScanning" color="primary" indeterminate :search="searchInternal" />
                    <v-data-table density="comfortable" :items="internalAddressesWithoutBalance" :items-per-page="10">
                        <template v-slot:header="{ headers }">
                            <thead>
                                <tr>
                                    <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                                </tr>
                            </thead>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.address }}</td>
                                <td>{{ item.balance }} sats</td>
                            </tr>
                        </template>
                        <template v-slot:no-data>
                            No addresses found
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="dialog" :max-width="400" @after-leave="resetQRCode">
            <v-card>
                <v-card-title class="text-center">
                    <p class="text-body-1 mt-4">Receiving addresses</p>
                </v-card-title>
                <v-card-text>
                    <v-row dense justify="center">
                        <v-col cols="auto">
                            <img :src="qrCodeUrl" class="rounded-lg cursor-pointer"
                                :alt="`QR code of address: ${selectedAddress.address}`"
                                @click="copyAddress(selectedAddress.address)" />
                        </v-col>
                    </v-row>
                    <v-row dense justify="center">
                        <v-col cols="12">
                            <p class="text-primary cursor-pointer text-body-1 text-center"
                                @click="copyAddress(selectedAddress.address)">{{
                                    selectedAddress.address }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-btn block color="primary" variant="tonal" @click="closeDialog">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import QRCode from 'qrcode';
import Header from '@components/Header.vue';
import { copyToClipboard } from '@utils/utils';
import { useWalletStore } from '@stores/walletStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useUIStore } from '@stores/uiStore';
import { useTheme } from 'vuetify/lib/framework.mjs';

const walletStore = useWalletStore();
const uiStore = useUIStore();
const connectionStore = useConnectionStore();
const dialog = ref(false);
const theme = useTheme();
const selectedAddress = ref({ address: '', balance: 0 });
const qrCodeUrl = ref('');
const searchExternal = ref('');
const searchInternal = ref('');
const isScanning = computed(() => connectionStore.isScanning);
const externalAddressesWithBalance = computed(() => walletStore.externalAddressesWithBalance);
const internalAddressesWithBalance = computed(() => walletStore.internalAddressesWithBalance);

const externalAddressesWithoutBalance = computed(() =>
    externalAddressesWithBalance.value.filter(item => item.balance === 0)
);

const internalAddressesWithoutBalance = computed(() =>
    internalAddressesWithBalance.value.filter(item => item.balance === 0)
);

const openAddressDialog = async (address) => {
    selectedAddress.value = address;
    dialog.value = true;
    try {
        qrCodeUrl.value = await QRCode.toDataURL(address.address, {
            width: 200,
            margin: 2,
            color: {
                dark: theme.current.value.colors.primary,
                light: '#fcbb141a'
            }
        });
    } catch (error) {
        console.error('Error generating QR code', error);
    }
};

const closeDialog = () => {
    dialog.value = false;
    selectedAddress.value = { address: '', balance: 0 };
};

const resetQRCode = () => {
    selectedAddress.value = { address: '', balance: 0 };
    qrCodeUrl.value = '';
};

const copyAddress = (address) => {
    copyToClipboard(address)
        .then(() => uiStore.setSnackbar('Address copied successfully!', 'success'))
        .catch(err => {
            console.error('Failed to copy text: ', err);
            uiStore.setSnackbar('Failed to copy address', 'error');
        });
};
</script>

<style scoped>
.qrcode {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
