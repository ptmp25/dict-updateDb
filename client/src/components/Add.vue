<template>
    <div class="container">
        <h1>Add New</h1>
            <label for="newLang">Add Language:</label>
            <select v-model="newLang" id="newLang">
                <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
            </select>
            <button @click="addLanguage">Add</button>
    </div>
    <div class="table-container" v-for="(meanings, code) in word.translation" :key="code">
        <table v-if="meanings.length !== 0">
            <tr>
                <!-- First column: Language name -->
                <td class="label">
                    {{ languagesDict[code] }}
                </td>

                <!-- All meanings for the language in one cell -->
                <td class="input">
                    <div v-for="(meaning, index) in meanings" :key="index">
                        <input type="text" v-model="word.translation[code][index]" :id="`input-${code}-${index}`"
                            placeholder="Enter word..." autocomplete="off"
                            @keyup.enter="translateText(code, word.translation[code][index])" required />
                            <button class="btn danger" style="display:inline" @click="deleteMeaning(code, index)">Delete</button>
                    </div>
                </td>
            </tr>
        </table>
    </div>
    <div>
    </div>
</template>

<script>
import languages from '../hooks/languages';
import backendApi from '../services/backendApi';
import { useToast } from 'vue-toastification';

export default {
    data() {
        return {
            word: {
                translation: {
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
            if (newLang === '') {
                this.toast.error('Please select a language to add');
                return;
            }
            if (this.word.translation[this.newLang]) {
                this.word.translation[this.newLang].push('');
            } else {
                this.word.translation[this.newLang] = [''];
            }
        },
        deleteMeaning(code, index) {
            console.log('delete', this.word.translation[code]);
            this.word.translation[code].splice(index, 1);
            console.log('delete', this.word.translation[code]);
        },

        async translateText(sourceLang, sourceText) {
            try {
                if (sourceText !== "") {
                    for (const targetLang of Object.keys(this.word.translation)) {
                        for (const index in this.word.translation[targetLang]) {
                            if (this.word.translation[targetLang][index] === "" && targetLang !== sourceLang) {
                                const response = await backendApi.translateText(
                                    sourceText,
                                    sourceLang,
                                    targetLang
                                );
                                this.word.translation[targetLang][index] = response.translatedText;
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
    },
};
</script>