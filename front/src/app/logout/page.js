'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../api/apiClient'; // ← apiClient 가져오기

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        // 1) 백엔드 로그아웃 API 요청
        // - apiClient는 자동으로 accessToken을 붙임
        await api.post('/auth/logout');

      } catch (err) {
        console.error('로그아웃 요청 중 오류:', err);

      } finally {
        // 2) localStorage, sessionStorage 정리
        localStorage.removeItem('accessToken');
        
        // 3) 강제 새로고침(쿠키 초기화 + Navbar 갱신용)
        window.location.href = '/';
      }
    };

    doLogout();
  }, [router]);

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">로그아웃 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
