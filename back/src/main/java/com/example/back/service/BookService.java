package com.example.back.service;

import com.example.back.DTO.BookCreateRequest;
import com.example.back.DTO.BookCreateResponse;
import com.example.back.DTO.BookListResponse;
import com.example.back.entity.Book;
import com.example.back.entity.Category;
import com.example.back.entity.User;
import com.example.back.jwt.JwtUtil;
import com.example.back.repository.BookRepository;
import com.example.back.repository.CategoryRepository;
import com.example.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@Slf4j
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private JwtUtil jwtUtil;

    // 도서 목록 조회 (GET)
    public BookListResponse getBooks(int page, int size) {
        /**
         * 도서 목록 조회 서비스 로직
         *
         */
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> result = bookRepository.findAll(pageable);

        // Page<Book> -> BookListResponse 로 변환
        return BookListResponse.from(result);
    }

    // TODO: 도서 상세 정보 조회 (GET)


    // TODO: 신규 도서 등록 (POST)
    public BookCreateResponse createBook(String userId, BookCreateRequest req) {

        log.info("도서 등록 서비스 시작: userId={}, title={}", userId, req.getTitle());

        // 1) 필수 값 검증
        if (req.getTitle() == null || req.getTitle().isBlank()
                || req.getDescription() == null || req.getDescription().isBlank()
                || req.getContent() == null || req.getContent().isBlank()) {
            log.warn("도서 등록 실패 - 잘못된 요청 데이터: title/description/content 비어 있음");
            throw new IllegalArgumentException("도서 정보가 올바르지 않습니다.");
        }

        // 2) 사용자 조회 (존재 여부 확인)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("도서 등록 실패 - 사용자 조회 실패: userId={}", userId);
                    return new RuntimeException("사용자 정보를 찾을 수 없습니다.");
                });

        // 3) 카테고리 조회
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> {
                    log.warn("도서 등록 실패 - 카테고리 조회 실패: categoryId={}", req.getCategoryId());
                    return new RuntimeException("카테고리 정보를 찾을 수 없습니다.");
                });

        // 4) Book 엔티티 생성
        Book book = new Book();
        book.setUser(user);
        book.setCategory(category);
        book.setTitle(req.getTitle());
        book.setDescription(req.getDescription());
        book.setContent(req.getContent());

        // 5) 저장
        Book saved = bookRepository.save(book);
        log.info("도서 등록 서비스 완료: bookId={}", saved.getId());

        // 6) bookId만 반환
        return new BookCreateResponse(saved.getId());
    }

    // TODO: 도서 수정 (PUT)


    // TODO: 도서 삭제 (DELETE)

}
