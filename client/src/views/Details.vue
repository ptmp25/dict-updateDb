<template>
    <div class="container">
        <h1>Word Details</h1>
        <div class="words" v-if="word">
            <table class="table-container">
                <tr>
                    <td class="label">English</td>
                    <td class="input">
                        <input type="text" v-model="word.en" id="english" value="{{ word.en }}" readonly />
                    </td>
                </tr>
            </table>

            <table class="table-container">
                <tr>
                    <td class="label">German</td>
                    <td class="input">
                        <input type="text" v-model="word.de" id="german" value="{{ word.de }}" readonly />
                    </td>
                </tr>
            </table>

            <table class="table-container">
                <tr>
                    <td class="label">French</td>
                    <td class="input">
                        <input type="text" v-model="word.fr" id="french" value="{{ word.fr }}" readonly />
                    </td>
                </tr>
            </table>

            <table class="table-container">
                <tr>
                    <td class="label">Vietnamese</td>
                    <td class="input">
                        <input type="text" v-model="word.vi" id="vietnamese" value="{{ word.vi }}" readonly />
                    </td>
                </tr>
            </table>

            <div v-for="( text, code) in word.others">
                <table class="table-container">
                    <tr>
                        <td class="label">{{ languagesDict[code] }}</td>
                        <td class="input">
                            <input type="text" v-model="word.others[code]" :id="code" placeholder="Enter word..."
                                autocomplete="off" required />
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
import BackendAPI from '../services/backendApi';
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