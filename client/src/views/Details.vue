<template>
    <div class="container">
        <h1>Word Details</h1>
        <div class="words" v-if="word">
            <div v-for="( text, code) in word.translations">
                <table class="table-container">
                    <tr>
                        <td class="label">{{ languagesDict[code] }}</td>
                        <td class="input">
                            <div v-for="(meaning, index) in text" :key="index">
                                <p>{{ meaning }}</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <router-link to="/edit" class="btn right" @click="editWord">Edit</router-link>
        </div>
        <div v-else>
            <p>Word not found</p>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import backendApi from '../services/backendApi'; // Ensure this path is correct
import { router } from '../router'; // Import the router object from the Vue Router package
import useDetails from '../hooks/useDetails';
import languages from '../hooks/languages';

export default {
    data() {
        return {
            languagesDict: { ...languages },
        };
    },
    setup() {
        const word = ref(null);
        const route = useRoute();
        const id = route.params.id;

        const { word: fetchedWord, error, getDetails } = useDetails();

        const editWord = () => {
            if (word.value) {
                router.push({ name: 'edit', params: { id: word.value.id } });
            }
        };

        onMounted(async () => {
            await getDetails(id);
            word.value = fetchedWord.value;
        });

        return { word, editWord, error };
    },
};
</script>