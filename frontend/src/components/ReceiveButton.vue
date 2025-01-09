<template>
    <v-btn color="primary" transition="fade" class="block-chip text-caption mr-2" @click="openDialog()" variant="tonal">
        <template v-slot:prepend>
            <v-icon icon="qr_code" :size="20" />
        </template>
        Receive
    </v-btn>

    <v-dialog v-model="dialog" :max-width="400" @after-leave="resetQRCode">
        <v-card>
            <v-card-title class="text-center">
                <p class="text-body-1 mt-4">Receiving addresses</p>
            </v-card-title>
            <v-card-text>
                <v-row align="center" justify="center">
                    <v-col>
                        <v-btn title="Previous address" variant="tonal" color="primary" icon="arrow_left"
                            @click="prevAddress" :disabled="currentIndex === 0" />
                    </v-col>
                    <v-col cols="auto">
                        <img :src="qrCodeUrl" class="rounded-lg cursor-pointer" :alt="`QR code of address: ${address}`"
                            @click="copyAddress(address)" />
                    </v-col>
                    <v-col>
                        <v-btn title="Next address" variant="tonal" color="primary" icon="arrow_right"
                            @click="nextAddress" :disabled="currentIndex === addresses.length - 1" />
                    </v-col>
                </v-row>
                <v-row dense justify="center">
                    <v-col cols="12">
                        <p class="text-primary cursor-pointer text-body-1 text-center" @click="copyAddress(address)">{{
                            address }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn block color="primary" variant="tonal" @click="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import QRCode from 'qrcode';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { useWalletStore } from '@stores/walletStore';
import { useUIStore } from '@stores/uiStore';
import { copyToClipboard } from '@utils/utils';

const walletStore = useWalletStore();
const dialog = ref(false);
const address = ref('');
const addresses = ref([]);
const currentIndex = ref(0);
const qrCodeUrl = ref('');
const theme = useTheme();

const openDialog = async () => {
    if (!walletStore.selectedWallet) {
        console.warn('No wallet selected');
        return;
    }
    addresses.value = walletStore.selectedWallet.externalAddresses || [];

    if (addresses.value.length > 0) {
        currentIndex.value = 0;
        await updateQRCodeAndAddress();
        dialog.value = true;
    } else {
        console.warn('No addresses found in the store for this wallet');
    }
};

const updateQRCodeAndAddress = async () => {
    try {
        if (addresses.value.length === 0) return;
        address.value = addresses.value[currentIndex.value];
        qrCodeUrl.value = await QRCode.toDataURL(address.value, {
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

const resetQRCode = () => {
    address.value = '';
    qrCodeUrl.value = '';
};

const copyAddress = async (addr) => {
    try {
        await copyToClipboard(addr);
        useUIStore.setSnackbar('Address copied successfully!', 'success');
    } catch (err) {
        console.error('Failed to copy text:', err);
        useUIStore.setSnackbar('Failed to copy address', 'error');
    }
};

const nextAddress = async () => {
    if (currentIndex.value < addresses.value.length - 1) {
        currentIndex.value++;
        await updateQRCodeAndAddress();
    }
};

const prevAddress = async () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        await updateQRCodeAndAddress();
    }
};
</script>

<style scoped>
.qrcode {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
