<template>
  <div class="card bg-base-100  w-10/12 my-2.5 mx-auto shadow-xl">
    <div class="card-body">
      <div class="flex items-center">
        <p class="card-title">Search</p>
        <button @click="toggleIllustration" class="btn btn-sm">
          {{ isIllustrating ? 'Close Search' : 'Search' }}
        </button>
      </div>
      <div v-if="isIllustrating" class="illustration-container">
        <div class="flex items-center space-x-4">
          <p>Language:</p>
          <select v-model="language" name="view" class="select select-bordered w-full max-w-xs">
            <option v-for="(code, index) in languageList" :key="code" :value="code">{{ languagesDict[code] }}</option>
          </select>
          <p>Word:</p>
          <input type="text" v-model="searchTerm" @keyup.enter="searchPost" placeholder="Search for a word"
            class="input input-bordered w-full max-w-xs" />
          <button @click="searchPost" class="btn btn-info">Search</button>
        </div>
        <p class="error">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import BackendAPI from '../services/backendApi';
import languages from '../hooks/languages';

export default {
  props: {
    languageList: {
      type: Array,
      required: true
    },
    words: {
      type: Array,
      required: true
    }
  },
  emits: ['fetchList', 'updateWords', 'updateLanguageList'],
  setup() {
    const toast = useToast();
    const languagesDict = languages;
    const language = ref('');
    const searchTerm = ref('');
    const message = ref('');
    const isIllustrating = ref(false);

    onMounted(async () => {
      // languageList.value = Object.keys(languagesDict);
    });

    return {
      toast,
      languagesDict,
      language,
      searchTerm,
      message,
      isIllustrating,
    };
  },
  methods: {
    toggleIllustration() {
      this.isIllustrating = !this.isIllustrating;
      if (!this.isIllustrating) {
        this.$emit('fetchList');
      }
    },
    async searchPost() {
      if (!this.language || !this.searchTerm) {
        this.message = 'Please select a language and enter a search term';
        return;
      }
      try {
        const page = 1;
        const limit = 10;
        const response = await BackendAPI.searchWord(this.searchTerm, this.language, page, limit);
        // console.log(response);
        if (response && response.data) {
          console.log(response.data.data);
          this.$emit('updateWords', response.data.data, page, response.data.totalPages);
          // this.$emit('updateLanguageList', this.language);
          this.message = '';
          this.toast.success('Search successful');
        } else {
          this.message = 'No results found';
          this.toast.error('No results found');
        }
      } catch (error) {
        this.message = 'An error occurred';
        this.toast.error('An error occurred');
        console.error(error);
      }
    },
  },
  watch: {
    language() {
      this.message = '';
    },
    searchTerm() {
      this.message = '';
    },
  },
};
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