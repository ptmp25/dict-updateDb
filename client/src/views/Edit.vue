<template>
    <div class="card-body">
        <!-- <div class="flex items-center space-x-2">
            <RouterLink to="/" class="btn btn-info btn-sm">Home</RouterLink>
            <RouterLink :to="`/details/${word.id}`" class="btn btn-info btn-sm">Back</RouterLink>
        </div> -->
        <div class="" v-if="word">
        <p class="card-title">Edit Word</p>
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
                                <div v-for="(meaning, index) in meanings" :key="index" class="mt-2">
                                    <input type="text" v-model="word.translations[code][index]"
                                        :id="`input-${code}-${index}`" placeholder="Enter word..." autocomplete="off"
                                        class="input input-bordered w-full max-w-xs"
                                        @keyup.enter="translateText(code, word.translations[code][index])" required />
                                </div>
                            </td>
                            <td>
                                <div class="flex justify-center items-center" v-for="(meaning, index) in meanings"
                                    :key="`delete-${code}-${index}`">
                                    <button class="btn btn-error btn-outline btn-xs mt-2"
                                        @click="deleteMeaning(code, index)">Remove</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end">
                <p>✨Tips: Press Enter to use your first filled input as the reference for translation! ✨</p>
                <button class="btn btn-success " @click="saveEdit">Submit</button>
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
import useTranslate from '../hooks/useTranslate';

export default {
    data() {
        return {
            languagesDict: { ...languages },
            newLang: "",
        };
    },
    setup() {
        const route = useRoute();

        const id = route.params.id;
        const { word: fetchedWord, error, getDetails } = useDetails();
        const toast = useToast();

        const { word, translateText } = useTranslate();
        onMounted(async () => {
            await getDetails(id);
            word.value = fetchedWord.value;
            console.log(word.value);
        });
        return { id, word, toast, translateText };
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
            if (!confirm('Are you sure you want to delete this translation?')) {
                return;
            }
            console.log('delete', this.word.translations[code]);
            this.word.translations[code].splice(index, 1);
            console.log('delete', this.word.translations[code]);
        },
        async saveEdit() {
            try {
                // Check if any translation is empty
                const isEmptyTranslation = Object.values(this.word.translations).some(translation => translation.some(meaning => meaning === ''));
                if (isEmptyTranslation) {
                    console.log('Please fill in all translations');
                    this.toast.warning('Please fill in all translations');
                    return;
                }

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
                    router.push({ name: 'details', params: { id: this.id } });
                }
            } catch (error) {
                this.toast.error("An error occurred while updating the word");
                console.error(error);
            }
        },
    },
};

</script>