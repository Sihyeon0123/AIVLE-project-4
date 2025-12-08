'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api/apiClient';

export default function UnregisterPage() {
  const [pw, setPw] = useState('');
  const router = useRouter();

  const handleUnregister = async (e) => {
    e.preventDefault();

    const trimmedPw = pw.trim();

    if (!trimmedPw) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const ok = window.confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;

    try {
      const res = await api.post('/auth/delete', { pw: trimmedPw });

      if (res.data.status === 'success') {
        alert('회원탈퇴가 완료되었습니다.');

        // 세션 및 로컬 스토리지 초기화
        sessionStorage.clear();
        localStorage.clear();

        router.push('/');
        return;
      }

      alert(res.data.message ?? '회원탈퇴 실패');

    } catch (error) {
      console.error('회원탈퇴 요청 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="card-title" style={{ color: 'red' }}>회원탈퇴</h1>

        <form className="form" onSubmit={handleUnregister}>
          <label>
            비밀번호 입력
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </label>

          <button
            type="submit"
            className="sub-btn"
            style={{ marginTop: '20px', width: '100%', color: 'white', backgroundColor: 'red' }}
          >
            회원탈퇴
          </button>
        </form>
      </div>
    </div>
  );
}
