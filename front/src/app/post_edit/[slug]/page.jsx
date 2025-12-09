"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";

function Page() {

    const { slug } = useParams();   // ← /edit/123 이런 주소라면 123 가져오는 곳

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategory] = useState("");
    const [imageUrl , setPreviewImageUrl] = useState("");

    const [categories, setCategories] = useState([]);

    // ===================== 카테고리 불러오기 ======================
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/categories");
                const json = await res.json();

                if (Array.isArray(json.data)) {
                    setCategories(json.data);
                }
            } catch (err) {
                console.error("카테고리 불러오기 실패:", err);
            }
        };

        loadCategories();
    }, []);

    // ===================== 기존 게시물 데이터 불러오기 ======================
    useEffect(() => {
        if (!slug) return;

        const loadPostData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/books/detail/${slug}`);
                const json = await res.json();

                if (json.status === "success") {
                    const d = json.data;

                    // 저장된 값을 넣어주기
                    setTitle(d.title);
                    setDescription(d.description);
                    setContent(d.content);
                    setCategory(d.categoryId);
                    setPreviewImageUrl(d.imageUrl);
                } else {
                    alert("게시글을 불러오지 못했습니다.");
                }
            } catch (err) {
                console.error("게시글 조회 실패:", err);
                alert("서버 오류로 게시글을 불러올 수 없습니다.");
            }
        };

        loadPostData();
    }, [slug]);


    // ========================== 이미지 생성 ==========================
    const handleSubmit = async () => {
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

        localStorage.setItem("temp_post_data", JSON.stringify(postData));

        window.open("/new_post_002", "_blank");
    };

    // ========================== 최종 게시 ==========================
    const finalCheck = async () => {
        if (!title || !description || !content || !categoryId || !imageUrl) {
            alert("모든 값을 입력해 주세요!");
            return;
        }

        const jwt = localStorage.getItem("accessToken");
        if (!jwt) {
            alert("로그인이 필요합니다.");
            return;
        }

        const finalPostData = {
            title,
            description,
            content,
            categoryId: Number(categoryId),
            imageUrl
        };

        try {
            const response = await fetch(`http://localhost:8080/api/books/update/${slug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                },
                body: JSON.stringify(finalPostData),
            });

            if (response.ok) {
                alert("게시물이 성공적으로 수정되었습니다!");
                window.location.href = "/";
            } else {
                alert(`수정 실패: ${response.statusText}`);
            }
        } catch (error) {
            alert("서버 연결 실패");
        }
    };

    // ========================== 이미지 전달 ==========================
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.imageUrl) {
                setPreviewImageUrl(event.data.imageUrl);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // ========================== UI 스타일 ==========================
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
    };

    const mainContentStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop : '20px',
        gap : '10px',
    };

    const previewImageStyle = {
        flex: '0 0 30%',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    };

    const imageAreaStyle = {
        height: '90%',
        width: '100%',
        border: '1px solid black',
        backgroundColor : 'white',
    };

    const TextContentAreaStyle = {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '10px',
        gap: '10px',
    };

    const textInputStyle = {
        backgroundColor: 'white',
        minHeight: '200px',
        maxHeight: '200px',
        borderRadius: '8px',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
    };

    const buttonStyle = {
        margin: '10px',
        border: '1px solid black',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: 'black',
        paddingLeft: '5px',
        paddingRight: '5px',
    };

    const textStyle = {
        backgroundColor: 'black',
        display: 'inline-block',
        marginTop: '10px',
        borderRadius: '8px',
        paddingLeft: '5px',
        paddingRight: '5px',
        textAlign: 'center',
        color: 'white',
    };


    return (
        <div style={containerStyle}>

            <div>
                <div style={textStyle}>제목</div>
                <input
                    type='text'
                    placeholder='제목을 입력해 주세요.'
                    style={titleInputStyle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div style={mainContentStyle}>

                <div style={previewImageStyle}>
                    <div style={imageAreaStyle}>
                        {imageUrl && (
                            <img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        )}
                    </div>
                </div>

                <div style={TextContentAreaStyle}>

                    <div style={textStyle}>작품 설명</div>
                    <textarea
                        placeholder="작품 설명을 입력해 주세요."
                        style={textInputStyle}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div style={textStyle}>작품 내용</div>
                    <textarea
                        placeholder="작품 내용을 입력해 주세요."
                        style={textInputStyle}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div style={textStyle}>카테고리</div>
                    <select
                        style={{ backgroundColor: 'white' }}
                        value={categoryId}
                        onChange={(e) => setCategory(Number(e.target.value))}
                    >
                        <option value="">카테고리 선택</option>

                        {categories.map((cat) => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div style={buttonContainerStyle}>
                        <button style={buttonStyle} onClick={handleSubmit}>
                            이미지 생성
                        </button>

                        <button style={buttonStyle} onClick={finalCheck}>
                            게시물 수정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
