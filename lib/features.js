import moment from "moment";
import AsyncStorage from '@react-native-async-storage/async-storage';



const fileFormat = (url) => {
    const extension = url.split('.').pop().toLowerCase(); // Convert extension to lowercase
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension)) return 'video';
    if (['mp3', 'wav'].includes(extension)) return 'audio';
    if (['pdf', 'doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
};

const getOrSaveFromStorage = async ({ key, value, get }) => {
    try {
        if (get) {
            const storedValue = await AsyncStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : null;
        } else {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        console.error('Error accessing AsyncStorage:', error);
    }
};

const transformImage = (url = "", width=100) =>{

    const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`)

    return newUrl
};

const getLast7Days = () =>{
    const currentDate = moment();

    const last7Days = [];

    for (let i= 0; i<7; i++){
        const dayDate = currentDate.clone().subtract(i, "days");
        const dayName = dayDate.format("dddd")

        last7Days.unshift(dayName)
    }

    return last7Days;
}

export { fileFormat, transformImage, getLast7Days, getOrSaveFromStorage }