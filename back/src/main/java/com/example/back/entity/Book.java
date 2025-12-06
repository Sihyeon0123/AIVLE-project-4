package com.example.back.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Getter
@Setter
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 작성자 id

     @ManyToOne
     @JoinColumn(name = "category", nullable = false)
     private Category category; // 카테고리

    @Column(nullable = false, length = 100)
    private String title; // 작품 제목

    @Column(nullable = false, length = 100)
    private String description; // 작품 설명

    @Column(nullable = false, length = 1000)
    private String content; // 작품 내용

    @CreationTimestamp
    private LocalDateTime created_at;

    @UpdateTimestamp
    private LocalDateTime updated_at;
}
