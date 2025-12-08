package com.example.back.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.DTO.ApiResponse;
import com.example.back.DTO.DeleteRequest;
import com.example.back.DTO.LoginRequest;
import com.example.back.DTO.LoginResponse;
import com.example.back.DTO.SignupRequest;
import com.example.back.DTO.UpdateRequest;
import com.example.back.service.AuthService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService; 
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;
     
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<?>> signup(@RequestBody SignupRequest req) {
        /**
         * 회원가입 API
         * - 클라이언트가 보낸 회원가입 정보(JSON)를 받아서 서비스로 전달하고 결과를 응답합니다.
         *
         * @param req SignupRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "id": "사용자ID",
         *         "pw": "비밀번호",
         *         "name": "이름",
         *         "apikey": "API KEY"
         *       }
         *
         * @return ResponseEntity<ApiResponse<?>>
         *   - 성공/실패 여부를 나타내는 공통 응답 형태
         *   - 200: 회원가입 성공
         *   - 401: 잘못된 요청 (중복 ID 등)
         *   - 500: 서버 내부 오류
         */
        log.info("회원가입 요청: id={}, name={}", req.getId(), req.getName());

        authService.signup(req);

        log.info("회원가입 완료: id={}", req.getId());
        return ResponseEntity.ok(
            new ApiResponse<>("success", "회원가입 성공", null)
        );
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        /**
         * 로그인 API
         * - 인증 성공 시 Service에서 JWT 토큰을 생성하여 반환받고,
         *   Controller에서 헤더 + Body(LoginResponse) 조립 후 반환합니다.
         *
         * @param req LoginRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "id": "사용자ID",
         *         "pw": "비밀번호"
         *       }
         *
         * @return ResponseEntity<?>
         *   - 200 OK: Authorization 헤더 + userId 반환
         *   - 404 NOT FOUND: 아이디 없음
         *   - 401 UNAUTHORIZED: 비밀번호 불일치
         *   - 500 INTERNAL SERVER ERROR: 서버 오류
         */
        log.info("로그인 요청: id={}", req.getId());

        // 모든 예외는 GlobalExceptionHandler에서 처리됨
        Map<String, String> tokens = authService.login(req);

        String accessToken = tokens.get("accessToken");
        String refreshToken = tokens.get("refreshToken");

        long refreshExpirationSeconds = refreshExpirationMs / 1000;

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .path("/")
            .maxAge(refreshExpirationSeconds)
            .build();

        LoginResponse response = new LoginResponse(
            "success",
            "로그인 성공",
            req.getId()
        );

        log.info("로그인 성공: id={}", req.getId());

        return ResponseEntity.ok()
            .header("Authorization", "Bearer " + accessToken)
            .header("Set-Cookie", refreshCookie.toString())
            .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        /**
         * 로그아웃 API
         * - Authorization 헤더에 전달된 JWT 토큰으로 로그아웃 처리합니다.
         *
         * @param authHeader Authorization 헤더 값
         *   예: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         *
         * @return ResponseEntity<?>
         *   - 200: 로그아웃 성공
         *   - 401: 잘못된 토큰 또는 로그아웃 불가
         *   - 500: 서버 오류
         */
        String token = "";

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // "Bearer " 이후 토큰만 추출
        }
        log.info("로그아웃 요청: token={}", token);

        authService.logout(token);   // 예외 발생 시 GlobalExceptionHandler에서 처리됨

        log.info("로그아웃 완료: token={}", token);

        return ResponseEntity.ok(new ApiResponse<>("success", "로그아웃 완료", null));
    }

    @PatchMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateRequest req
    ) {
        /**
         * 회원정보 수정 API
         *
         * 처리 흐름:
         * 1) Authorization 헤더에서 Access Token 추출
         * 2) 토큰에서 userId 추출 및 유효성 검증
         * 3) name, pw 중 전달된 필드만 수정
         * 4) DB 업데이트 후 성공 응답 반환
         *
         * Request Header:
         *   Authorization: Bearer JWT_ACCESS_TOKEN
         *
         * Request Body JSON:
         *   {
         *     "name": "새 이름",
         *     "pw": "새 비밀번호"
         *   }
         */

        log.info("회원정보 수정 요청");
        String token = authHeader.replace("Bearer ", "");

        // 서비스에 업데이트 요청
        authService.updateUser(token, req);

        log.info("회원정보 수정 완료");

        return ResponseEntity.ok(
            new ApiResponse<>("success", "회원정보가 성공적으로 수정되었습니다.", null)
        );    
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody DeleteRequest req) {
        /**
         * 회원 탈퇴 API
         * - Authorization 헤더에서 JWT 토큰 추출
         * - 토큰의 사용자와 req.pw를 검증하여 DB에서 삭제
         *
         * @param req DeleteRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "pw": "사용자 비밀번호"
         *       }
         * 
         * @return ResponseEntity<?>
         *   - 200: 탈퇴 성공
         *   - 401: 토큰 또는 비밀번호가 올바르지 않음
         *   - 500: 서버 내부 오류
         */
        String token = authorizationHeader.replace("Bearer ", "");
        log.info("회원 탈퇴 요청: token={}, pw={}", token, req.getPw());

        try {
            authService.deleteUser(token, req.getPw());
            log.info("회원 탈퇴 완료: token={}", token);

            return ResponseEntity.ok(
                new ApiResponse<>("success", "회원 탈퇴 완료", null)
            );

        } catch (RuntimeException e) {
            log.warn("회원 탈퇴 실패 - 잘못된 요청: token={}, msg={}", token, e.getMessage());

            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("회원 탈퇴 서버 오류: token={}, error={}", token, e.toString());

            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
    }


    @PostMapping("/token/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        /**
         * 액세스 토큰 유효성 검사 API
         * - Authorization 헤더에서 JWT 토큰을 추출하여 검증
         *
         * 헤더 예시:
         *   Authorization: Bearer JWT_ACCESS_TOKEN
         */

        String token = authorizationHeader.replace("Bearer ", "");

        log.info("토큰 유효성 검사 요청: token={}", token);

        try {
            authService.validateAccessToken(token);

            return ResponseEntity.ok(
                new ApiResponse<>("success", "유효한 토큰입니다.", null)
            );
        } catch (ExpiredJwtException e) {
            log.warn("토큰 만료: token={}", token);
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", "만료된 토큰입니다.", null)
            );
        } catch (SecurityException e) {
            log.warn("토큰 검증 실패(서명 오류): token={}", token);
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", "유효하지 않은 토큰입니다.", null)
            );
        } catch (MalformedJwtException e) {
            log.warn("토큰 형식 오류: token={}", token);
            return ResponseEntity.status(400).body(
                new ApiResponse<>("error", "잘못된 토큰 형식입니다.", null)
            );
        } catch (Exception e) {
            log.error("토큰 검증 중 알 수 없는 오류: token={}, error={}", token, e.toString());
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", "유효하지 않은 토큰입니다.", null)
            );
        }
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        /**
         * 액세스 토큰 재발급 API
         * - 쿠키로 전달된 Refresh Token을 이용하여
         *   새로운 Access Token을 발급합니다.
         *
         * 처리 흐름:
         *   1) refreshToken 쿠키 존재 여부 확인
         *   2) 유효성 검사
         *   3) 서버에 저장된 refreshToken과 일치 여부 확인
         *   4) 새 AccessToken 생성 후 Authorization 헤더로 응답
         */

        log.info("액세스 토큰 재발급 요청: refreshToken={}", refreshToken);

        if (refreshToken == null) {
            log.warn("토큰 재발급 실패 - 쿠키에 refreshToken 없음");
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", "Refresh Token이 전송되지 않았습니다.", null)
            );
        }

        try {
            String newAccessToken = authService.reissueAccessToken(refreshToken);
            log.info("액세스 토큰 재발급 완료");

            return ResponseEntity.ok()
                .header("Authorization", "Bearer " + newAccessToken)
                .body(new ApiResponse<>("success", "액세스 토큰 재발급 성공", null));

        } catch (RuntimeException e) {
            log.warn("토큰 재발급 실패 - refreshToken={}, msg={}", refreshToken, e.getMessage());
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("토큰 재발급 서버 오류: refreshToken={}, error={}", refreshToken, e.toString());
            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
    }

    @GetMapping("/api-key")
    public ResponseEntity<?> getUserApiKey(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("API Key 조회 요청");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        String token = authHeader.replace("Bearer ", "");

        // 서비스 호출
        String apiKey = authService.getUserApiKey(token);

        return ResponseEntity.ok(
                new ApiResponse<>("success", "API Key 조회 성공", apiKey)
        );
    }
}   
