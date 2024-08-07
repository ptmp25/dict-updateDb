<template>
  <Add @fetchList="fetchList" />
  <Search :languageList="languageList" :words="words" @updateWords="updateWords"
    @updateLanguageList="updateLanguageList" />
  <div id="vue_app" class="container">
    <button class="btn  light-blue accent-4" @click="downloadCSV">Download CSV</button>
    <label for="sort">Sort by:</label>
    <select id="sort" class="input-field col s12" v-model="sortField" @change="sortList(sortField)">
      <option v-for="(code, index) in languageList" :key="code" :value="code">{{ languagesDict[code] }}</option>
    </select>
    <label for="view">View</label>
    <select name="view" class="input-field col s12" id="viewOption" v-model="viewOption">
      <option v-for="(name, code) in languagesDict" :key="code" :value="code">{{ name }}</option>
    </select>
    <button @click="viewWord">Add</button>
    <table class="highlight">
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
            <button v-if="editMode !== word.id" class="button-box btn blue" @click="showDetails(word.id)">Details</button>
            <button v-if="editMode !== word.id" class="button-box btn amber accent-2"
              @click="editWord(word.id)">Edit</button>
            <button v-if="editMode === word.id" class="button-box" @click="saveWord(word.id)">Save</button>
            <button v-if="editMode !== word.id" class="button-box btn red lighten-1"
              @click="deleteWord(word.id)">Delete</button>
            <button v-if="editMode === word.id" class="button-box" @click="cancelEdit">Cancel</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button v-show="currentPage !== 1" @click="goToPage(currentPage - 1)">Previous</button>
      <button v-for="page in pageNumbers" :key="page" @click="goToPage(page)"
        :class="{ active: page === currentPage, disabled: page === '...' }">
        {{ page }}
      </button>
      <button v-show="currentPage !== totalPages" @click="goToPage(currentPage + 1)">Next</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import BackendAPI from '../services/backendApi';
import { router } from '../router';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import languages from "../hooks/languages";
import Add from '../components/Add.vue';
import Search from '../components/Search.vue';
import M from 'materialize-css';

export default {
  data() {
    return {
      words: [],
      languageList: ['en', 'de', 'fr', 'vi'],
      languagesDict: { ...languages },
      sortField: 'en',
      viewOption: 'en',
      currentPage: 1,
      wordsPerPage: 10,
      editMode: null,
      totalPages: 1,
    };
  },
  setup() {
    const toast = useToast();
    const route = useRoute();

    return {
      toast,
    };
  },
  components: {
    Add,
    Search,
  },
  methods: {
    async fetchList() {
      try {
        const response = await BackendAPI.readList(
          this.currentPage,
          this.wordsPerPage,
          this.sortField,
          this.viewOption
        );
        if (response && response.data) {
          this.words = response.data.words;
          this.totalPages = response.data.totalPages;
        } else {
          console.error('Error fetching list:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching list:', error);
      }
    },
    updateWords(words) {
      this.words = words;
      this.currentPage = 1;

    },
    updateLanguageList(languageList) {
      this.languageList = languageList;
    },
    removeCode(index) {
      this.languageList.splice(index, 1);
    },
    async sortList(sortField) {
      try {
        const response = await BackendAPI.readList(
          this.currentPage,
          this.wordsPerPage,
          sortField,
          this.viewOption
        );
        if (response.data.data) {
          this.words = response.data.words;
          this.totalPages = response.data.totalPages;
        } else {
          console.error('Error sorting list:', response.data.message);
        }
      } catch (error) {
        console.error('Error sorting list:', error);
      }
    },
    viewWord() {
      if (this.languageList.length > 4) {
        this.toast.warning('You can only view up to 4 languages at a time');
      } else if (!this.languageList.includes(this.viewOption)) {
        this.languageList.push(this.viewOption);
      } else {
        this.toast.warning('Language already selected');
      }
    },
    async showDetails(id) {
      try {
        router.push({ name: 'Details', params: { id } });
      } catch (error) {
        console.error('Error navigating to details:', error);
      }
    },
    editWord(id) {
      this.editMode = id;
    },
    async saveWord(id) {
      const word = this.words.find((word) => word.id === id);
      try {
        const response = await BackendAPI.updateWord(id, word);
        if (response.statusText !== "OK" || response.status !== 200) {
          if (data.code && data.code === 11000) {
            Toast.error("Duplicate translation found, please check!");
          }
        }
        this.editMode = null;
      } catch (error) {
        console.error('Error updating word:', error);
        this.toast.error('Error updating word');
      }
    },
    async deleteWord(id) {
      if (!confirm('Are you sure you want to delete this word?')) {
        return;
      }
      BackendAPI.deleteWord(id)
        .then(() => {
          this.fetchList();
        })
        .catch((error) => {
          console.error('Error deleting word:', error);
        });
    },
    cancelEdit() {
      this.editMode = null;
      this.fetchList();
    },
    async goToPage(page) {
      if (page !== '...' && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchList();
      }
    },
    downloadCSV() {
      const csv = this.words.map((word) => {
        const translations = this.languageList.map((code) => word.translations[code].join(','));
        return `${word.id},${translations.join(',')}`;
      }).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'words.csv';
      a.click();
    },
  },
  computed: {
    pageNumbers() {
      const range = 2;
      const pages = [];
      const totalPagesNumber = this.words.length > 0 ? this.totalPages : 1;
      let startPage = Math.max(1, this.currentPage - range);
      let endPage = Math.min(totalPagesNumber, this.currentPage + range);

      if (this.currentPage - range > 1) {
        pages.push(1);
        if (this.currentPage - range > 2) {
          pages.push("...");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (this.currentPage + range < totalPagesNumber) {
        if (this.currentPage + range < totalPagesNumber - 1) {
          pages.push("...");
        }
        pages.push(totalPagesNumber);
      }

      return pages;
    },
  },
  mounted() {
    console.log('HomeView mounted');
    this.fetchList();
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdowns);
  },
};

</script>