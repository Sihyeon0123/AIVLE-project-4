'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState(''); 

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    const trimmedId = id.trim();
    const trimmedName = name.trim();
    const trimmedApiKey = apiKey.trim();

    // 필수값 검사
    if (!trimmedId || !pw.trim() || !trimmedName) {
      alert('아이디, 비밀번호, 이름을 모두 입력해주세요.');
      return;
    }

    // 비밀번호 확인 검사
    if (pw !== pwCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // API KEY 유무에 따라 동적으로 헤더 구성
      const headers = {
        'Content-Type': 'application/json',
      };

      if (trimmedApiKey) {
        headers['API-KEY'] = trimmedApiKey;
      }

      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: trimmedId,
          pw,
          name: trimmedName,
        }),
      });

      const result = await res.json();
      console.log('회원가입 서버 응답:', result);

      if (res.ok && result.status === 'success') {
        alert(result.message || '회원가입 성공! 이제 로그인 해주세요.');
        router.push('/login');
        return;
      }

      alert(result.message || '회원가입 실패');
    } catch (error) {
      console.error('회원가입 요청 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="card-title">회원가입</h1>

        <form className="form" onSubmit={handleSignup}>
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

          <label>
            PW 확인
            <input
              type="password"
              value={pwCheck}
              onChange={(e) => setPwCheck(e.target.value)}
            />
          </label>

          <label>
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            API Key (선택)
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key를 입력하세요."
            />
          </label>

          <button
            type="submit"
            className="sub-btn"
            style={{ marginTop: '20px', width: '100%' }}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
