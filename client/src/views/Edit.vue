<template>
    <div class="container">
        <h1>Edit Word</h1>
        <div v-if="word">
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
            <button class="btn right" type="submit" @click="saveEdit">Save Changes</button>
            <div>
                <label for="newLang">Add Language:</label>
                <select v-model="newLang" id="newLang">
                    <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
                </select>
                <button @click="addLanguage">Add</button>
            </div>
        </div>
        <div v-else>
            <p>Word not found</p>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { router } from '../router'; // Import
import useDetails from '../hooks/useDetails';
import { useToast } from 'vue-toastification'
import languages from '../hooks/languages';
import backendApi from '../services/backendApi'; // Ensure this path is correct


export default {
    data() {
        return {
            languagesDict: { ...languages },
            newLang: "",
            word: {
                en: '',
                de: '',
                fr: '',
                vi: '',
                others: {},
            },
        };
    },
    setup() {
        const route = useRoute();

        const word = ref(null);
        const id = route.params.id;
        const { word: fetchedWord, error, getDetails } = useDetails();
        const toast = useToast();

        onMounted(async () => {
            await getDetails(id);
            word.value = fetchedWord.value;
        });

        return { id, word, toast };
    },
    methods: {
        addLanguage() {
            // console.log(this.word);
            if (this.newLang && !this.word.others[this.newLang]) {
                this.word.others[this.newLang] = '';
                this.newLang = '';
            } else if (this.word.others[this.newLang]) {
                this.toast.error('Language already exists');
            } else {
                this.toast.error('Please select a language');
            }
        },
        async saveEdit() {
            try {
                const response = await backendApi.updateDetails(this.id, this.word);
                const data = response.data;
                console.log(response);
                if (response.statusText !== "OK" || response.status !== 200) {
                    if (data.code && data.code === 11000) {
                        this.toast.error("Duplicated ID");
                        console.error(data.message)
                    } else {
                        this.toast.error("An error occurred while updating the word");
                        console.error(data.message)
                    }
                } else {
                    this.toast.success("Word updated successfully");
                }
            } catch (error) {
                this.toast.error("An error occurred while updating the word");
                console.error(error);
            }
        },

        async translateText(sourceLang, sourceText) {
            try {
                if (sourceText !== "") {
                    console.log(sourceText, sourceLang);
                    if (this.word.en === "") {
                        const response = await backendApi.translateText(
                            sourceText,
                            sourceLang,
                            "en",
                        );
                        this.word.en = response.translatedText;
                    }
                    if (this.word.de === "") {
                        const response = await backendApi.translateText(
                            sourceText,
                            sourceLang,
                            "de",
                        );
                        this.word.de = response.translatedText;
                    }
                    if (this.word.fr === "") {
                        const response = await backendApi.translateText(
                            sourceText,
                            sourceLang,
                            "fr",
                        );
                        this.word.fr = response.translatedText;
                    }
                    if (this.word.vi === "") {
                        const response = await backendApi.translateText(
                            sourceText,
                            sourceLang,
                            "vi",
                        );
                        this.word.vi = response.translatedText;
                    }
                    for (const targetLang of Object.keys(this.word.others)) {
                        if (this.word.others[targetLang] === "" && targetLang !== sourceLang) {
                            const response = await backendApi.translateText(
                                sourceText,
                                sourceLang,
                                targetLang,
                            );
                            this.word.others[targetLang] = response.translatedText;
                        }
                    }
                    this.toast.success("Translation successful!");
                } else {
                    for (const targetLang of Object.keys(this.word.others)) {
                        if (this.word.others[targetLang] === "" && targetLang !== sourceLang) {
                            const response = await backendApi.translateText(
                                sourceText,
                                targetLang
                            );
                            this.word.others[targetLang] = response.translatedText;
                        }
                    }
                }
            } catch (error) {
                // this.toast.error("An error occurred while translating the text");
                console.error(error);
            }
        },
    },
};

</script>