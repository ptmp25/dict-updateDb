<template>
    <div class="card bg-base-100 w-10/12 my-2.5  mx-auto shadow-xl">
        <div class="card-body">
            <p class="card-title">Add New Word</p>
            <button class="btn btn-primary" @click="toggleMode">{{ mode === 'manual' ? 'Switch to CSV Upload' : 'Switch to Manual Input' }}</button>
            <div v-if="mode === 'manual'" id="manual">
                <div class="">
                    <p for="newLang">Add Language:</p>
                    <select v-model="newLang" id="newLang">
                        <option value="" disabled selected>Choose new language you want to add</option>
                        <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
                    </select>
                </div>
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
            <div v-else id="uploadCSV">
                <input class="upload" type="file" @change="onFileChange" ref="csvFileInput" />
                <button class="btn" @click="uploadCSV">Upload CSV</button>
            </div>
        </div>
    </div>
</template>

<script>
import languages from '../hooks/languages';
import backendApi from '../services/backendApi';
import { useToast } from 'vue-toastification';
import useTranslate from '../hooks/useTranslate';

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
            mode: 'manual', // start in 'manual' mode
        };
    },
    setup() {
        const toast = useToast();
        const { word, translateText } = useTranslate();
        return { toast, word, translateText };
    },
    methods: {
        toggleMode() {
            this.mode = this.mode === 'manual' ? 'uploadCSV' : 'manual';
            if (this.mode === 'uploadCSV') {
                // this.$refs.csvFileInput.click();
            }
        },
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
        async create() {
            if (Object.values(this.word.translations).flat().some((word) => word === "")) {
                this.toast.error("Please fill in all the translations");
                return;
            }
            if (Object.values(this.word.translations).flat().length < 2) {
                this.toast.error("Please add at least 2 translations");
                return;
            }
            const isEnglishDuplicated = Object.values(this.word.translations).flat().filter((word) => word === "en").length > 1;
            if (isEnglishDuplicated) {
                this.toast.error("English translation is duplicated");
                return;
            }
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
    },
    onMounted() {
        console.log('mounted');
    }
};
</script>
