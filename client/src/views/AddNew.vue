<template>
    <div id="vue_app">
        <div class="container">
            <h1>Upload CSV</h1>
            <input class="upload" type="file" @change="onFileChange" ref="csvFileInput" />
            <button class="btn" @click="uploadCSV">Upload CSV</button>
        </div>
        <br /><br />
        <h1>New Word</h1>
        <table class="table-container">
            <tr>
                <td class="label">English</td>
                <td class="input">
                    <input type="text" v-model="word.en" id="english" placeholder="Enter word..." autocomplete="off"
                    value="<%word.en%>"    
                    @keyup.enter="translateText('en', word.en)"
                    required />
                </td>
            </tr>
        </table>
        <table class="table-container">
            <tr>
                <td class="label">German</td>
                <td class="input">
                    <input type="text" v-model="word.de" id="german" autocomplete="off" placeholder="Enter word..."
                    value="<%word.de%>"    
                    @keyup.enter="translateText('de', word.de)"
                        required />
                </td>
            </tr>
        </table>
        <table class="table-container">
            <tr>
                <td class="label">French</td>
                <td class="input">
                    <input type="text" v-model="word.fr" id="french" placeholder="Enter word..." autocomplete="off"
                    value="<%word.fr%>"   
                    @keyup.enter="translateText('fr', word.fr)"
                    required />
                </td>
            </tr>
        </table>
        <table class="table-container">
            <tr>
                <td class="label">Vietnamese</td>
                <td class="input">
                    <input type="text" v-model="word.vi" id="vietnamese" placeholder="Enter word..." autocomplete="off"
                    value="<%word.vi%>"    
                    @keyup.enter="translateText('vi', word.vi)"
                    
                    required />
                </td>
            </tr>
        </table>
        <div v-for="( text, code) in word.others">
            <table class="table-container">
                <tr>
                    <td class="label">{{ languagesDict[code] }}</td>
                    <td class="input">
                        <input type="text" v-model="word.others[code]" :id="code" placeholder="Enter word..."
                            autocomplete="off" 
                            @keyup.enter="translateText(code, word.others[code])"
                            required />
                    </td>
                </tr>
            </table>
        </div>
        <button class="btn right" @click="create">Submit</button>
        <div>
            <label for="newLang">Add Language:</label>
            <select v-model="newLang" id="newLang">
                <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
            </select>
            <button @click="addLanguage">Add</button>
        </div>
        <br /><br />
        <!-- <div v-if="message" :class="messageClass">{{ message }}</div> -->
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import backendApi from '../services/backendApi'; // Ensure this path is correct
import { useToast } from 'vue-toastification'
import languages from '../hooks/languages';

export default {
    data() {
        return {
            word: {
                en: '',
                de: '',
                fr: '',
                vi: '',
                others: {},
            },
            newLang: '',
            languagesDict: { ...languages },
        };
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    methods: {
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
                        en: '',
                        de: '',
                        fr: '',
                        vi: '',
                        others: {},
                    };
                    this.toast.success("New word created successfully");
                }
            } catch (error) {
                this.toast.error("An error occurred while creating the word");
                console.error(error);
            }
        },
        addLanguage() {
            if (this.newLang && !this.word.others[this.newLang]) {
                this.word.others[this.newLang] = '';
                this.newLang = '';
            }  else {
                this.toast.error('Please select a language');
            }
        },
        onFileChange(event) {
            this.csvFile = event.target.files[0];
        },
        async uploadCSV() {
            if (!this.csvFile) {
                this.toast.error('Please select a CSV file to upload.');
                return;
            }

            const formData = new FormData();
            formData.append('file', this.csvFile);

            try {
                const response = await backendApi.uploadCSV(formData);
                this.toast.success("CSV uploaded successfully");
            } catch (error) {
                this.toast.error(error.response?.data?.message || 'An error occurred');
            }
        },
        async translateText(sourceLang, sourceText) {
            try{
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
                this.toast.error("An error occurred while translating the text");
                console.error(error);
            }
        },
    },
};

</script>

<style>
.success-message {
    color: green;
}

.error-message {
    color: red;
}
</style>
