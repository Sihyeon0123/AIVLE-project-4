'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';

import api from "../../api/apiClient";

// (컴포넌트) 책 정보
function BookEditView({ bookTitle, bookDescription, bookContent }) {
    return (
        <div>
        </div>
    );
}

// (컴포넌트) 확인/취소 버튼
function BookEditMenu( {onApply, onCancel} ) {
    return (
        <div className="row justify-content-center mt-4">
            <div className="col-auto">
                <button className="btn btn-primary me-2"
                        onClick={onApply}
                >확인</button>
                <button className="btn btn-danger"
                        onClick={onCancel}
                >취소</button>
            </div>
        </div>
    );
}

// (화면 본체)
export default function PostEdit(props){
    const router = useRouter();

    // slug (= bookId)
    const { slug } = useParams();

    // State: 도서 세부 데이터
    const [bookData, setBookData]=useState({
        ownerId:'',
        title:'',
        categoryId:-1,
        description:'',
        imageUrl:'',
        content:''
    });

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

    // (도서 정보 조회 처리)
    const getBookDetails = async(idx)=>{
        try {
            const response = await fetch(`http://localhost:8080/api/books/detail/${idx}`);
            const response_body = await response.json();
            //console.log(response_body.status);
            //console.log(response_body.message);
            //console.log(response_body.data);
            //
            // 아무 문제 없이 진행되었으면 도서 정보 입력
            if (response_body.status === 'success') {
                console.log(response_body);
                // 작성자 여부 확인 (로그인 여부도 같이 확인됨)
                const ownership = await checkCurrentUserIs(response_body.data.ownerUser);
                if (!ownership) {
                    alert("본인이 등록한 도서만 편집할 수 있습니다.");
                    return
                }
                setIsOwner(ownership);
                // 도서 정보 반영
                setBookData({
                    ownerId:response_body.data.ownerUser,
                    categoryId: response_body.data.categoryId,
                    title:response_body.data.title,
                    description:response_body.data.description,
                    imageUrl:response_body.data.imageUrl,
                    content:response_body.data.content
                });
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

    // 내용 변경 적용
    const applyBookEdit = async()=>{
        // ID 유효 여부 확인
        const userId = await getCurrentUserId();
        if (userId.length < 1) {
            return;
        }
        console.log(userId);
        if (userId !== bookData.ownerId) {
            alert("본인이 등록한 도서만 편집할 수 있습니다.");
            return;
        }
        //
        // 삭제 여부 확인
        const confirmed = window.confirm("정말 변경하시겠습니까?");
        if (!confirmed) return;
        //
        // accessToken 확인
        // - 작성자라고 판정된 시점에서 accessToken은 반드시 LocalStorage에 존재함
        const token = localStorage.getItem("accessToken");
        //
        // 변경 처리
        const payload ={
            categoryId: bookData.categoryId,
            title: bookData.title,
            description: bookData.description,
            imageUrl: bookData.imageUrl,
            content: bookData.content
        }
        console.log(payload);
        try {
            await api.put(`http://localhost:8080/api/books/update/${slug}`, payload);
            router.back();
        } catch (error) {
            console.error("변경 실패:", error);
            alert("편집 내용 적용 과정에서 오류가 발생했습니다.");
        }
    };

    const input=(e)=>{
        setBookData({...bookData, [e.target.name]:e.target.value});
    }

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
                <div>
                    <br/>
                    <div><b>제목: </b><input type="text" name="title" value={bookData.title} onChange={input}/></div>
                    <br/>
                    <div><b>설명: </b><input type="text" name="description" value={bookData.description} onChange={input}/></div>
                    <br/>
                    <div><b>(본문)</b></div>
                    <br/>
                    <div><textarea rows="3" name="content" value={bookData.content} onChange={input}/></div>
                </div>
                {isOwner && <BookEditMenu
                    onCancel={()=>{router.back();}}
                    onApply={applyBookEdit}
                />}
            </div>
        </div>
    );
}