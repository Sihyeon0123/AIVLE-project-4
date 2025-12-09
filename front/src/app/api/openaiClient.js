// app/api/openaiClient.js

// --------------------------------------------------------
// 🔹 사용자 API Key 조회 (JWT → 개인 API KEY)
// --------------------------------------------------------
export async function fetchUserApiKey() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return null;

    try {
        const res = await fetch("http://localhost:8080/api/auth/user-info", {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            console.error("API Key 조회 실패:", res.status);
            return null;
        }

        const apiKey = res.headers.get("API-KEY");

        if (!apiKey) {
            console.error("⚠️ 사용자 API KEY 없음");
            return null;
        }

        return apiKey;

    } catch (err) {
        console.error("API KEY 조회 오류:", err);
        return null;
    }
}


// --------------------------------------------------------
// 🔹 OpenAI 이미지 생성 (사용자 API Key로 직접 호출)
// --------------------------------------------------------
export async function generateCoverImage(postData) {
    const apiKey = await fetchUserApiKey();
    if (!apiKey) return null;

    const prompt =
        `제목: ${postData.title}\n설명: ${postData.description}\n` +
        `${postData.categoryName} 카테고리에 어울리는 책 표지 이미지를 생성.`;

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,  // ★ 사용자 개인 API KEY 사용!
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt,
                size: "1024x1792",
            }),
        });

        const result = await response.json();

        if (result.error) {
            console.error("OpenAI Error:", result.error);
            return null;
        }

        return result.data?.[0]?.url ?? null;

    } catch (err) {
        console.error("이미지 생성 오류:", err);
        return null;
    }
}
