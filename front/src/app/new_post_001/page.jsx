"use client";

import React, { useState, useEffect } from 'react';

function Page() {

    // ======================= State 저장 공간 ========================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategory] = useState("");
    const [imageUrl , setPreviewImageUrl] = useState("");

    const handleSubmit = async () => {
        // 유효성 검사
        if (!title || !description || !content || !categoryId) {
            alert("제목, 설명, 내용, 카테고리를 모두 입력해 주세요.");
            return;
        }

        const postData = {
            title,
            description,
            content,
            categoryId,
        };
        console.log("이미지 생성을 위해 데이터 임시 저장:", postData);

        // 데이터를 localStorage에 저장
        localStorage.setItem("temp_post_data", JSON.stringify(postData));

        // 새 창 열기
        window.open("/new_post_002", "_blank");
    }

    // ======================= 게시물 게시 ========================

    const finalCheck = async () => {
        if (!title || !description || !content || !categoryId || !imageUrl) {
            alert("제목, 설명, 내용, 카테고리, 이미지 중 비어있는 곳이 존재합니다.");
            return;
        }

        const jwt = localStorage.getItem("accessToken");
        if (!jwt) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 최종 데이터 구성
        const finalPostData = {
            title,
            description,
            content,
            categoryId: Number(categoryId),
            imageUrl
        };

        console.log("최종 전송 데이터:", finalPostData);

        // 백엔드에 최종 저장 요청
        try {
            const response = await fetch('http://localhost:8080/api/books/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                },
                body: JSON.stringify(finalPostData),
            });

            if (response.ok) {
                alert("게시물이 성공적으로 등록되었습니다!");
                window.location.href = "/";
                // 최종 성공 시 임시 데이터 삭제
                localStorage.removeItem("temp_post_data");
            } else {
                console.error("게시물 등록 실패:", response.status, response.statusText);
                alert(`게시물 등록 실패: ${response.statusText}`);
            }
        } catch (error) {
            console.error("최종 등록 오류:", error);
            alert("서버 연결에 실패하여 게시물을 등록할 수 없습니다.");
        }
    };

    useEffect(() => {
        const handleMessage = (event) => {

            if (event.data && event.data.imageUrl) {
                console.log("받은 이미지 URL:", event.data.imageUrl);
                setPreviewImageUrl(event.data.imageUrl);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);


    // ======================= Style 저장 공간 ========================

    const containerStyle = {
        maxWidth: '100%',
        width: '80%',
        minHeight: 'auto',
        margin: '0 auto',
        border: '1px solid black',
        padding: '10px',
        backgroundColor : 'gray',
    };

    const titleInputStyle = {
        width: '100%',
        fontSize: '20px',
        marginTop: '10px',
        border: 'none',
        backgroundColor : 'white',
        color : 'black',
        borderRadius: '8px',
    }

    const mainContentStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop : '20px',
        gap : '10px',
    };

    // 왼쪽 미리보기 이미지 라인 스타일
    const previewImageStyle = {
        display: 'flex',
        flex: '0 0 30%',
        flexDirection: 'column',
        gap: '15px',
    };

    // 생성된 이미지 나오는곳 스타일
    const imageAreaStyle = {
        height: '90%',
        width: '100%',
        border: '1px solid black',
        backgroundColor : 'white',
    };

    // 오른쪽 작품 설명 ~ 버튼까지 스타일
    const TextContentAreaStyle = {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '10px',
        gap: '10px',
    };

    // 작품설명, 내용 텍스트 창 스타일
    const textInputStyle = {
        backgroundColor: 'white',
        minHeight: '200px',
        maxHeight: '200px',
        borderRadius: '8px',
    }

    // 버튼 정렬
    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
    };

    // 버튼 스타일
    const buttonStyle = {
        margin: '10px',
        border: '1px solid black',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: 'black',
        paddingLeft: '5px',
        paddingRight: '5px',
    };

    // 입력창 위 설명창
    const textStyle = {
        backgroundColor: 'black',
        display: 'inline-block',
        marginTop: '10px',
        borderRadius: '8px',
        paddingLeft: '5px',
        paddingRight: '5px',
        textAlign: 'center',
        color: 'white',
    }


    // =======================구==분==선===============================

    return (
        <div style={containerStyle}>

            {/*제목 입력칸*/}
            <div>
                <div style = {textStyle}>제목</div>
                <input
                    type = 'text'
                    placeholder= '제목을 입력해 주세요.'
                    style = {titleInputStyle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/*이미지 ~ 버튼 칸*/}
            <div style = {mainContentStyle}>

                <div style = {previewImageStyle}>
                    <div style={imageAreaStyle}>
                        {imageUrl ? (
                            <img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                            ""
                        )}
                    </div>
                </div>

                <div style = {TextContentAreaStyle}>
                    {/*작품 설명*/}
                    <div style = {textStyle}>작품 설명</div>
                    <textarea
                        placeholder = "작품 설명을 입력해 주세요."
                        style = {textInputStyle}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/*작품 내용*/}
                    <div style = {textStyle}>작품 내용</div>
                    <textarea
                        placeholder = "작품 내용을 입력해 주세요."
                        style = {textInputStyle}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* 카테고리 */}
                    <div style = {textStyle}>카테고리</div>
                    <select
                        style = {{backgroundColor: 'white'}}
                        value={categoryId}
                        onChange={(e) => setCategory(e.target.value)}>

                        <option value="">카테고리 선택</option>
                        <option value="1">문학</option>
                        <option value="2">인문</option>
                        <option value="3">예술</option>
                        <option value="4">어학</option>
                        <option value="5">실용서</option>

                    </select>

                    {/* 버튼 */}
                    <div style={buttonContainerStyle}>
                        <button style={buttonStyle} onClick={handleSubmit}>
                            이미지 생성
                        </button>

                        <button style={buttonStyle} onClick={finalCheck}>
                            게시물 등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;