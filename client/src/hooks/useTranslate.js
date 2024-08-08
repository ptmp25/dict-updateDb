import { ref } from 'vue';
import backendApi from '../services/backendApi';
import { useToast } from "vue-toastification";

export default function useTranslate() {
    const word = ref({
      translations: {
        en: [""],
        de: [""],
        fr: [""],
        vi: [""],
      },
    });
    const toast = useToast();

    async function translateText(sourceLang, sourceText) {
        try {
            console.log(word.value);
            if (sourceText !== "") {
                if (word.value.translations) { // Add null check
                    for (const targetLang of Object.keys(word.value.translations)) {
                        for (const index in word.value.translations[targetLang]) {
                            if (word.value.translations[targetLang][index] === "" && targetLang !== sourceLang) {
                                const response = await backendApi.translateText(
                                    sourceText,
                                    sourceLang,
                                    targetLang
                                );
                                word.value.translations[targetLang][index] = response.translatedText;
                            }
                        }
                    }
                }
                console.log(word.value);
                toast.success("Translation successful!");
                // return word.value;
            }
        } catch (error) {
            toast.error("An error occurred while translating the text");
            console.error(error);
        }
    }

    return { word, translateText, toast };
}