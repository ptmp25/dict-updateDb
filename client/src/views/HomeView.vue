<template>
  <Add @fetchList="fetchList" />
  <Search @fetchList="fetchList" :languageList="languageList" :words="words" @updateWords="updateWords"
    @updateLanguageList="updateLanguageList" />
  <div class="card bg-base-100 w-10/12 my-2.5 shadow-xl mx-auto">
    <div class="card-body">
      <button class="btn " @click="downloadCSV">Download CSV</button>
      <div class="flex items-center space-x-4">
        <label for="sort" class="mr-2">Sort by:</label>
        <select id="sort" class="select select-bordered w-1/4" v-model="sortField" @change="sortList(sortField)">
          <option v-for="(code, index) in languageList" :key="code" :value="code">{{ languagesDict[code] }}</option>
        </select>
        <label for="view">Add language to list:</label>
        <select name="view" class="select select-bordered w-1/4" id="viewOption" v-model="viewOption">
          <option v-for="(name, code) in languagesDict" :key="code" :value="code">{{ name }}</option>
        </select>
        <button class="btn btn-success" @click="viewWord">Add</button>
      </div>
      <!-- <div class="flex items-center space-x-4">
      </div> -->
      <div class="overflow-x-auto">

        <table class="table table-xs table-pin-rows ">
          <thead>
            <tr>
              <th v-for="(code, index) in languageList" class="text-xl cursor-pointer" :key="code"
                @click="sortList(code)">{{ languagesDict[code] }}
                <button class="btn btn-outline btn-error btn-xs" @click="removeCode(index)"
                  v-if="languageList.length > 2">-</button>
              </th>
              <th class="text-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="word in words" :key="word.id" class="hover">
              <td v-for="code in languageList" :key="code">
                <div v-if="editMode === word.id">
                  <div v-for="(meaning, index) in word.translations[code]" :key="index" class="sameline">
                    <input type="text" v-model="word.translations[code][index]" :id="`input-${code}-${index}`"
                      placeholder="Enter word..." autocomplete="off" class="input w-full max-w-xs input-bordered"/>
                      <!-- @keyup.enter="translate(code, word.translations[code][index])" /> -->
                  </div>
                </div>
                <div v-else>
                  <template v-for="(value, index) in word.translations[code]">
                    <p class="text-lg" v-if="word.translations[code].length > 1">{{ index + 1 }}. {{ value }}</p>
                    <p class="text-lg" v-else>{{ value }}</p>
                  </template>
                </div>
              </td>
              <td>
                <button v-if="editMode !== word.id" class="btn btn-xs btn-info mx-2"
                  @click="showDetails(word.id)">Details</button>
                <button v-if="editMode !== word.id" class="btn btn-xs btn-warning mx-2"
                  @click="editWord(word.id)">Edit</button>
                <button v-if="editMode === word.id" class="btn btn-xs btn-info mx-2"
                  @click="saveWord(word.id)">Save</button>
                <button v-if="editMode !== word.id" class="btn btn-xs btn-error mx-2"
                  @click="deleteWord(word.id)">Delete</button>
                <button v-if="editMode === word.id" class="btn btn-xs btn-error mx-2" @click="cancelEdit">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>✨Tip: Click a language to sort the list.</p>
      <div class="join flex justify-center">
        <button class="join-item btn" v-show="currentPage !== 1" @click="goToPage(currentPage - 1)">Previous</button>
        <button class="join-item btn" v-for="page in pageNumbers" :key="page" @click="goToPage(page)"
          :class="{ 'btn-active': page === currentPage, 'disabled': page === '...' }">
          {{ page }}
        </button>
        <button class="join-item btn" v-show="currentPage !== totalPages" @click="goToPage(currentPage + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import BackendAPI from '../services/backendApi';
import { router } from '../router';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import languages from "../hooks/languages";
import Add from '../components/Add.vue';
import Search from '../components/Search.vue';
import useTranslate from "../hooks/useTranslate";
import backendApi from "../services/backendApi";

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
    const router = useRouter();
    const { word, translateText } = useTranslate();

    const translate = (sourceLang, sourceText) => {
      translateText(sourceLang, sourceText);
    };

    return {
      toast,
      route,
      router,
      word,
      translate,
    };
  },
  components: {
    Add,
    Search,
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        // Fetch new data when the route changes
        this.fetchList();
      },
    },
  },
  methods: {
    async fetchList() {

      // If currentPage is greater than totalPages, reset it to totalPages
      if (this.currentPage > this.totalPages || this.currentPage === 0) {
        this.currentPage = this.totalPages;
      }
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

          // Update URL
          this.$router.push({
            query: {
              ...this.$route.query,
              page: this.currentPage,
              sort: this.sortField
            }
          });
        } else {
          console.error('Error fetching list:', response.message);
        }
      } catch (error) {
        console.error('Error fetching list:', error.message);
      }
    },
    updateWords(words, currentPage, totalPages) {
      console.log('updateWords', words);
      this.words = words;
      this.currentPage = currentPage;
      this.totalPages = totalPages;
    },
    updateLanguageList(languageList) {
      this.languageList = languageList;
    },
    removeCode(index) {
      if (this.languageList.length === 2) {
        this.toast.warning('You must have at least 2 languages');
        return;
      }
      console.log('remove', this.languageList[index]);
      this.languageList.splice(index, 1);
      console.log('languageList', this.languageList);
    },
    async sortList(sortField) {
      try {
        const response = await BackendAPI.readList(
          this.currentPage,
          this.wordsPerPage,
          sortField,
          this.viewOption
        );
        if (response && response.data) {
          this.words = response.data.words;
          this.totalPages = response.data.totalPages;

          // If currentPage is greater than totalPages, reset it to totalPages
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }

          // Update URL
          this.$router.push({
            query: {
              ...this.$route.query,
              page: 1,
              sort: this.sortField
            }
          });
        } else {
          console.error('Error sorting list:', response);
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
        this.$router.push({ name: 'details', params: { id } });
      } catch (error) {
        console.error('Error navigating to details:', error);
      }
    },
    editWord(id) {
      this.editMode = id;
      const word = this.words.find((word) => word.id === id);
      for (const code of this.languageList) {
        if (!word.translations[code]) {
          word.translations[code] = [''];
        }
      }
    },
    async saveWord(id) {
      const word = this.words.find((word) => word.id === id);
      try {
        // Remove empty translations
        for (const code of this.languageList) {
          word.translations[code] = word.translations[code].filter(translation => translation !== '');
        }
        // Update word
        const response = await BackendAPI.updateDetails(id, word);
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
    cancelEdit() {
      this.editMode = null;
      this.fetchList();
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
    async goToPage(page) {
      if (page !== '...' && page !== this.currentPage) {
        this.currentPage = page;
        await this.fetchList();
      }
    },
    async downloadCSV() {
      try {
        const response = await backendApi.downloadCSV(
          `/words/export_csv?languages=${this.languageList}`,
          {
            responseType: "blob",
          }
        );
        // const blob = new Blob([response.data], { type: "text/csv" });
        // const url = window.URL.createObjectURL(blob);
        // const link = document.createElement("a");
        // link.href = url;
        // link.setAttribute("download", "words.csv");
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting CSV:", error);
        this.toast.error("Error downloading CSV");
      }
    }
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

    // Read query parameters
    const page = parseInt(this.$route.query.page) || 1;
    const sort = this.$route.query.sort || 'en';

    this.currentPage = page;
    this.sortField = sort;

    this.fetchList();
  },
};

</script>