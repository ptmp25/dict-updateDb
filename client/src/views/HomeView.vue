<template>
  <Add @fetchList="fetchList" />
  <div id="vue_app" class="container">
    <button class="btn" @click="downloadCSV">Download CSV</button>
    <label for="sort">Sort by:</label>
    <select id="sort" v-model="sortField" @change="sortList(sortField)">
      <option value="en">English</option>
      <option value="de">German</option>
      <option value="fr">French</option>
      <option value="vi">Vietnamese</option>
    </select>
    <label for="view">View</label>
    <select name="view" id="viewOption" v-model="viewOption">
      <option v-for="(name, code) in languagesDict" :key="code" :value="code" option>{{ name }}</option>
    </select>
    <button @click="viewWord">Add</button>
    <table>
      <thead>
        <tr>
          <th v-for="(code, index) in languageList" :key="code">{{ languagesDict[code] }}
          <button @click="removeCode(index)" v-if="languageList.length > 2">-</button></th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="word in words" :key="word.id">
          <td v-for="code in languageList" :key="code">
            <td>
              <template v-for="(value, index) in word.translations[code]">
                <p v-if="word.translations[code].length > 1">{{ index + 1 }}. {{ value }}</p>
                <p v-else>{{ value }}</p>
              </template>
            </td>
        </td>
          <td>
            <button class="button-box" @click="showDetails(word.id)">Details</button>
            <button class="button-box" @click="editWord(word.id)">Edit</button>
            <button class="button-box" @click="deleteWord(word.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button v-show="currentPage !== 1" @click="goToPage(currentPage - 1)">
        Previous
      </button>
      <button v-for="page in pageNumbers" :key="page" @click="goToPage(page)"
        :class="{ active: page === currentPage, disabled: page === '...' }">
        {{ page }}
      </button>
      <button v-show="currentPage !== totalPages" @click="goToPage(currentPage + 1)">
        Next
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from "vue";
import BackendAPI from '../services/backendApi'; // Import the BackendAPI
import { router } from '../router'; // Import the router object from the Vue Router package
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import languages from "../hooks/languages";
import Add from '../components/Add.vue';
const Toast = useToast();

const route = useRoute();
const words = ref([]);
const currentPage = ref(Number(route.query.page) || 1); // Get the current page number from the URL query parameter
const totalPages = ref(1);
const itemsPerPage = ref(10);
const sortField = ref("id");
const sortOrder = ref("asc");
const languagesDict = languages;
const viewOption = ref("");
const languageList = ref(["en", "fr", "de", "vi"]);

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

const viewWord = async (viewOption) => {
  try {
    const response = await BackendAPI.viewOption(
      currentPage.value,
      itemsPerPage.value,
      viewOption
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

const showDetails = async (wordId) => {
  try {
    router.push({
      path: `/details/${wordId}`, // Navigate to the details page with the wordId
    });
  } catch (error) {
    console.error("An error occurred while showing word details:", error);
  }
};

const editWord = async (wordId) => {
  try {
    router.push({
      path: `/edit/${wordId}`, // Navigate to the details page with the wordId
    });
  } catch (error) {
    console.error("An error occurred while showing word details:", error);
  }
};

// Function to delete a word by ID
const deleteWord = async (wordId) => {
  if (!confirm("Are you sure you want to delete this word?")) {
    return;
  }
  try {
    const response = await BackendAPI.deleteWord(wordId);
    if (response.status === 200) {
      // Remove the word from the list if the deletion is successful
      words.value = words.value.filter((word) => word.id !== wordId);
      Toast.success("Word deleted successfully!");
      // Refresh the list after deletion
      fetchList();
    } else {
      console.error("Failed to delete word:", response);
    }
  } catch (error) {
    console.error("An error occurred while deleting the word:", error);
  }
};

// Calculate pagination page numbers
const pageNumbers = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
  let startPage = Math.max(1, currentPage.value - halfMaxPagesToShow);
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages.value);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (startPage > 1) {
    pages.unshift("...");
  }

  if (endPage < totalPages.value) {
    pages.push("...");
  }

  return pages;
});

// Function to navigate to a specific page
const goToPage = (page) => {
  if (page === "...") return;
  currentPage.value = page;
  fetchList();
};

onMounted(() => {
  fetchList(); // Fetch the word list when the component is mounted
});

const downloadCSV = () => {
  // Fetch the data from your data source
  const csvData = words.value; // Replace with your actual data

  // Define the CSV headers
  const headers = ["English", "French", "German", "Vietnamese", "Other"];

  // Convert the data to CSV format
  const csvContent = [
    headers.join(","), // Add the header row
    ...csvData.map((row) =>
      [
        row.en,
        row.fr,
        row.de,
        row.vi,
        Object.entries(row.others)
          .map(([key, value]) => `${languagesDict[key]}: ${value}`)
          .join("; "), // Convert the 'others' object to a string
      ].join(",") // Join each row with commas
    ),
  ].join("\n"); // Join each line with newline characters

  // Create a Blob with the CSV data and download it
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "words.csv"); // Specify the filename
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const removeCode = (index) => {
  languageList.value.splice(index, 1);
};

</script>
