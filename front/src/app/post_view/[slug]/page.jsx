'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';

import api from "../../api/apiClient";

// (컴포넌트) 책 정보
function BookDetailsView({ authorName, updatedAt, coverImgUrl, content }) {
    return (
        <div className="row justify-content-center">
            {/* 왼쪽: 이미지 */}
            <div className="col-12 col-md-6 text-center">
                <br/>
                {coverImgUrl && (
                    <img
                        src={coverImgUrl}
                        width={600}
                        className="img-fluid"
                        alt="cover"
                    />
                )}
            </div>
            {/* 오른쪽: 정보 */}
            <div className="col-12 col-md-9">
                <br/>
                <div><b>작성자: </b>{authorName}</div>
                <br/>
                <div><b>수정일: </b>{updatedAt}</div>
                <br/>
                <div><b>(본문)</b></div>
                <div
                    className="mt-2"
                    style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word"
                    }}
                >{content}</div>
            </div>
        </div>
    );
}

// (컴포넌트) 수정/삭제 버튼
function BookEditMenu({ onEdit, onDelete }) {
    return (
        <div className="row justify-content-center mt-4">
            <div className="col-auto">
                <button className="btn btn-primary me-2"
                    onClick={onEdit}
                >수정</button>
                <button className="btn btn-danger"
                    onClick={onDelete}
                >삭제</button>
            </div>
        </div>
    );
}

// // Mock Response (Success)
// function createMockResponseSuccessful(bookId) {
//     let dummyText = "TEST_BOOK_CONTENT"
//     for (let i=0; i < 5; i++) {
//         dummyText += dummyText;
//     }
//     return {
//         status: "success",
//         message: "도서상세조회성공",
//         data: {
//             bookID: bookId,
//             title: "TEST_BOOK_TITLE",
//             description: "",
//             content:dummyText,
//             categoryId: "",
//             imageUrl:"",
//             ownerUserId:"testuser",
//             createdAt:(new Date()).toString(),
//             updatedAt:(new Date()).toString()
//         }
//     }
// }

// // Mock Response (Not Found)
// function createMockResponseNotFound(bookId) {
//     return {
//         status: "error",
//         message: "도서를 찾을 수 없습니다"
//     }
// }

// (화면 본체)
export default function PostView(props){
    const router = useRouter();

    // slug (= bookId)
    const { slug } = useParams();

    // State: 도서 세부 데이터
    const [bookData, setBookData]=useState({
        owner_id:'',
        owner_nickname:'',
        updated_at:'',
        cover_img_url:'',
        content:''
    })

    // State: 작성자 여부
    const [isOwner, setIsOwner]=useState(false);

    // 현재 사용자의 ID 확인
    const getCurrentUserId = async()=>{
        // accessToken (없으면 false 판정)
        const token = localStorage.getItem("accessToken");
        if (!token) {
            return "";
        }
        // 현재 사용자 ID 확인해서 리턴
        const response = await api.get(`http://localhost:8080/api/auth/user-info`);
        return (response.status !== 200) ? "" : String(response.data.id);
    }

    // 현재 사용자의 ID가 입력된 ID와 일치하는지 확인
    const checkCurrentUserIs = async(id)=> {
        const currentUserId = await getCurrentUserId();
        if (currentUserId === String(id))
        {
            console.log("현재 사용자 ===", id);
            return true;
        } else {
            console.log("현재 사용자 !==", id);
            return false;
        }
    }

    // (도서 정보 조회)
    const getBookDetails = async(idx)=>{
        //// MEMO: 일단은 하드코딩해놓은 거 사용
        //let response = ((Math.random() < 1.0) ?
        //    createMockResponseSuccessful(idx) : createMockResponseNotFound(idx)
        //);
        //
        try {
            const response = await fetch(`http://localhost:8080/api/books/detail/${idx}`);
            const response_body = await response.json();
            //console.log(response_body.status);
            //console.log(response_body.message);
            //console.log(response_body.data);
            //
            // 아무 문제 없이 진행되었으면 도서 정보 입력
            if (response_body.status === 'success') {
                // TODO: 작성자 닉네임만 가져온다 (userNickname 확인해주는 API 필요)
                let owner_nickname = "";
                // 도서 정보 반영
                setBookData({
                    owner_id:response_body.data.ownerUser,
                    owner_nickname:owner_nickname,
                    updated_at:response_body.data.updatedAt,
                    cover_img_url:response_body.data.imageUrl,
                    content:response_body.data.content
                });
                // 작성자 여부 반영
                const ownership = await checkCurrentUserIs(response_body.data.ownerUser);
                setIsOwner(ownership);
            } else {
                // (책이 존재하지 않는 경우)
                alert("존재하지 않는 도서입니다.");
                router.back();
            }
        } catch {
            // (가져오는 과정에서 에러가 발생한 경우)
            alert("도서 정보를 가져올 수 없습니다.");
            router.back();
        }
    }

    // 도서 편집 화면으로 이동
    const editBook = async()=>{
        // 작성자 여부 확인 (로그인 여부도 같이 확인됨)
        const ownership = await checkCurrentUserIs(bookData.owner_id);
        if (!ownership) {
            alert("본인이 등록한 도서만 편집할 수 있습니다.");
            return;
        }
        // 이동 처리
        router.push(`/post_edit/${slug}`);
    }

    // 도서 삭제 처리
    const deleteBook = async()=>{
        // 작성자 여부 확인 (로그인 여부도 같이 확인됨)
        const ownership = await checkCurrentUserIs(bookData.owner_id);
        if (!ownership) {
            alert("본인이 등록한 도서만 삭제할 수 있습니다.");
            return;
        }
        // accessToken 가져오기
        // - 작성자라고 판정된 시점에서 accessToken은 반드시 LocalStorage에 존재함
        const token = localStorage.getItem("accessToken");
        // 삭제 여부 확인
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;
        // 삭제 처리
        try {
            await api.delete(`http://localhost:8080/api/books/delete/${slug}`);
            alert("삭제되었습니다.");
            router.back();
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 도서 정보 조회
    useEffect(() => {
        props.params.then(()=>{
            getBookDetails(slug);
        });
    },[]);

    // 사용자가 작성자 본인일 경우에는 편집 메뉴 추가
    return (
        <div className="container d-flex justify-content-center">
            <div className="w-100">
                <BookDetailsView
                    coverImgUrl={bookData.cover_img_url}
                    updatedAt={bookData.updated_at}
                    authorName={bookData.owner_id}
                    content={bookData.content}
                />
                {isOwner && <BookEditMenu onEdit={editBook} onDelete={deleteBook} />}
            </div>
        </div>
    );
}