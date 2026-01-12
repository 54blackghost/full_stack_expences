import axios from "axios";


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "api/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
})

export default api