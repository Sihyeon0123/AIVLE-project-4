package com.example.back.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
    boolean existsById(String id);
}
