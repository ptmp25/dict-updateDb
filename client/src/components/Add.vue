<template>
    <div class="container">
        <h1>Add New Word</h1>
        <div class="">
            <p for="newLang">Add Language:</p>
            <select v-model="newLang" id="newLang" >
                <option value="" disabled selected>Choose new language you want to add</option>
                <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
            </select>
        </div>
        <button @click="addLanguage" class="btn green lighten-1">Add</button>
        <div class="table-container" v-for="(meanings, code) in word.translations" :key="code">
            <table v-if="meanings.length !== 0">
                <tr>
                    <!-- First column: Language name -->
                    <td class="label blue-grey lighten-5">
                        {{ languagesDict[code] }}
                    </td>

                    <!-- All meanings for the language in one cell -->
                    <td class="input">
                        <div v-for="(meaning, index) in meanings" :key="index" class="sameline">
                            <input type="text" v-model="word.translations[code][index]" :id="`input-${code}-${index}`"
                                placeholder="Enter word..." autocomplete="off"
                                @keyup.enter="translateText(code, word.translations[code][index])" required />
                            <button class="btn red lighten-1" style="display:inline"
                                @click="deleteMeaning(code, index)">Delete</button>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <button class="btn right green" @click="create">Submit</button>
    </div>
</template>

<script>
import languages from '../hooks/languages';
import backendApi from '../services/backendApi';
import { useToast } from 'vue-toastification';

export default {
    emits: ['fetchList'], // Declare the custom event here
    data() {
        return {
            word: {
                translations: {
                    en: [''],
                    de: [''],
                    fr: [''],
                    vi: [''],
                }
            },
            languagesDict: { ...languages },
            newLang: '',
        };
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    methods: {
        addLanguage() {
            if (this.newLang === '') {
                console.log('Please select a language to add');
                this.toast.error('Please select a language to add');
                return;
            }
            if (this.word.translations[this.newLang]) {
                this.word.translations[this.newLang].push('');
            } else {
                this.word.translations[this.newLang] = [''];
            }
            console.log('add', this.newLang);
        },
        deleteMeaning(code, index) {
            console.log('delete', this.word.translations[code]);
            this.word.translations[code].splice(index, 1);
            console.log('delete', this.word.translations[code]);
        },

        async translateText(sourceLang, sourceText) {
            try {
                if (sourceText !== "") {
                    for (const targetLang of Object.keys(this.word.translations)) {
                        for (const index in this.word.translations[targetLang]) {
                            if (this.word.translations[targetLang][index] === "" && targetLang !== sourceLang) {
                                const response = await backendApi.translateText(
                                    sourceText,
                                    sourceLang,
                                    targetLang
                                );
                                this.word.translations[targetLang][index] = response.translatedText;
                            }
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
                this.toast.error("An error occurred while translating the text");
                console.error(error);
            }
        },
        async create() {
            try {
                const response = await backendApi.saveWord(this.word);
                const data = response.data;
                if (response.result !== "OK" || response.status !== 200) {
                    if (data.code && data.code === 11000) {
                        this.toast.error("Duplicated ID");
                        console.error(data.message)
                    } else {
                        this.toast.error("An error occurred while creating the word");
                        console.error(data.message)
                    }
                } else {
                    this.word = {
                        translations: {
                            en: [''],
                            de: [''],
                            fr: [''],
                            vi: [''],
                        }
                    };
                    // Emit the event to update the list
                    this.$emit('fetchList');
                    this.toast.success("New word created successfully");

                }
            } catch (error) {
                this.toast.error("An error occurred while creating the word");
                console.error(error);
            }
        },
    },
};
</script>
