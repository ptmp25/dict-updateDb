<template>
    <div>
        <h1>Translate Text</h1>
        <div>
            <div class="input" v-for="languageCode in Object.keys(word)">
                <label v-if="languageCode !== 'others'" :for="languageCode">{{
                    languagesDict[languageCode] }}:</label>
                <input v-if="languageCode !== 'others'" v-model="word[languageCode]" :id="languageCode" autocomplete="off"
                    @keyup.enter="translateText" />
                <!-- @blur="translateText" /> -->
            </div>
            <div class="input other" v-for="languageCode in Object.keys(otherLanguages)">
                <label :for="languageCode">{{ languagesDict[languageCode] }}:</label>
                <input v-model="otherLanguages[languageCode]" :id="languageCode" autocomplete="off"
                    @keyup.enter="translateText" />
                <!-- @blur="translateText" /> -->
            </div>
            <!-- <button @click="translateText">Translate</button> -->
        </div>
        <button @click="saveWord">Save Word</button>

        <div class="addNewLanguage">
            <label for="newLang">Add Language:</label>
            <select v-model="newLang" id="newLang">
                <option v-for="(name, code) in languagesDict" :key="code" :value="code">{{ name }}</option>
            </select>
            <button @click="addLanguage">Add</button>
        </div>

    </div>
</template>

<script>
import backendApi from "../services/backendApi"; // Ensure this path is correct
import languages from "../hooks/languages";
import { useToast } from "vue-toastification";
// import { ref, onMounted } from "vue";
import Constant from "../common/constant";
import { initCustomFormatter } from "vue";
const toast = useToast();

export default {
    data() {
        return {
            translatedText: {},
            languagesDict: { ...languages },
            newLang: "",
            word: {
                en: "",
                de: "",
                fr: "",
                vi: "",
            },
            otherLanguages: {},
            newLang: "",
        };
    },
    setup() {
        const toast = useToast();
        return { toast };

    },
    methods: {
        async translateText() {
            try {
                let sourceText = "";
                let sourceLang = "";
                for (const [lang, text] of Object.entries(this.word)) {
                    if (text) {
                        sourceText = text;
                        sourceLang = lang;
                        break;
                    }
                }
                if (!sourceText) {
                    for (const [lang, text] of Object.entries(this.otherLanguages)) {
                        if (text) {
                            sourceText = text;
                            sourceLang = lang;
                            break;
                        }
                    }
                }
                if (sourceText && sourceLang) {
                    for (const targetLang of Object.keys(this.word)) {
                        // console.log(this.word[targetLang], targetLang, sourceLang);
                        if (this.word[targetLang] === "" && targetLang !== sourceLang) {
                            // console.log(this.word[targetLang], targetLang, sourceLang);
                            const response = await backendApi.translateText(
                                sourceText,
                                targetLang
                            );
                            // console.log("check", response);
                            this.word[targetLang] = response.translatedText;
                        }
                    }

                    for (const targetLang of Object.keys(this.otherLanguages)) {
                        if (this.otherLanguages[targetLang] === "" && targetLang !== sourceLang) {
                            const response = await backendApi.translateText(
                                sourceText,
                                targetLang
                            );
                            this.otherLanguages[targetLang] = response.translatedText;
                        }
                    }

                    this.toast.success("Translation successful!");
                }
            } catch (error) {
                console.error(error);
                this.toast.error("Translation failed.");
            }
        },
        addLanguage() {
            if (this.newLang && !this.otherLanguages[this.newLang]) {
                this.otherLanguages[this.newLang] = "";
                this.newLang = "";
            } else if (this.newLang in this.otherLanguages) {
                this.toast.error("Language already exists.");
            } else {
                this.toast.warning("Please select a language.");
            }
        },
        async saveWord() {
            try {
                this.word[others] = this.otherLanguages;
                console.log(this.word);
                const response = await backendApi.saveWord(this.word);
                if (response.result === Constant.OK_CODE) {
                    this.toast.success("Word saved successfully!");
                    this.init();
                } else {
                    this.toast.error("Failed to save word.");
                }
            } catch (error) {
                console.error(error);
                this.toast.error("Error saving word.");
            }
        },
    },
};
</script>

<style scoped>
/* Add some basic styling */
input {
    margin-bottom: 10px;
    display: block;
}

select {
    margin-bottom: 20px;
}

button {
    margin-bottom: 20px;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 5px;
}

.input {
    margin-bottom: 20px;
    border: 3px solid #ccc;
    padding: 10px;
}
</style>
