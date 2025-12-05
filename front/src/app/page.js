import Image from "next/image";

export default function Home() {
  return (
    <div>
      <img
        src="http://localhost:8080/api/books/cover/0"
        alt="Book Cover"
        className="d-inline-block align-top me-2"
      />
    </div>
  );
}
