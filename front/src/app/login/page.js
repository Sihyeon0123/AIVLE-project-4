'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log('서버로 보낼 데이터:', { id, pw });

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, pw }),
      });

      // 무조건 먼저 JSON 파싱
      const result = await res.json();
      console.log('서버 응답:', result);

      // HTTP 상태코드 + result.status 둘 다 활용해서 분기
      if (res.ok && result.status === 'success') {
        alert('로그인 성공!');

        // JWT 토큰 저장
        if (result.token) {
          sessionStorage.setItem('token', result.token);
        }

        // 아이디 저장
        if (result.userId) {
          sessionStorage.setItem('userId', result.userId);
        } else {
          sessionStorage.setItem('userId', id);
        }

        // 이름
        if (result.name) {
          sessionStorage.setItem('userName', result.name);
        }

        // 메인 페이지로 이동 (원하면 /myinfo로 유지해도 OK)
        router.push('/');

      } else {
        // 여기서 오류 케이스 처리

        // 1) 상태코드로 구분
        if (res.status === 404) {
          alert(result.message || '등록되지 않은 아이디입니다.');
        } else if (res.status === 401) {
          alert(result.message || '비밀번호가 일치하지 않습니다.');
        } else {
          // 그 외는 백엔드 메시지 우선 사용
          alert(result.message || '로그인에 실패했습니다.');
        }
      }

    } catch (error) {
      console.error('요청 중 오류 발생:', error);
      // 실제 통신 자체가 안 될 때만 여기로 옴 (서버 꺼짐, CORS 등)
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">로그인</h2>

        <form className="form" onSubmit={handleLogin}>
          <label>
            아이디
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
