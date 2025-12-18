import axios from "axios";

const publicApi = axios.create({
  baseURL: "",
  withCredentials: true, // 쿠키 필요하면 유지
});

// 디버깅 로그만
publicApi.interceptors.request.use((config) => {
  console.log("🌐 PUBLIC API:", config.url, config.params);
  return config;
});

export default publicApi;
