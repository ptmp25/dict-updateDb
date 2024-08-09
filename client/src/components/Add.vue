<template>
    <div class="card bg-base-100 w-10/12 my-2.5  mx-auto shadow-xl">
        <div class="card-body">
            <div class="flex">
                <p class="card-title">Add New Word</p>
                <!-- <button class="btn btn-primary btn-sm btn-secondary" @click="toggleMode">{{ mode === 'manual' ? 'Switch to Upload CSV Upload' : 'Switch to Manual Input' }}</button> -->
            </div>
            <div id="uploadCSV" class="">
                <p>Upload new words by CSV:</p>
                <input class="file-input w-full max-w-xs" type="file" @change="onFileChange" ref="csvFileInput"
                    accept="text/csv" />
                <button class="btn btn-success btn-sm" @click="uploadCSV">Upload CSV</button>
            </div>
            <div id="manual">
                <div class="flex items-center justify-between space-x-4">
                    <p for="newLang">Add Language:</p>
                    <select class="select select-bordered w-8/12 dropdown-content menu" v-model="newLang" id="newLang">
                        <option value="" disabled selected>Choose new language you want to add</option>
                        <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
                    </select>
                    <div class="flex justify-end">
                        <button @click="addLanguage" class="btn btn-success btn">Add</button>
                    </div>
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
                                            class="input w-full max-w-xs input-bordered"
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
                <div class="flex justify-end ">
                    <p>✨Tips: Press Enter to use your first filled input as the reference for translation!</p>
                    <button class="btn btn-error mx-3 btn-sm" @click="reset">Reset</button>
                    <button class="btn btn-warning mx-3 btn-sm" @click="empty">Empty Input</button>
                    <button class="btn btn-success mx-3 btn-sm" @click="create">Submit</button>
                </div>
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
            if (!confirm('Are you sure you want to delete this translation?')) {
                return;
            }
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
                if (response.result !== "OK" || response.status !== 200) {
                    if (response.code && response.code === 11000) {
                        this.toast.error(response.message);
                        console.error(response.message)
                    } else {
                        this.toast.error("An error occurred while creating the word");
                        console.error(response.message)
                    }
                } else {
                    const data = response.data;
                    // Emit the event to update the list
                    this.$emit('fetchList');
                    this.toast.success("New word created successfully");
                    this.empty();
                }
            } catch (error) {
                this.toast.error("An error occurred while creating the word");
                console.error(error);
            }
        },
        empty() {
            for (const [key, value] of Object.entries(this.word.translations)) {
                // this.word.translations[key] = [''];
                for (let i = 0; i < value.length; i++) {
                    this.word.translations[key][i] = '';
                }
            }
        },
        reset() {
            this.word = {
                translations: {
                    en: [''],
                    de: [''],
                    fr: [''],
                    vi: [''],
                }
            };
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
                this.$emit('fetchList');
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
