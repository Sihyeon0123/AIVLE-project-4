package com.example.back.controller;

import java.io.File;

import com.example.back.DTO.ApiResponse;
import com.example.back.DTO.BookListResponse;
import com.example.back.service.BookService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RestController
@RequestMapping("/api/books") 
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;
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

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("도서 목록 조회 요청: page={}, size={}", page, size);

        try {
            // 서비스에서 BookListResponse 하나만 리턴하도록 구현해 둔 상태라고 가정
            BookListResponse data = bookService.getBooks(page - 1, size);

            log.info("도서 목록 조회 성공: page={}, totalPages={}", data.getPage(), data.getTotalPages());

            // 회원가입과 동일한 ApiResponse 사용 방식
            return ResponseEntity.ok(
                    new ApiResponse<>("success", "도서목록조회성공", data)
            );

        } catch (IllegalArgumentException e) {
            // 잘못된 페이지 번호 등 클라이언트 잘못
            log.warn("도서 목록 조회 실패 - 잘못된 요청: page={}, size={}, msg={}", page, size, e.getMessage());
            return ResponseEntity.status(400).body(
                    new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (Exception e) {
            // 서버 내부 오류
            log.error("도서 목록 조회 서버 오류: page={}, size={}, error={}", page, size, e.toString());
            return ResponseEntity.status(500).body(
                    new ApiResponse<>("error", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.", null)
            );
        }
    }

}
