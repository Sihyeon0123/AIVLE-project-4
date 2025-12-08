'use client';

import { useState } from 'react';
import { loginRequest } from './login';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { result, accessToken } = await loginRequest(id, pw);

      // 로그인 성공
      if (result.status === 'success') {
        alert(`로그인 성공!\n메시지: ${result.message || '성공'}\n코드: 200`);

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }

        window.location.href = '/';
        return;
      }

      // success가 아닌 경우
      alert(`로그인 실패\n메시지: ${result.message}\n코드: ???`);
    } catch (error) {
      console.error(error);

      // 서버 응답이 있는 경우 (401/404 등)
      if (error.response) {
        const { status, data } = error.response;

        alert(
          `로그인 실패\n메시지: ${data?.message || '오류 발생'}\n코드: ${status}`
        );
        return;
      }

      // 서버가 아예 응답을 못 준 경우 (네트워크 문제)
      alert(`서버와 통신 중 오류가 발생했습니다.\n메시지: ${error.message}`);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">로그인</h2>

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
