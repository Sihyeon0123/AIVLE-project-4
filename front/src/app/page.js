"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      try {
        // 도서 목록 전체(최대 100개) 불러오기
        const res = await fetch(
          "http://localhost:8080/api/books?page=1&size=100"
        );
        const json = await res.json();

        // 백엔드에서 data.books 리스트가 옴
        const allBooks = json.data?.books ?? [];

        // 전체 중 랜덤으로 섞어서 앞의 N개만 사용 (여기서는 4개)
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5);
        setBooks(shuffled.slice(0, 4)); // 원하는 개수로 바꿔도 됨
      } catch (err) {
        console.error("도서 목록 불러오기 실패:", err);
      }
    }

    fetchBooks();
  }, []);

  return (
    <main className="home">
      <section className="home-main">
        <div className="home-books-grid">
          {books.map((book) => (
            <div key={book.bookId} className="book-card">
              <img
                // 책 표지 이미지: 백엔드 커버 API 사용
                src={`http://localhost:8080/api/books/cover/${book.bookId}`}
                alt={book.title}
                className="book-card-image"
              />
            </div>
          ))}

          {/* 책이 아직 안 왔을 때 */}
          {books.length === 0 && <div>책 표지를 불러오는 중입니다...</div>}
        </div>
      </section>
    </main>
  );
}