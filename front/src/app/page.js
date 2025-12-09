"use client";

import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";   // MUI Pagination 추가
import "./css/books.css";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // 페이지 상태
  const [page, setPage] = useState(1);
  const size = 28; // 한 페이지 개수

  // API 호출 함수
  async function fetchBooks(currentPage) {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/books?page=${currentPage}&size=${size}`
      );

      if (!res.ok) throw new Error("도서 목록 요청 실패");

      const json = await res.json();
      const list = json.data?.books ?? [];

      setBooks(list);
      setTotalItems(json.data?.totalItems ?? 0);
    } catch (err) {
      console.error("도서 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  // page 변경될 때마다 API 다시 호출
  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / size);

  return (
    <main className="container py-5 home-container">

      {/* 헤더 */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h2 className="section-title m-0">📚 도서 목록</h2>

          <div className="flex justify-end items-center gap-3">
              <button
                  className="badge rounded-pill text-bg-light border books-count-badge"
                  onClick={() => window.location.href = "/new_post_001"}>
                  책 추가
              </button>

              <span className="badge rounded-pill text-bg-light border books-count-badge">
                {loading ? "불러오는 중..." : `총 ${totalItems}권`}
              </span>
          </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-secondary">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>불러오는 중...</span>
        </div>
      )}

      {/* 빈 화면 */}
      {!loading && books.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">표시할 도서가 없습니다.</div>
          <div className="empty-desc">잠시 후 다시 시도해 주세요.</div>
        </div>
      )}

      {/* 도서 목록 */}
      {!loading && books.length > 0 && (
        <div className="row g-4">
          {books.map((book) => (
            <div
              key={book.bookId}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                className="book-card border- shadow-sm"
                role="button"
                onClick={() => (window.location.href = `/post_view/${book.bookId}`)}
              >
                {/* 이미지 */}
                <div className="book-thumb">
                  <img
                    src={book.imageUrl}
                    alt={book.title || "제목 없음"}
                    className="book-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add("thumb-fallback");
                    }}
                  />
                </div>

                {/* 제목 영역 */}
                <div className="card-body py-2">
                  <h5 className="card-title book-title mb-0">
                    {book.title || "제목 없음"}
                  </h5>
                </div>

                {/* 푸터 */}
                <div className="card-footer bg-transparent border-0 pt-0 pb-2">
                  <span className="read-more">자세히 보기 →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MUI 페이지네이션 */}
      {!loading && totalItems > 0 && (
        <div className="pagination-container d-flex justify-content-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="large"   // ← 크기 키우기
          />
        </div>
      )}
    </main>
  );
}
