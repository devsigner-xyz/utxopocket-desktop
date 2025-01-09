    <template>
      <v-app>
        <v-layout>
          <v-navigation-drawer v-model:rail="rail" permanent location="left" style="position: fixed; height: 100vh">
            <v-list v-if="!rail">
              <v-list-item ripple lines="one">
                <div class="d-flex flex-column">
                  <span class="text-body-2 font-weight-bold">
                    UtxoPocket
                  </span>
                  <span class="text-caption text-truncate" :title="`${selectedWalletName}`">
                    {{ selectedWalletName }}
                  </span>
                </div>
                <template v-slot:prepend>
                  <v-avatar title="Toggle drawer" @click="toggleDrawer" class="cursor-pointer" image="/images/icon.svg"
                    :size="32" />
                </template>
                <template v-if="walletItems.length != 0" v-slot:append>
                  <v-menu offset-y v-if="!rail">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="keyboard_arrow_down" title="Select wallet" size="small" variant="text"
                        v-bind="props" />
                    </template>
                    <v-list>
                      <v-list-item v-for="wallet in walletItems" :title="wallet.name" :key="wallet.id"
                        @click="selectWallet(wallet.id)" link />
                    </v-list>
                  </v-menu>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="d-flex align-center justify-center py-4">
              <v-avatar title="Toggle drawer" @click="toggleDrawer" class="cursor-pointer" image="/images/icon.svg"
                :size="24" />
            </div>
            <v-divider />
            <v-list nav>
              <v-list-item title="Utxos" to="/">
                <template v-slot:prepend>
                  <v-badge v-if="rail" :content="totalUtxosFromSelectedWallet">
                    <v-icon icon="grid_view" />
                  </v-badge>
                  <v-icon v-else icon="grid_view" />
                </template>
                <template v-slot:append>
                  <v-badge :content="totalUtxosFromSelectedWallet" inline />
                </template>
              </v-list-item>
              <v-tooltip :disabled="!tooltipsEnabled" text="View transactions" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Transactions" to="/transactions" v-bind="props">
                    <template v-slot:prepend>
                      <v-badge v-if="rail" :content="transactionCount">
                        <v-icon icon="route" />
                      </v-badge>
                      <v-icon v-else icon="route" />
                    </template>
                    <template v-slot:append>
                      <v-badge :content="transactionCount" inline />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
              <v-tooltip :disabled="!tooltipsEnabled" text="External and internal derived addresses" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Addresses" to="/addresses" v-bind="props">
                    <template v-slot:prepend>
                      <v-badge v-if="rail" :content="totalAddresses">
                        <v-icon icon="analytics" />
                      </v-badge>
                      <v-icon v-else icon="analytics" />
                    </template>
                    <template v-slot:append>
                      <v-badge :content="totalAddresses" inline />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
              <v-tooltip :disabled="!tooltipsEnabled" :text="`Manage ${totalCollections} collections`" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Collections" to="/collections" v-bind="props">
                    <template v-slot:prepend>
                      <v-badge v-if="rail" :content="totalCollections">
                        <v-icon icon="category" />
                      </v-badge>
                      <v-icon v-else icon="category" />
                    </template>
                    <template v-slot:append>
                      <v-badge :content="totalCollections" inline />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
              <v-tooltip :disabled="!tooltipsEnabled" text="Wallet stats" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Stats" to="/stats" v-bind="props">
                    <template v-slot:prepend>
                      <v-icon icon="analytics" />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
              <!-- <v-tooltip :disabled="!tooltipsEnabled" text="Application logs" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Terminal" to="/terminal" v-bind="props">
                    <template v-slot:prepend>
                      <v-icon icon="terminal" />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip> -->
              <!-- <v-tooltip :disabled="!tooltipsEnabled" text="Go to Wallet Console" location="right">
                  <template v-slot:activator="{ props }">
                    <v-list-item link title="Wallet Console" to="/console" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon icon="terminal" />
                      </template>
                    </v-list-item>
                  </template>
                </v-tooltip> -->
              <v-tooltip :disabled="!tooltipsEnabled" text="Go to Settings" location="right">
                <template v-slot:activator="{ props }">
                  <v-list-item link title="Settings" to="/settings" v-bind="props">
                    <template v-slot:prepend>
                      <v-icon icon="settings" />
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
            </v-list>
            <v-spacer />
            <v-list nav>
              <v-list-item link :title="settingsStore.hideBalances ? 'Hidding balances (h)' : 'Showing balances (h)'"
                @click="toggleHideBalances">
                <template v-slot:prepend>
                  <v-icon v-if="settingsStore.hideBalances" icon="visibility_off" />
                  <v-icon v-else icon="visibility_on" /> </template>
              </v-list-item>
            </v-list>
            <v-divider v-if="!rail" class="mb-6" />
            <div v-if="!rail" class="mt-auto px-2">
              <div class="d-flex align-center justify-center ga-2 w-100 text-caption">
                <v-tooltip :disabled="!tooltipsEnabled" text="Donate to defense fund" location="right">
                  <template v-slot:activator="{ props }">
                    <v-chip color="red" size="small" v-bind="props" href="https://www.btcpolicy.org/donate"
                      target="_blank">
                      <v-avatar start image="/images/samourai_logo.svg" />
                      <span class="text-white">#FreeSamourai</span>
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </v-navigation-drawer>
          <!-- @TODO Review width and vuetify docs -->
          <v-main style="width: calc(100vw - 256px)">
            <router-view />
          </v-main>
        </v-layout>
        <Snackbar v-if="snackbar.message" :location="isConnecting ? 'bottom right' : ''" :message="snackbar.message"
          :type="snackbar.type" @close="snackbar.message = ''" />
        <ElectrumSnackbar />
      </v-app>
    </template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { copyToClipboard } from '@utils/utils';
