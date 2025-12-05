"use client";

import React, { useState, useEffect } from "react";

function Page() {

    // 이미지 받아 올 곳
    const [imageUrl, setImageUrl] = useState("");

    // 실행 예시용
    const imageGenerate = () => {
        const randomId = Math.floor(Math.random() * 1000);
        const url = `https://picsum.photos/id/${randomId}/400/300`;
        setImageUrl(url);
        console.log("이미지 URL:", url);
    };

    // 이미지 설정
    const imgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    };

    // new_post_001에서 받은 데이터
    const [postData, setPostData] = useState({
        제목: "",
        설명: "",
        내용: "",
        카테고리: "",
    });

    // 페이지 로딩 시 localStorage에서 가져오기
    useEffect(() => {
        const data = localStorage.getItem("postData");
        if (data) {
            const parsedData = JSON.parse(data);
            setPostData(JSON.parse(data));
            console.log("localStorage에서 가져온 데이터:", parsedData);
        }
    }, []);

    // 첫 로딩 시 이미지 생성
    useEffect(() => {
        imageGenerate();
    }, []);

    const sendImage = () => {
        if (window.opener) {
            window.opener.postMessage({ imageUrl }, "*");
            window.close();
        }
    };


    const containerStyle = {
        maxWidth: '75%',
        width: '100%',
        minHeight: 'auto',
        margin: '0 auto',
        border: '1px solid black',
        padding: '10px',
        backgroundColor : 'gray'
    };

    // 미리보기 이미지 나오는 곳
    const previewImageStyle = {
        border : '1px solid black',
    };

    // 버튼 나누기
    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
    };

    // 버튼 모양
    const buttonStyle = {
        margin: '10px',
        border: '1px solid black',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: 'black',
        paddingLeft: '10px',
        paddingRight: '10px',
    };

    return (
        <div style={containerStyle}>

            {/*표지 넣을 곳*/}
            <div style = {previewImageStyle}>
                {imageUrl ? (
                <img
                    src={imageUrl}
                    style={imgStyle}/>) : ("표지 들어갈 곳")}
            </div>

            {/*버튼*/}
            <div style={buttonContainerStyle}>
                <button style={buttonStyle} onClick={imageGenerate}>
                    재생성
                </button>

                <button style={buttonStyle} onClick={sendImage}>
                    결정
                </button>
            </div>
        </div>
    )

}
export default Page;