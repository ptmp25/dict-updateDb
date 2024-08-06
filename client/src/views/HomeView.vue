<script >
</script>

<template>
  <Add/>
  <div id="vue_app" class="container">
    <button class="btn" @click="downloadCSV">Download CSV</button>
    <label for="sort">Sort by:</label>
    <select id="sort" v-model="sortField" @change="sortList(sortField)">
      <option value="en">English</option>
      <option value="de">German</option>
      <option value="fr">French</option>
      <option value="vi">Vietnamese</option>
    </select>
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
              <p v-for="(value, key) in word.others" :key="key" >
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
      // console.log("Fetched list:", response);
    } else {
      console.error("No response received", response);
    }
  } catch (error) {
    console.error("Error fetching list:", error);
  }
};

const pageNumbers = computed(() => {
  const range = 2; // Number of pages to show before and after the current page
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);

  if (start > 1) {
    start += 1; // Add one more page number at the beginning if there's a gap
  }
  if (end < totalPages.value) {
    end -= 1; // Remove one page number from the end if there's a gap
  }

  let pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Always include first and last page
  if (start > 2) {
    pages.unshift(1, "...");
  } else if (start > 1) {
    pages.unshift(1);
  }
  if (end < totalPages.value - 1) {
    pages.push("...", totalPages.value);
  } else if (end < totalPages.value) {
    pages.push(totalPages.value);
  }

  return pages;
});

const goToPage = (page) => {
  if (page !== "..." && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchList();
    router.replace({ query: { page: page } }); // Update the URL with the new page number
  }
};

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

const downloadCSV = async () => {
  try {
    const response = await BackendAPI.exportCSV();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'words.csv');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
};

const sortList = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
  fetchList();
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchList();
    router.replace({ query: { page: currentPage.value } }); // Update the URL with the new page number
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchList();
    router.replace({ query: { page: currentPage.value } }); // Update the URL with the new page number
  }
};

onMounted(() => {
  fetchList();
  console.log("Home view mounted");
});

{
  words,
    currentPage,
    totalPages,
    itemsPerPage,
    sortField,
    sortOrder,
    fetchList,
    pageNumbers,
    goToPage,
    deleteWord,
    showDetails,
    editWord,
    downloadCSV,
    sortList,
    previousPage,
    nextPage
};
</script>

<style>
/* Add your styles here */
</style>
