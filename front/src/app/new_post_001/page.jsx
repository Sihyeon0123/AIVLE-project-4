"use client";

import React, { useState, useEffect } from 'react';

function Page() {

    // ======================= State 저장 공간 ========================

    const [제목, setTitle] = useState("");
    const [설명, setDescription] = useState("");
    const [내용, setContent] = useState("");
    const [카테고리, setCategory] = useState("");
    const [생성표지 , setPreviewImageUrl] = useState("");

    const handleSubmit = () => {
        const postData = {
            제목,
            설명,
            내용,
            카테고리
        };
        localStorage.setItem("postData", JSON.stringify(postData));
        console.log(postData);
        window.open("/new_post_002", "_blank");
    }

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

    const finalCheck = {

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
                    value={제목}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/*이미지 ~ 버튼 칸*/}
            <div style = {mainContentStyle}>

                <div style = {previewImageStyle}>
                    <div style={imageAreaStyle}>
                        {생성표지 ? (
                            <img src={생성표지} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                        value={설명}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/*작품 내용*/}
                    <div style = {textStyle}>작품 내용</div>
                    <textarea
                        placeholder = "작품 내용을 입력해 주세요."
                        style = {textInputStyle}
                        value={내용}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* 카테고리 */}
                    <div style = {textStyle}>카테고리</div>
                    <select
                        style = {{backgroundColor: 'white'}}
                        value={카테고리}
                        onChange={(e) => setCategory(e.target.value)}>

                        <option value="">카테고리 선택</option>
                        <option value="literature">문학</option>
                        <option value="humanities">인문</option>
                        <option value="art">예술</option>
                        <option value="study">어학</option>
                        <option value="recipe">실용서</option>

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