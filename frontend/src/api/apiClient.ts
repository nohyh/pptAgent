import axios from "axios";

const BaseUrl = "http://localhost:8000"

const apiClient =axios.create({
    headers:{
        "Content-Type":"application/json"
    },
    baseURL:BaseUrl
})


export default apiClient