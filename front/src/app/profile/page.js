'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyInfoPage() {
  // 화면에 표시/입력되는 값들 상태 관리
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');
  const router = useRouter();

  // 처음 들어올 때 세션에 저장된 정보 가져오기 (로그인 시 세팅해둔 값)
  useEffect(() => {

    setUserId(id);
    setUserName(name);
    setOriginalName(name);
  }, []);

  // 회원정보 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    //   여기서는 accessToken이 sessionStorage에 저장되어 있다고 가정
    //   → 로그인 페이지에서도 sessionStorage.setItem('accessToken', ...)으로 맞추면 됨
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      router.push('/login');
      return;
    }

    if (!userId) {
      alert('아이디 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    // 공백 제거한 값들 (이름/비밀번호 입력 검사용)
    const trimmedName = userName.trim();
    const trimmedPw = pw.trim();
    const trimmedPwCheck = pwCheck.trim();

    // 이름/비밀번호 아무것도 안 적었을 때
    if (!trimmedName && !trimmedPw && !trimmedPwCheck) {
      alert('변경할 내용을 입력해주세요.');
      return;
    }

    // 비밀번호 변경을 시도하는 경우 (둘 중 하나라도 입력되어 있으면)
    if (trimmedPw || trimmedPwCheck) {
      // 둘 중 하나만 입력된 경우
      if (!trimmedPw || !trimmedPwCheck) {
        alert('비밀번호와 비밀번호 확인을 모두 입력해주세요.');
        return;
      }

      // 둘 다 입력됐지만 서로 다른 경우
      if (trimmedPw !== trimmedPwCheck) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    // 실제로 서버에 보낼 body 구성 (비어있는 값은 보내지 않기)
    const body = {};
    if (trimmedName) body.name = trimmedName; // 이름 변경 요청
    if (trimmedPw) body.pw = trimmedPw;       // 비밀번호 변경 요청

    // 혹시 모를 방어 코드 (위에서 한번 체크했지만 한 번 더)
    if (Object.keys(body).length === 0) {
      alert('변경할 내용을 입력해주세요.');
      return;
    }

    console.log('회원정보 수정 요청 데이터:', body);

    try {
      const res = await fetch('http://localhost:8080/api/auth/update', {
        method: 'PATCH', // 백엔드 @PatchMapping("/update")와 일치
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // 토큰 필수
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      console.log('회원정보 수정 응답:', result);

      if (res.ok && result.status === 'success') {
        alert('회원정보가 성공적으로 수정되었습니다.');

        // 이름이 바뀐 경우, 화면과 세션도 함께 갱신
        if (body.name) {
          setUserName(body.name);
          sessionStorage.setItem('userName', body.name);
        }

        // 비밀번호 입력칸은 항상 비워주기
        setPw('');
        setPwCheck('');
      } else {
        alert(result.message ?? '회원정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원정보 수정 요청 중 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  // 회원 탈퇴
  const handleDelete = async () => {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      router.push('/login');
      return;
    }

    // 비밀번호 공백 검사 (공백만 입력도 막기)
    const trimmedPw = pw.trim();
    if (!trimmedPw) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const ok = window.confirm(
      '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );
    if (!ok) return;

    try {
      const res = await fetch('http://localhost:8080/api/auth/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // 여기서도 필수
        },
        body: JSON.stringify({
          pw: trimmedPw, // DeleteRequest는 pw만 받음
        }),
      });

      const result = await res.json();
      console.log('회원 탈퇴 응답:', result);

      if (res.ok && result.status === 'success') {
        alert(result.message || '회원 탈퇴가 완료되었습니다.');

        // 모든 세션 정보 제거 후 회원가입 페이지로 이동
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

        {/* 회원정보 수정 폼 */}
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
            {originalName && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#999',
                }}
              >
                현재 등록된 이름: {originalName}
              </div>
            )}
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
