package com.example.back.exception;

import io.jsonwebtoken.*;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.back.DTO.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ====== 400 Bad Request ======
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler({MalformedJwtException.class, UnsupportedJwtException.class})
    public ResponseEntity<?> handleMalformedJwt(Exception e) {
        return build(HttpStatus.BAD_REQUEST, "잘못된 JWT 형식입니다.");
    }


    // ====== 401 Unauthorized ======
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredToken(ExpiredJwtException e) {
        return build(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다.");
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleInvalidJwt(SecurityException e) {
        return build(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
    }


    // ====== 500 Database Error ======
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDatabase(DataAccessException e) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "데이터베이스 처리 중 오류가 발생했습니다.");
    }


    // ====== 500 Internal Error ======
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException e) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "처리 중 오류가 발생했습니다.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");
    }


    // 공통 응답 생성 함수
    private ResponseEntity<?> build(HttpStatus status, String message) {
    HttpStatus safeStatus = (status != null) ? status : HttpStatus.INTERNAL_SERVER_ERROR;
    String safeMessage = (message != null) ? message : "서버 내부 오류가 발생했습니다.";
    return ResponseEntity.status(safeStatus)
            .body(new ApiResponse<>("error", safeMessage, null));
}

}