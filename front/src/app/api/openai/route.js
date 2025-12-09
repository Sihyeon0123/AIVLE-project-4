// app/api/openai/generate/route.js

import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { title, description, content, categoryName } = await req.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "서버에 저장된 OpenAI API 키가 없습니다." },
                { status: 500 }
            );
        }

        // 이미지 생성 Prompt 구성
        const prompt = `
        제목: ${title}
        설명: ${description}
        내용을 기반으로 '${categoryName}' 카테고리에 어울리는 단일 책 표지 이미지를 생성.
        깔끔한 하드커버 스타일, 여백 없음.
        `;

        // OpenAI 이미지 API 호출
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-image-1",
                prompt,
                size: "1024x1792",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI Error: ", data);
            return NextResponse.json({ error: data.error }, { status: 500 });
        }

        return NextResponse.json({
            imageUrl: data.data?.[0]?.url || null,
        });

    } catch (err) {
        console.error("서버 OpenAI 이미지 생성 중 오류:", err);
        return NextResponse.json(
            { error: "서버 오류: " + err.message },
            { status: 500 }
        );
    }
}
