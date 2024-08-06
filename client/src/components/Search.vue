<template>
  <div class="search-container">
    <h2>Search</h2>
    <input type="text" v-model="searchTerm" @keyup.enter="searchPost" placeholder="Search for a word" />
    <select name="view" class="input-field col s12" id="viewOption" v-model="language">
      <option v-for="(code, index) in languageList" :key="code" :value="code">{{ languagesDict[code] }}</option>
    </select>
    <button @click="searchPost">Search</button>
    <p class="error">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import BackendAPI from '../services/backendApi';
import languages from '../hooks/languages';
import M from 'materialize-css';

const toast = useToast();

const props = defineProps({
  languageList: {
    type: Array,
    required: true
  }
});

const searchTerm = ref('');
const language = ref('en');
const message = ref('');
const languagesDict = languages;

const emit = defineEmits(['updateWords', 'updateLanguageList']);

const searchPost = async () => {
  if (searchTerm.value === '') {
    toast('Please enter a search term');
  } else {
    try {
      const response = await BackendAPI.searchWord(searchTerm.value, language.value);
      const results = response.data.data;
      if (results && results.length > 0) {
        emit('updateWords', results);
        message.value = '';
      } else {
        message.value = 'No results found';
        emit('updateWords', []);
      }
    } catch (error) {
      message.value = 'Error fetching search results';
      emit('updateWords', []);
      console.error('Error fetching search results:', error);
    }
  }
};

onMounted(() => {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.error {
  color: red;
}
</style>