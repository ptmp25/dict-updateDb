import "./tailwind.css";
// import "./assets/main.css"

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

axios.defaults.baseURL = "http://localhost:3000";
const app = createApp(App);

const toastOptions = {
  
};

app.use(router);
app.use(Toast, toastOptions);

app.mount("#app");
