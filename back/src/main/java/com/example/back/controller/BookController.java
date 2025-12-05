package com.example.back.controller;

import java.io.File;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RestController
@RequestMapping("/api/books") 
@RequiredArgsConstructor
public class BookController {
    private final String coverPath = "./uploads/bookcovers/";

    @GetMapping("/cover/{bookId}")
    @SuppressWarnings("null")
    public ResponseEntity<?> getBookCover(@PathVariable("bookId") Long bookId) {
        /**
         * 책 커버 이미지 반환 API
         * - 전달받은 bookId로 서버 로컬에 저장된 책 표지 이미지를 조회하여 반환합니다.
         * - 경로 규칙: {coverPath}/{bookId}.jpg
         *
         * @param bookId Long
         *   - URL Path Variable: 요청한 도서의 ID
         *
         * @return ResponseEntity<?>
         *   - 200: 이미지 파일 반환 (Content-Type: image/jpeg)
         *   - 404: 해당 bookId의 이미지 파일이 존재하지 않음
         */
        log.info("커버 이미지 요청: bookId={}", bookId);

        String filePath = coverPath + bookId + ".jpg";
        File file = new File(filePath);

        // 이미지 파일 존재 여부 확인
        if (!file.exists()) {
            log.warn("커버 이미지 파일 없음: path={}", filePath);

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                        java.util.Map.of(
                            "status", "error",
                            "message", "이미지를 찾을 수 없습니다."
                        )
                    );
        }

        // 파일이 존재할 때
        log.info("커버 이미지 파일 반환 준비 완료: path={}", filePath);

        Resource resource = new FileSystemResource(file);

        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
