package com.example.back.service;

import com.example.back.DTO.BookListResponse;
import com.example.back.entity.Book;
import com.example.back.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    // 도서 목록 조회 (GET)
    public BookListResponse getBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> result = bookRepository.findAll(pageable);

        // Page<Book> -> BookListResponse 로 변환
        return BookListResponse.from(result);
    }
}
