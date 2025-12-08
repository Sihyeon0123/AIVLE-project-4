'use client';

import { useState, useEffect } from 'react';
import { loginRequest } from './login';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  // Bootstrap Alert 상태
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success'); // success | danger
  const [showAlert, setShowAlert] = useState(false);

  // 회원가입 성공 메시지(sessionStorage) 읽기
  useEffect(() => {
    const msg = sessionStorage.getItem('signupSuccessMsg');
    if (msg) {
      setAlertMsg(msg);
      setAlertType('success'); // 초록색 박스
      setShowAlert(true);

      sessionStorage.removeItem('signupSuccessMsg');

      setTimeout(() => setShowAlert(false), 3000);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { result, accessToken } = await loginRequest(id, pw);

      // 로그인 성공 → Alert 없이 바로 리다이렉트
      if (result.status === 'success') {
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }

        window.location.href = '/';
        return;
      }

      // 로그인 실패 → 붉은 Alert 표시
      setAlertMsg(result.message || '로그인 실패');
      setAlertType('danger');
      setShowAlert(true);

    } catch (error) {
      console.error(error);

      // 서버 응답이 있는 경우
      if (error.response) {
        const { status, data } = error.response;

        setAlertMsg(data?.message || `오류 발생 (코드: ${status})`);
        setAlertType('danger');
        setShowAlert(true);
        return;
      }

      // 네트워크 오류
      setAlertMsg('서버와 통신 중 오류가 발생했습니다.');
      setAlertType('danger');
      setShowAlert(true);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">로그인</h2>

        {/* 회원가입 성공 & 로그인 실패 메시지 출력 */}
        {showAlert && (
          <div className={`alert alert-${alertType}`} role="alert">
            {alertMsg}
          </div>
        )}

        <form className="form" onSubmit={handleLogin}>
          <label>
            ID
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </label>

          <label>
            PW
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>

          <div className="btn-row--center">
            <button className="sub-btn" type="submit">
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
