'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  // 입력값 상태 관리
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 공백 / 공백문자만 입력한 경우 막기 (trim 사용)
    if (!id.trim() || !pw.trim()) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    console.log('서버로 보낼 데이터:', { id, pw });

    try {
      // 로그인 요청 (axios 사용)
      // - POST /api/auth/login
      // - body: { id, pw }
      const loginRes = await axios.post(
        'http://localhost:8080/api/auth/login',
        { id, pw },
        // { withCredentials: true } // 필요 시 refreshToken 쿠키 받으려면 주석 해제
      );

      console.log('서버 응답 전체:', loginRes);

      // 응답 바디(JSON)
      const result = loginRes.data;
      console.log('서버 응답 JSON:', result);

      // 1) 응답 헤더에서 accessToken 꺼내기 (권장 방식)
      let authHeader = loginRes.headers['authorization'];
      console.log('authorization 헤더 값:', authHeader);

      let accessToken = null;

      // "Bearer xxx.yyy.zzz" 형태일 때 토큰 문자열만 분리
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.replace('Bearer ', '');
      }

      // 2) 헤더에 없으면, 응답 바디(result.token)에 있는 토큰도 한 번 더 확인
      if (!accessToken && result.token) {
        console.log('바디의 result.token 사용:', result.token);
        accessToken = result.token;
      }

      // 로그인 성공 처리
      if (result.status === 'success') {
        alert('로그인 성공!');

        // accessToken 로컬 스토리지에 저장
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          console.log(
            '저장된 accessToken:',
            localStorage.getItem('accessToken')
          );
        } else {
          console.warn('accessToken이 없습니다. 헤더/바디 둘 다 확인 실패');
        }

        // userId 세션 스토리지에 저장
        //  - 응답에 userId가 있으면 그 값을 사용
        //  - 없으면 로그인할 때 입력한 id 사용
        if (result.userId) {
          sessionStorage.setItem('userId', result.userId);
        } else {
          sessionStorage.setItem('userId', id);
        }

        if (result.userName) {
          sessionStorage.setItem('userName', result.userName);
        }

        // name도 백엔드에서 보내주게 되면 아래처럼 저장 가능
        // if (result.name) {
        //   sessionStorage.setItem('userName', result.name);
        // }

        // 로그인 성공 후 메인 페이지로 이동
        window.location.href = '/';
      } else {
        // status가 success가 아닌 경우 (백엔드에서 커스텀 에러 보낸 경우)
        alert(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('요청 중 오류 발생:', error);

      // axios 에러 응답 처리 (HTTP 상태코드별 메시지)
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          alert(data?.message || '등록되지 않은 아이디입니다.');
        } else if (status === 401) {
          alert(data?.message || '비밀번호가 일치하지 않습니다.');
        } else {
          alert(data?.message || '로그인에 실패했습니다.');
        }
      } else {
        // 네트워크 오류, 서버 다운 등
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">로그인</h2>

        {/* 로그인 폼 */}
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
