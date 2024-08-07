<template>
  <div class="container">
    <h2>Search</h2>
    <button @click="toggleIllustration" class="btn">
      {{ isIllustrating ? 'Hide Illustration' : 'Show Illustration' }}
    </button>
    <div v-if="isIllustrating" class="illustration-container">
      <select name="view" class="input-field col s12" style="display: block;">
        <option v-for="(code, index) in languageList" :key="code" :value="code">{{ languagesDict[code] }}</option>
      </select>
      <input type="text" v-model="searchTerm" @keyup.enter="searchPost" placeholder="Search for a word" />
      <button @click="searchPost" class="btn light-green">Search</button>
      <p class="error">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import BackendAPI from '../services/backendApi';
import languages from '../hooks/languages';
import M from 'materialize-css';

const toast = useToast();

const props = defineProps({
  languageList: {
    type: Array,
    required: true
  }, 
  words: {
    type: Array,
    required: true
  }
});

const searchTerm = ref('');
const language = ref('en');
const message = ref('');
const languagesDict = languages;
const isIllustrating = ref(false);
const originalWords = ref([]);

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

const toggleIllustration = () => {
  isIllustrating.value = !isIllustrating.value;
  if (isIllustrating.value) {
    // Store the current words and clear them
    originalWords.value = [...props.words];
    emit('updateWords', []);
  } else {
    // Restore the original words
    emit('updateWords', originalWords.value);
  }
};

onMounted(() => {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});

watch(isIllustrating, (newValue) => {
  if (!newValue) {
    // Clear search term and message when illustration is turned off
    searchTerm.value = '';
    message.value = '';
  }
});
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.error {
  color: red;
}

.illustration-container {
  margin-top: 10px;
}
</style>