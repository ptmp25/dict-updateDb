<template>
    <div class="container">
        <h1>Search</h1>
        <input type="text" v-model="search" @keyup.enter="searchPost" placeholder="Search for a word">
        <select v-model="language">
            <option value="en">English</option>
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="vi">Vietnamese</option>
        </select>
        <button @click="searchPost">Search</button>
        <!-- <button @click="searchPost">Search</button> -->
        <p class="error">{{ message }}</p>
        <table class="highlight ">
          <thead>
            <tr>
              <th v-for="(code, index) in languageList" :key="code">{{ languagesDict[code] }}
                <button @click="removeCode(index)" v-if="languageList.length > 2">-</button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="word in words" :key="word.id">
              <!-- Check if the word is being edited -->
              <td v-for="code in languageList" :key="code">
                <div v-if="editMode === word.id">
                  <div v-for="(meaning, index) in word.translations[code]" :key="index">
                    <input type="text" v-model="word.translations[code][index]" placeholder="Enter translation..." />
                  </div>
                </div>
                <div v-else>
                  <template v-for="(value, index) in word.translations[code]">
                    <p v-if="word.translations[code].length > 1">{{ index + 1 }}. {{ value }}</p>
                    <p v-else>{{ value }}</p>
                  </template>
                </div>
              </td>
              <td>
                <!-- <button v-if="editMode !== word.id" class="button-box" @click="showDetails(word.id)">Details</button>
                <button v-if="editMode !== word.id" class="button-box" @click="editWord(word.id)">Edit</button>
                <button v-if="editMode === word.id" class="button-box" @click="saveWord(word.id)">Save</button>
                <button v-if="editMode !== word.id" class="button-box" @click="deleteWord(word.id)">Delete</button>
                <button v-if="editMode === word.id" class="button-box" @click="cancelEdit">Cancel</button> -->
              </td>
            </tr>
          </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import BackendAPI from '../services/backendApi'; // Import the BackendAPI
import { useRoute } from 'vue-router';
import { router } from '../router'; // Import the router object from the Vue Router package
import M from 'materialize-css';
import languages from "../hooks/languages";
const toast = useToast();

const search = ref('');
const language = ref('english');
const words = ref([]);
const message = ref('');
const route = useRoute();
const languageList = ref(["en", "fr", "de", "vi"]);
const languagesDict = languages;

const searchPost = async () => {
    if (search.value === '') {
        toast('Please enter a search term');
    } else {
        try {
            const response = await BackendAPI.searchWord(search.value, language.value);
            words.value = response.data.data;
            message.value = '';
        } catch (error) {
            // toast.error('Error fetching search results');
            words.value = [];
            message.value = 'No results found';
        }
    }
}

const deleteWord = async (word) => {
    if (window.confirm("Are you sure you want to delete this word?")) {
        try {
            const response = await BackendAPI.deleteWord(word.id);
            if (response && response.data) {
                // console.log("Deleted word:", response);
                Toast.success("Word deleted successfully");
                fetchList();
            } else {
                Toast.error("Error deleting word");
                console.error("No response received", response);
            }
        } catch (error) {
            console.error("Error deleting word:", error);
        }
    }
};

const showDetails = async (id) => {
    // Redirect to the edit page with the specified id
    router.push('/details/' + id);
    // router.push({ name: 'edit', params: { id: router.params.id } }); // Use the router object to navigate to the edit page with the specified id
};

const editWord = async (id) => {
    router.push('/edit/' + id);
};

onMounted(() => {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);

});


</script>

<style scoped>
.error {
    color: red;
}
</style>