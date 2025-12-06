package com.example.back.controller;

import java.io.File;

import com.example.back.DTO.*;
import com.example.back.jwt.JwtUtil;
import com.example.back.service.BookService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final JwtUtil jwtUtil;

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
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        /**
         * 도서 목록 조회 API (GET)
         * - {page}를 기준으로 도서 목록을 조회합니다.
         *
         * @param page Long
         *     - page: default 1
         *     - size: defalt = 10 (값 고정.)
         *
         * @return ResponseEntity<ApiResponse<?>>
         *     - 200: 도서 목록 반환
         *     - 400: 잘못된 요청
         *     - 500: 서버 오류
         */
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

    // TODO: 도서 상세 정보 조회 (GET)


    @PostMapping
    public ResponseEntity<ApiResponse<?>> createBook(
            @RequestAttribute("userId") String userId,
            @RequestBody BookCreateRequest req
    ) {
        /**
         * 도서 등록 API (POST)
         *
         * <동작 개요>
         * - JWT 필터에서 검증된 userId(@RequestAttribute)와 요청 본문(BookCreateRequest)을 전달받아
         *   도서 등록 서비스(createBook)를 호출하고, 결과를 공통 응답 포맷(ApiResponse)으로 감싸서 반환한다.
         *
         * 요청 정보
         * - @RequestAttribute("userId") String userId
         *   : JwtAuthFilter에서 토큰을 검증한 뒤 request.setAttribute("userId", ...)로 설정한 인증 사용자 ID
         * - @RequestBody BookCreateRequest req
         *   : 클라이언트가 전송한 도서 등록 데이터 (title, description, content, categoryId)
         *
         * 응답 형식 (ResponseEntity<ApiResponse<?>>)
         * - 201: 등록 성공
         * - 400 필수 값 누락, 유효하지 않은 내용 등으로 IllegalArgumentException 발생 시 (잘못된 요청 데이터)
         * - 401 사용자 미존재, 카테고리 미존재 등 RuntimeException 발생 시 (인증/조회 관련 문제)
         * - 500: 위에서 처리하지 못한 예외가 발생한 경우 (서버 내부 오류)
         */
        log.info("도서 등록 요청: userId={}, title={}", userId, req.getTitle());

        try {
            BookCreateResponse data = bookService.createBook(userId, req);

            log.info("도서 등록 성공: bookId={}", data.getBookId());

            return ResponseEntity.status(201).body(
                    new ApiResponse<>("success", "도서등록완료", data)
            );

        } catch (IllegalArgumentException e) {
            log.warn("도서 등록 실패 - 잘못된 요청: userId={}, msg={}", userId, e.getMessage());
            return ResponseEntity.status(400).body(
                    new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (RuntimeException e) {
            // 사용자 없음, 카테고리 없음 등
            log.warn("도서 등록 실패 - 인증/조회 문제: userId={}, msg={}", userId, e.getMessage());
            return ResponseEntity.status(401).body(
                    new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (Exception e) {
            log.error("도서 등록 서버 오류: userId={}, error={}", userId, e.toString());
            return ResponseEntity.status(500).body(
                    new ApiResponse<>("error", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.", null)
            );
        }
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<ApiResponse<?>> updateBook(
            @RequestAttribute("userId") String userId,
            @PathVariable Long bookId,
            @RequestBody BookUpdateRequest req
    ) {
        /**
         * 도서 수정 API (PUT)
         *
         * <동작 개요>
         * - JWT 인증된 사용자가 URL 경로로 전달된 bookId와 요청 본문의 수정 데이터를 기반으로 본인이 등록한 도서 정보를 검증 후 수정한다.
         *
         * <요청 정보>
         * - URL: /api/books/{bookId}
         * - @RequestAttribute("userId") String userId
         *   : JWT 토큰에서 추출된 인증 사용자 ID
         * - @PathVariable Long bookId
         *   : 수정 대상이 되는 도서의 고유 식별자(PK)
         * - @RequestBody BookUpdateRequest req
         *   : 수정할 도서 정보 (title, description, content, categoryId)
         *
         * <응답 형식>
         * - 200: 성공 (200 OK)
         * - 400: 실패 필수 입력 값 누락, 잘못된 요청 데이터인 경우 (잘못된 요청)
         * - 401: 실패 사용자 정보가 없거나, 존재하지 않는 도서를 수정하려 하거나, 본인이 등록하지 않은 도서를 수정하려 할 경우 (인증/조회/권한 문제)
         * - 500: 그 외 예기치 못한 서버 내부 오류 발생 시 (서버 오류)
         */
        log.info("도서 수정 요청: userId={}, bookId={}, title={}", userId, bookId, req.getTitle());

        try {
            BookUpdateResponse data = bookService.updateBook(userId, bookId, req);

            log.info("도서 수정 성공: bookId={}", data.getBookId());

            return ResponseEntity.ok(
                    new ApiResponse<>("success", "도서수정완료", data)
            );

        } catch (IllegalArgumentException e) {
            // 잘못된 요청 데이터 (필수값 누락 등)
            log.warn("도서 수정 실패 - 잘못된 요청: userId={}, bookId={}, msg={}", userId, bookId, e.getMessage());
            return ResponseEntity.status(400).body(
                    new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (RuntimeException e) {
            // 사용자 없음, 도서 없음, 권한 없음, 카테고리 없음 등 도메인/인증 관련 문제
            log.warn("도서 수정 실패 - 인증/조회/권한 문제: userId={}, bookId={}, msg={}", userId, bookId, e.getMessage());
            return ResponseEntity.status(401).body(
                    new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (Exception e) {
            // 예기치 못한 서버 오류
            log.error("도서 수정 서버 오류: userId={}, bookId={}, error={}", userId, bookId, e.toString());
            return ResponseEntity.status(500).body(
                    new ApiResponse<>("error", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.", null)
            );
        }
    }

    // TODO: 도서 삭제 (DELETE)


}
