import axios, { AxiosHeaders } from "axios";
import { supabase } from "@/lib/supabaseClient";

const BaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

const apiClient =axios.create({
    headers:{
        "Content-Type":"application/json"
    },
    baseURL:BaseUrl
})
//拦截请求，把token添加到请求头中
apiClient.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
        const headers = AxiosHeaders.from(config.headers);
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
    }
    return config;
})

export default apiClient
