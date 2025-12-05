'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyInfoPage() {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');
  const router = useRouter();

  // 처음 들어올 때 세션에 저장된 정보 가져오기
  useEffect(() => {
    const id = sessionStorage.getItem('userId') || '';
    const name = sessionStorage.getItem('userName') || '';

    setUserId(id);
    setUserName(name);
  }, []);

  // 회원정보 수정 (⚠️ 백엔드에 /api/auth/update 아직 없음)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('아이디 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    if (pw !== pwCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const body = {
      id: userId,
      pw: pw,
      name: userName,
    };

    console.log('회원정보 수정 요청 데이터:', body);

    try {
      const res = await fetch('http://localhost:8080/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 토큰 헤더로 보낼지 여부는 백엔드 설계에 따라 추가
          // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('서버 오류');
      }

      const result = await res.json();
      console.log('회원정보 수정 응답:', result);

      if (result.status === 'success') {
        alert('회원정보가 성공적으로 수정되었습니다.');

        // 이름이 바뀌었으면 세션도 갱신
        sessionStorage.setItem('userName', userName);
      } else {
        alert(result.message ?? '회원정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원정보 수정 요청 중 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ 컨트롤러가 Authorization 헤더에서 토큰을 읽음
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log('로그아웃 응답:', result);

      if (res.ok && result.status === 'success') {
        alert(result.message || '로그아웃 되었습니다.');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');

        router.push('/login');
      } else {
        alert(result.message ?? '로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 요청 중 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  // 회원 탈퇴
  const handleDelete = async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      router.push('/login');
      return;
    }

    if (!pw) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const ok = window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;

    try {
      const res = await fetch('http://localhost:8080/api/auth/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ 여기서도 Authorization 헤더 필수
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // ✅ DeleteRequest는 pw만 받음
          pw,
        }),
      });

      const result = await res.json();
      console.log('회원 탈퇴 응답:', result);

      if (res.ok && result.status === 'success') {
        alert(result.message || '회원 탈퇴가 완료되었습니다.');

        sessionStorage.clear();
        router.push('/signup');
      } else {
        alert(result.message ?? '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 탈퇴 요청 중 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">회원정보 수정</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            아이디
            <div
              style={{
                marginTop: '6px',
                fontWeight: '600',
              }}
            >
              {userId || '-'}
            </div>
          </label>

          <label>
            이름
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
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

          <div className="btn-row--right">
            <button className="sub-btn" type="submit">
              수정하기
            </button>

            <button
              className="sub-btn"
              type="button"
              onClick={handleDelete}
            >
              회원 탈퇴
            </button>


          </div>
        </form>
      </div>
    </div>
  );
}
