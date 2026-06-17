import axios from "axios";

const BaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

const apiClient =axios.create({
    headers:{
        "Content-Type":"application/json"
    },
    baseURL:BaseUrl
})


export default apiClient