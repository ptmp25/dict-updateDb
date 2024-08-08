<template>
    <div class="container">
        <h1>Edit Word</h1>
        <div class="" v-if="word">
            <p for="newLang">Add Language:</p>
            <select v-model="newLang" id="newLang">
                <option value="" disabled selected>Choose new language you want to add</option>
                <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
            </select>
            <div class="flex justify-end">
                <button @click="addLanguage" class="btn btn-success btn-sm">Add</button>
            </div>
            <div class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Language</th>
                            <th>Meaning(s)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-for="(meanings, code) in word.translations" :key="code">
                        <tr v-if="meanings.length !== 0">
                            <th>{{ languagesDict[code] }}</th>
                            <td>
                                <div v-for="(meaning, index) in meanings" :key="index" class="mt-2 border-bottom">
                                    <input type="text" v-model="word.translations[code][index]"
                                        :id="`input-${code}-${index}`" placeholder="Enter word..." autocomplete="off"
                                        class="input w-full max-w-xs"
                                        @keyup.enter="translateText(code, word.translations[code][index])" required />
                                </div>
                            </td>
                            <td>
                                <div v-for="(meaning, index) in meanings" :key="`delete-${code}-${index}`">
                                    <button class="btn btn-error btn-outline btn-xs mt-2"
                                        @click="deleteMeaning(code, index)">Remove</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end">
                <button class="btn btn-success " @click="create">Submit</button>
            </div>
        </div>
        <div v-else>
            <p>Can't find word</p>
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
            console.log(word.value);
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