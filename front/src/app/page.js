"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      // 도서 목록 전체(최대 100개) 불러오기
      const res = await fetch(
        "http://localhost:8080/api/books?page=1&size=100"
      );
      const json = await res.json();

      // 백엔드에서 data.books 리스트가 옴
      const allBooks = json.data.books;

      // 전체 중 랜덤으로 섞어서 앞의 3개만 사용
      const shuffled = [...allBooks].sort(() => Math.random() - 0.5);
      setBooks(shuffled.slice(0, 3));
    }

    fetchBooks();
  }, []);

  return (
    <main className="home">
      {/* 상단 회색 바: 홈 로고 / 로그인 / 회원가입 */}
      <header className="home-nav">
        <div className="home-logo">홈 로고</div>
        <nav className="home-nav-right">
          <button className="home-nav-link">로그인</button>
          <button className="home-nav-link">회원가입</button>
        </nav>
      </header>

      {/* 검색창 + 돋보기 + 메뉴 아이콘 */}
      <section className="home-search">
        <div className="home-search-box">
          <input className="home-search-input" type="text" />
        </div>
        <button className="home-search-icon">🔍</button>
        <button className="home-menu-icon">
          <span />
          <span />
          <span />
        </button>
      </section>
    </main>
  );
}

//"use client";
//
//import React, { useEffect, useState } from "react";
//import axios from "axios";
//import api from "./api/apiClient";
//
//export default function Home() {
//  const [noJwtError, setNoJwtError] = useState("");
//  const [jwtImageUrl, setJwtImageUrl] = useState("");
//
//  useEffect(() => {
//    const runFullAuthFlow = async () => {
//
//      /* -----------------------------------------------------
//       * 1) 로그인 요청
//       * ----------------------------------------------------- */
//      try {
//        const loginRes = await axios.post(
//          "http://localhost:8080/api/auth/login",
//          { id: "test1", pw: "1234" },
//          { withCredentials: true }
//        );
//
//        const authHeader = loginRes.headers["authorization"];
//        const accessToken = authHeader.replace("Bearer ", "");
//        localStorage.setItem("accessToken", accessToken);
//      } catch (err) {
//        console.error("로그인 실패:", err);
//        return;
//      }
//
//
//      /* -----------------------------------------------------
//       * 2) Refresh Token으로 Access Token 재발급 요청
//       * ----------------------------------------------------- */
//      try {
//        const refreshRes = await axios.post(
//          "http://localhost:8080/api/auth/token/refresh",
//          {},
//          { withCredentials: true }
//        );
//
//        const refreshAuth = refreshRes.headers["authorization"];
//        const newAccessToken = refreshAuth.replace("Bearer ", "");
//        localStorage.setItem("accessToken", newAccessToken);
//      } catch (err) {
//        console.error("재발급 요청 실패:", err);
//      }
//
//
//      /* -----------------------------------------------------
//       * 3) 이미지 요청 테스트 (이미지 = byte[])
//       * ----------------------------------------------------- */
//
//      /* --- 3-1. JWT 없이 요청 → 에러 div 출력 --- */
//      try {
//        await axios.get("http://localhost:8080/api/books/cover/0", {
//          responseType: "blob",
//        });
//      } catch (err) {
//        console.error("JWT 없이 요청 실패:", err);
//        setNoJwtError(err.response?.data?.message || "권한 부족 (401/403)");
//      }
//
//      /* --- 3-2. JWT 포함 요청(apiClient) → 이미지 표시 --- */
//      try {
//        const withJwtRes = await api.get("/books/cover/0", {
//          responseType: "blob", // ★ byte[] 수신
//        });
//
//        const blob = withJwtRes.data;
//        const url = URL.createObjectURL(blob); // ★ Blob → 브라우저 URL
//        setJwtImageUrl(url);
//
//      } catch (err) {
//        console.error("JWT 포함 요청 실패:", err);
//      }
//    };
//
//    runFullAuthFlow();
//  }, []);
//
//  return (
//    <div style={{ padding: "20px" }}>
//
//      <h2>JWT 없이 요청한 결과</h2>
//      {noJwtError ? (
//        <div style={{ color: "red", fontWeight: "bold" }}>에러: {noJwtError}</div>
//      ) : (
//        <div>요청 중...</div>
//      )}
//
//      <hr />
//
//      <h2>JWT 포함(apiClient) 요청 결과</h2>
//      {jwtImageUrl ? (
//        <img
//          src={jwtImageUrl}
//          alt="Book Cover"
//          style={{
//            width: "300px",
//            border: "1px solid #333",
//            borderRadius: "6px",
//            marginTop: "10px",
//          }}
//        />
//      ) : (
//        <div>이미지 요청 중…</div>
//      )}
//    </div>
//  );
//}
