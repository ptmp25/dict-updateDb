<template>
  <Add @fetchList="fetchList" />
  <div id="vue_app" class="container">
    <Search @updateWords="updateWords"  />
    <button class="btn" @click="downloadCSV">Download CSV</button>
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
            <button v-if="editMode !== word.id" class="button-box" @click="showDetails(word.id)">Details</button>
            <button v-if="editMode !== word.id" class="button-box" @click="editWord(word.id)">Edit</button>
            <button v-if="editMode === word.id" class="button-box" @click="saveWord(word.id)">Save</button>
            <button v-if="editMode !== word.id" class="button-box" @click="deleteWord(word.id)">Delete</button>
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

<script setup>
import { ref, onMounted, computed } from "vue";
import BackendAPI from '../services/backendApi';
import { router } from '../router';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import languages from "../hooks/languages";
import Add from '../components/Add.vue';
import Search from '../components/Search.vue';
import M from 'materialize-css';
const Toast = useToast();

const route = useRoute();
const words = ref([]);
const currentPage = ref(Number(route.query.page) || 1);
const totalPages = ref(1);
const itemsPerPage = ref(10);
const sortField = ref("en");
const sortOrder = ref("asc");
const languagesDict = languages;
const viewOption = ref("");
const languageList = ref(["en", "fr", "de", "vi"]);
const editMode = ref(null);

const fetchList = async () => {
  try {
    const response = await BackendAPI.readList(
      currentPage.value,
      itemsPerPage.value,
      sortField.value,
      sortOrder.value
    );
    if (response && response.data) {
      words.value = response.data.words;
      totalPages.value = response.data.totalPages;
      console.log("Fetched!");
    } else {
      console.error("Failed to fetch list:", response);
    }
  } catch (error) {
    console.error("An error occurred while fetching the list:", error);
  }
};

const updateWords = (newWords) => {
  words.value = newWords;
};

const sortList = async (sortField) => {
  try {
    const response = await BackendAPI.readList(
      currentPage.value,
      itemsPerPage.value,
      sortField,
      sortOrder.value
    );
    if (response && response.data) {
      words.value = response.data.words;
      totalPages.value = response.data.totalPages;
      console.log("Fetched list:", response);
    } else {
      console.error("Failed to fetch list:", response);
    }
  } catch (error) {
    console.error("An error occurred while fetching the list:", error);
  }
};

const viewWord = async () => {
  if (!languageList.value.includes(viewOption.value)) {
    languageList.value.push(viewOption.value);
  }
  console.log(languageList.value);
};

const showDetails = async (wordId) => {
  try {
    router.push({
      path: `/details/${wordId}`,
    });
  } catch (error) {
    console.error("An error occurred while showing word details:", error);
  }
};

const editWord = async (wordId) => {
  editMode.value = wordId;
};

const cancelEdit = () => {
  editMode.value = null;
  fetchList();
};

const saveWord = async (wordId) => {
  const word = words.value.find((w) => w.id === wordId);
  if (!word) return;

  try {
    const response = await BackendAPI.updateDetails(wordId, word);
    if (response.statusText !== "OK" || response.status !== 200) {
      if (data.code && data.code === 11000) {
        Toast.error("Duplicate translation found, please check!");
      }
    }
    editMode.value = null;
  } catch (error) {
    console.error("An error occurred while saving the word:", error);
  }
};

const deleteWord = async (wordId) => {
  try {
    const response = await BackendAPI.deleteWord(wordId);
    if (response && response.status === 200) {
      console.log("Deleted successfully!");
      fetchList();
    } else {
      console.error("Failed to delete word:", response);
    }
  } catch (error) {
    console.error("An error occurred while deleting the word:", error);
  }
};

const removeCode = (index) => {
  if (languageList.value.length > 2) {
    languageList.value.splice(index, 1);
  }
};

const goToPage = async (page) => {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    try {
      const response = await BackendAPI.readList(
        currentPage.value,
        itemsPerPage.value,
        sortField.value,
        sortOrder.value
      );
      if (response && response.data) {
        words.value = response.data.words;
        totalPages.value = response.data.totalPages;
        console.log("Fetched page data:", response);
      } else {
        console.error("Failed to fetch page data:", response);
      }
    } catch (error) {
      console.error("An error occurred while fetching the page data:", error);
    }
  }
};

const downloadCSV = async () => {
  try {
    const response = await BackendAPI.downloadCSV();
    if (response && response.data) {
      const csvContent = response.data;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'words.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download CSV:", response);
    }
  } catch (error) {
    console.error("An error occurred while downloading the CSV:", error);
  }
};

const pageNumbers = computed(() => {
  const range = 2;
  const pages = [];
  const totalPagesNumber = totalPages.value;

  let startPage = Math.max(1, currentPage.value - range);
  let endPage = Math.min(totalPagesNumber, currentPage.value + range);

  if (currentPage.value - range > 1) {
    pages.push(1);
    if (currentPage.value - range > 2) {
      pages.push("...");
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (currentPage.value + range < totalPagesNumber) {
    if (currentPage.value + range < totalPagesNumber - 1) {
      pages.push("...");
    }
    pages.push(totalPagesNumber);
  }

  return pages;
});

onMounted(() => {
  fetchList();
  const dropdowns = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(dropdowns);
});
</script>

<style>
.container {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
}

.pagination button {
  margin: 0 5px;
}

.pagination button.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