import { SnackbarType } from './types/types.d';
import ElectrumSnackbar from '@components/ElectrumSnackbar.vue';
import Snackbar from '@components/SnackBar.vue';
import { useWalletStore } from '@stores/walletStore';
import { useSettingsStore } from '@stores/settingsStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useUIStore } from '@stores/uiStore';
import { useUtxoStore } from '@stores/utxoStore';
import { useLogsStore } from '@stores/logsStore';

const walletStore = useWalletStore();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();
const utxosStore = useUtxoStore();
const logsStore = useLogsStore();
const uiStore = useUIStore();
const { smAndDown } = useDisplay();
const rail = ref(smAndDown.value);
const totalCollections = computed(() => walletStore.selectedWallet ? walletStore.selectedWallet.collections.length : 0);
const totalAddresses = computed(() => {
  if (walletStore.selectedWallet) {
    return walletStore.externalAddressesWithBalance.length + walletStore.internalAddressesWithBalance.length;
  }
  return 0;
});
const tooltipsEnabled = computed(() => settingsStore.tooltipsEnabled);
const transactionCount = computed(() => {
  return walletStore.selectedWallet && walletStore.selectedWallet.transactions
    ? walletStore.selectedWallet.transactions.length
    : 0;
});
const snackbar = computed(() => uiStore.snackbar);
const isConnecting = computed(() => connectionStore.isConnecting);
const wallets = computed(() => walletStore.wallets);

const walletItems = computed(() => {
  const items = wallets.value.map(wallet => ({
    id: wallet.id,
    name: wallet.name
  }));
  return items;
});

const selectWallet = (walletId: string) => {
  selectedWalletId.value = walletId;
};

const selectedWalletId = computed({
  get: () => walletStore.selectedWalletId,
  set: (value: string) => {
    utxosStore.deselectAllUtxos();
    walletStore.selectedWalletId = value;
  }
});
const toggleHideBalances = () => {
  settingsStore.hideBalances = !settingsStore.hideBalances;
};

const selectedWalletName = computed(() => {
  const selectedWallet = walletStore.wallets.find(wallet => wallet.id === walletStore.selectedWalletId);
  return selectedWallet ? selectedWallet.name : null;
});

const totalUtxosFromSelectedWallet = computed(() => {
  const size = walletStore.selectedWallet?.utxos.size
  return size ? size : 0;
});

onMounted(() => {
  logsStore.startLogsStream();
  window.addEventListener('keydown', handleKeyDown);
  rail.value = smAndDown.value;
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'h') {
    toggleHideBalances();
  }
};

const copyNprofile = () => {
  copyToClipboard('nprofile1qqsxkcm0twz6ftsjtjj0q5rzspm4ztx95l60eeuqpp94yzt5887h6jgprpmhxue69uhh2mtzwfjkctnvda3kzmp6xsurgwp0qythwumn8ghj7un9d3shjtnxda6kuarpd9hzuend0y3pcf')
  uiStore.setSnackbar('strhodler nprofile copied', SnackbarType.Success)
}

const toggleDrawer = () => {
  rail.value = !rail.value;
  settingsStore.rail = rail.value;
};

</script>

<style lang="scss">
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
}

#app {
  display: flex;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-bottom-navigation__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
