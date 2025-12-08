"use client";

import { useEffect, useState } from "react";
import Toast from "./Toast";

export default function ToastContainer() {
  // 초기 렌더 전에 sessionStorage를 먼저 읽는다
  const initialToast = (() => {
    if (typeof window === "undefined") return { show: false };

    const saved = sessionStorage.getItem("toast");
    if (saved) {
      const { msg, type } = JSON.parse(saved);
      // 저장된 값, useEffect 보다 먼저 읽힘
      return { show: true, type, message: msg };
    }
    return { show: false };
  })();

  const [toast, setToast] = useState(initialToast);

  // sessionStorage에 있던 toast는 사용 후 바로 제거 (딱 1번)
  useEffect(() => {
    if (toast.show) {
      sessionStorage.removeItem("toast");

      // 3초 후 닫기
      setTimeout(() => {
        setToast({ show: false });
      }, 3000);
    }
  }, []);

  // ============================================
  // 이벤트 기반 토스트(show-toast)
  // ============================================
  useEffect(() => {
    const eventHandler = (e) => {
      const { msg, type } = e.detail;
      setToast({ show: true, type, message: msg });

      setTimeout(() => {
        setToast({ show: false });
      }, 3000);
    };

    window.addEventListener("show-toast", eventHandler);

    return () => window.removeEventListener("show-toast", eventHandler);
  }, []);

  return (
    <Toast
      show={toast.show}
      type={toast.type}
      message={toast.message}
    />
  );
}
