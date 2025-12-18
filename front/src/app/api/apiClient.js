import axios from "axios";

/**
 * ✅ baseURL 제거
 * → 브라우저는 무조건 "같은 origin(프론트 서버)"으로 요청
 * → /api/** 는 Next.js 서버 API로 전달됨
 */
const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

// ==========================
// AccessToken 관리
// ==========================
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
  localStorage.setItem("accessToken", token);
}

// ==========================
// Refresh 제어용 변수
// ==========================
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// ==========================
// 1️⃣ 요청 인터셉터
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔍 요청 주소 로그 (디버깅용)
    console.log("📡 API 요청:", config.url, config.params);

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// 2️⃣ 응답 인터셉터 (401 → 토큰 재발급)
// ==========================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          /**
           * ✅ 백엔드 직접 호출 ❌
           * ✅ 프론트 서버 API 호출 ⭕
           */
          const res = await api.post("/api/auth/refresh");

          const authHeader = res.headers["authorization"];
          const newAccessToken = authHeader?.replace("Bearer ", "");

          if (!newAccessToken) {
            throw new Error("새 AccessToken이 응답 헤더에 없습니다.");
          }

          setAccessToken(newAccessToken);

          isRefreshing = false;
          onTokenRefreshed(newAccessToken);
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      // 재발급 대기 중이면 큐에 등록
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
