"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    // CORS 테스트용 fetch
    fetch("http://localhost:8080/api/books/cover/0", {
      method: "GET"
    })
      .then((res) => {
        console.log("Response:", res);
        if (!res.ok) throw new Error("CORS blocked or server error");
        return res.blob();
      })
      .then((blob) => {
        setImgUrl(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.error("CORS Test Error:", err);
      });
  }, []);

  return (
    <div>
      <h2>CORS Test</h2>
      {imgUrl ? (
        <img src={imgUrl} alt="Book Cover" />
      ) : (
        <p>Loading or CORS blocked...</p>
      )}
    </div>
  );
}
