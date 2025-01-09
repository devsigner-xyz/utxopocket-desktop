<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>Collection Manager</v-app-bar-title>
            </template>
        </Header>
        <v-row dense>
            <v-col cols="12">
                <v-card flat>
                    <v-card-title class="d-flex flex-column gap-4">
                        <div class="d-flex align-center mb-4">
                            <v-avatar :image="dynamicAvatar" size="56" />
                            <v-text-field class="ml-4" v-model="newCollection.name" label="Collection Name"
                                :rules="rules" required variant="filled" hide-details @input="validateInput">
                                <template v-slot:append-inner>
                                    <v-btn @click="saveCollection" :disabled="!isValid" color="primary" variant="tonal">
                                        {{ isEditing ? 'Update collection' : 'Create Collection' }}
                                    </v-btn>
                                </template>
                            </v-text-field>
                        </div>
                    </v-card-title>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card class="w-100">
                    <v-card-title>
                        <p class="text-body-1 font-weight-bold mb-2">{{ collections.length }} Collections</p>
                    </v-card-title>
                    <v-data-table v-model:sort-by="sortBy" :items="collections" :items-per-page="10" hover
                        class="w-100">
                        <template v-slot:headers>
                            <tr>
                                <th v-for="header in headers">
                                    {{ header.text }}
                                </th>
                            </tr>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr @click="editCollection(item)" style="cursor: pointer;">
                                <td>
                                    <v-avatar :image="generateAvatar(item.name)" :size="32" />
                                </td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.utxoCount }}</td>
                                <td>{{ settingsStore.formatSats(item.totalValue) }}</td>
                                <td>
                                    <v-btn icon="edit" title="Edit collection" variant="plain"
                                        @click.stop="editCollection(item)" />
                                    <v-btn icon="delete" title="Delete collection" variant="plain"
                                        @click.stop="deleteCollection(item.id)" />
                                </td>
                            </tr>
                        </template>
                        <template v-slot:no-data>
                            You have not created any collection.
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Header from '@components/Header.vue';
import { Collection, SnackbarType } from '../types/types.d';
import { generateAvatar } from '@utils/utils';
import { useSettingsStore } from '@stores/settingsStore';
import { useCollectionStore } from '@stores/collectionStore';
import { useUIStore } from '@stores/uiStore';

const settingsStore = useSettingsStore();
const collectionStore = useCollectionStore();
const uiStore = useUIStore();

const headers = ref([
    { text: 'Avatar' },
    { text: 'Name' },
    { text: 'Utxos' },
    { text: 'Total Value' },
    { text: 'Actions' },
]);

const sortBy = ref([{ key: 'name', order: 'asc' as const }]);

const isEditing = ref<boolean>(false);
const newCollection = ref<Collection>({
    id: Date.now(),
    name: '',
    utxoKeys: [],
    avatar: '',
});
const isValid = ref<boolean>(false);
const rules = [(v: string) => !!v || 'This field is required'];
const dynamicAvatar = computed(() => generateAvatar(newCollection.value.name));
const validateInput = () => {
    isValid.value = newCollection.value.name.trim().length > 0;
};

const saveCollection = () => {
    if (!isValid.value) return;

    const avatarUri = dynamicAvatar.value;

    if (isEditing.value) {
        collectionStore.updateCollection({ ...newCollection.value, avatar: avatarUri });
        uiStore.setSnackbar('Collection updated successfully', SnackbarType.Success);
    } else {
        collectionStore.addCollection({ ...newCollection.value, id: Date.now(), avatar: avatarUri, utxoKeys: [] });
        uiStore.setSnackbar('Collection created successfully', SnackbarType.Success);
    }

    resetForm();
    collectionStore.updateCollections();
};

const editCollection = (collection: Collection) => {
    newCollection.value = { ...collection };
    isEditing.value = true;
    validateInput();
};

const deleteCollection = (id: number) => {
    collectionStore.removeCollection(id);
    uiStore.setSnackbar('Collection deleted successfully', SnackbarType.Success);
};

const resetForm = () => {
    newCollection.value = {
        id: Date.now(),
        name: '',
        utxoKeys: [],
        avatar: '',
    };
    isEditing.value = false;
    isValid.value = false;
};

const collections = computed(() => {
    return collectionStore.collectionDetails
        .filter(detail => detail.id !== -1)
        .map((detail: Collection & { utxoCount: number; totalUtxoValue: number }) => ({
            avatar: detail.avatar || generateAvatar(detail.name),
            name: detail.name,
            utxoCount: detail.utxoCount,
            totalValue: detail.totalUtxoValue,
            id: detail.id,
            utxoKeys: detail.utxoKeys,
        }));
});
</script>
