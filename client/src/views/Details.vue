<template>
    <RouterLink to="/" class="btn">Home</RouterLink>
    <div class="card">
        <div class="card-body">
            <p class="card-title">Word Details</p>
            <div class="words" v-if="word">
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Language</th>
                                <th>Meaning(s)</th>
                            </tr>
                        </thead>
                        <tbody v-for="(meanings, code) in word.translations" :key="code">
                            <tr v-if="meanings.length !== 0">
                                <th>{{ languagesDict[code] }}</th>
                                <td>
                                    <div v-for="(meaning, index) in meanings" :key="index" class="mt-2 border-b">
                                        <p v-if="word.translations[code].length > 1">{{ index + 1 + "-" +
                                            word.translations[code][index] }}</p>
                                        <p v-else>{{ word.translations[code][index] }}</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <router-link to="/edit" class="btn right" @click="editWord">Edit</router-link>
            </div>
            <div v-else>
                <p>Word not found</p>
            </div>
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
            console.log(word.value);
        });

        return { word, editWord, error };
    },
};
</script>