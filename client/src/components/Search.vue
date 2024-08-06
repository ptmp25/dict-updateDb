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
        <table>
            <thead>
                <tr>
                    <th>English</th>
                    <th>French</th>
                    <th>German</th>
                    <th>Vietnamese</th>
                    <th>Others</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="word in words" :key="word.id">
                    <td>{{ word.en }}</td>
                    <td>{{ word.fr }}</td>
                    <td>{{ word.de }} </td>
                    <td>{{ word.vi }}</td>
                    <td>
                        <p v-for="(value, key) in word.others" :key="key">
                            <strong>{{ languagesDict[key] }}:</strong> {{ value }}
                        </p>
                    </td>
                    <td>
                        <button class="button-box" @click="showDetails(word.id)">Details</button>
                        <button class="button-box" @click="editWord(word.id)">Edit</button>
                        <button class="button-box" @click="deleteWord(word)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import BackendAPI from '../services/backendApi'; // Import the BackendAPI
import { useRoute } from 'vue-router';
import { router } from '../router'; // Import the router object from the Vue Router package
const toast = useToast();

const search = ref('');
const language = ref('english');
const words = ref([]);
const message = ref('');
const route = useRoute();

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

</script>

<style scoped>
.error {
    color: red;
}
</style>