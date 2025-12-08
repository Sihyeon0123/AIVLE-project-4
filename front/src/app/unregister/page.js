'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api/apiClient';
import Toast from '@/app/components/Toast';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function UnregisterPage() {
  const [pw, setPw] = useState('');
  const router = useRouter();

  // Toast 상태
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('danger');
  const [showToast, setShowToast] = useState(false);

  // Confirm 상태
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmResolver, setConfirmResolver] = useState(null);

  // Toast 출력 함수
  const showToastBox = (msg, type = 'danger') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Promise 기반 confirm 모달
  const showConfirmModal = () => {
    return new Promise((resolve) => {
      setShowConfirm(true);
      setConfirmResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    if (confirmResolver) confirmResolver(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    if (confirmResolver) confirmResolver(false);
  };

  // 페이지 접근 시 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.setItem('redirectToast', '로그인이 필요한 페이지입니다.');
      router.replace('/');
    }
  }, [router]);

  // 회원탈퇴 처리
  const handleUnregister = async (e) => {
    e.preventDefault();

    const trimmedPw = pw.trim();
    if (!trimmedPw) {
      showToastBox('⚠️ 비밀번호를 입력해주세요.');
      return;
    }

    // Confirm 모달 실행
    const ok = await showConfirmModal();
    if (!ok) return;

    try {
      const res = await api.post('/auth/delete', { pw: trimmedPw });

      if (res.data.status === 'success') {
        localStorage.setItem('redirectToast', '회원탈퇴가 완료되었습니다.');

        localStorage.clear();
        sessionStorage.clear();

        router.push('/');
        return;
      }

      showToastBox(res.data.message ?? '회원탈퇴 실패');

    } catch (error) {
      console.error(error);
      showToastBox('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page">

      {/* Toast UI */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        <Toast show={showToast} type={toastType} message={toastMsg} />
      </div>

      {/* Confirm 모달 UI */}
      <ConfirmModal
        show={showConfirm}
        title="⚠️ 회원탈퇴 확인"
        message="정말로 회원탈퇴 하시겠습니까? 되돌릴 수 없습니다."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

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
            style={{
              marginTop: '20px',
              width: '100%',
              color: 'white',
              backgroundColor: 'red'
            }}
          >
            회원탈퇴
          </button>
        </form>
      </div>
    </div>
  );
}
