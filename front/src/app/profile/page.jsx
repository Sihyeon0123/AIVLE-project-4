'use client';

import useMyInfo from './useMyInfo';

export default function MyInfoPage() {
  const {
    userId,
    userName,
    originalName,
    apiKey,
    pw,
    pwCheck,
    setUserName,
    setApiKey,
    setPw,
    setPwCheck,
    handleUpdate,
    handleDelete,
  } = useMyInfo();

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await handleUpdate();
    if (ok) alert('회원정보가 성공적으로 수정되었습니다.');
  };

  const onDelete = async () => {
    const ok = await handleDelete();
    if (ok) {
      alert('탈퇴되었습니다.');
      sessionStorage.clear();
      window.location.href = '/signup';
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">회원정보 수정</h2>

        <form className="form" onSubmit={onSubmit}>
          
          <label>
            아이디
            <input
              type="text"
              value={userId}
              readOnly
              style={{ backgroundColor: '#f3f3f3' }}
            />
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
            API Key
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>

          <label>
            변경할 PW
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

          <div className="btn-row--center">
            <button className="sub-btn" type="submit">수정하기</button>
            <button className="sub-btn" type="button" onClick={onDelete}>
              회원 탈퇴
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
