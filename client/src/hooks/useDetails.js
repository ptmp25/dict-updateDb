
import { ref } from 'vue';
import BackendAPI from "../services/backendApi";

export default function useDetails() {
    const word = ref(null);
    const error = ref(null);

    const getDetails = async (id) => {
        try {
            const response = await BackendAPI.getDetails(id);
            if (response && response.data.result) {
                word.value = response.data.data;
            } else {
                throw new Error('Error fetching word details');
            }
        } catch (err) {
            error.value = err;
        }
    };

    return { word, error, getDetails };
}