package com.example.back.controller;

import org.springframework.http.ResponseEntity;
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
         *         "name": "이름"
         *       }
         *
         * @return ResponseEntity<ApiResponse<?>>
         *   - 성공/실패 여부를 나타내는 공통 응답 형태
         *   - 200: 회원가입 성공
         *   - 401: 잘못된 요청 (중복 ID 등)
         *   - 500: 서버 내부 오류
         */
        log.info("회원가입 요청: id={}, name={}", req.getId(), req.getName());

        try {
            authService.signup(req);
            log.info("회원가입 완료: id={}", req.getId());
            return ResponseEntity.ok(
                new ApiResponse<>("success", "회원가입 성공", null)
            );

        } catch (IllegalArgumentException e) {
            log.warn("회원가입 실패 - 잘못된 요청: id={}, msg={}", req.getId(), e.getMessage());
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );

        } catch (Exception e) {
            log.error("회원가입 서버 오류: id={}, error={}", req.getId(), e.toString());
            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.", null)
            );
        }
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
        try {
            // Service에서 JWT Token만 반환받음
            String token = authService.login(req);
            log.info("로그인 성공: id={}", req.getId());

            // 응답 DTO는 Controller에서 조립
            LoginResponse response = new LoginResponse(
                "success",
                "로그인 성공",
                req.getId()
            );
            return ResponseEntity.ok()
                .header("Authorization", "Bearer " + token)
                .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("로그인 실패 - 등록되지 않은 아이디: id={}, msg={}", req.getId(), e.getMessage());
            return ResponseEntity.status(404).body(
                new LoginResponse("error", "등록되지 않은 아이디입니다.", null)
            );
        } catch (RuntimeException e) {
            log.warn("로그인 실패 - 비밀번호 불일치: id={}", req.getId());
            return ResponseEntity.status(401).body(
                new LoginResponse("error", "비밀번호가 일치하지 않습니다.", null)
            );
        } catch (Exception e) {
            log.error("로그인 서버 오류: id={}, error={}", req.getId(), e.toString());
            return ResponseEntity.status(500).body(
                new LoginResponse("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
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
        String token = authHeader.replace("Bearer ", "");
        log.info("로그아웃 요청: token={}", token);

        try {
            authService.logout(token);
            log.info("로그아웃 완료: token={}", token);

            return ResponseEntity.ok(
                new ApiResponse<>("success", "로그아웃 완료", null)
            );
        } catch (RuntimeException e) {
            log.warn("로그아웃 실패 - 잘못된 토큰: token={}, msg={}", token, e.getMessage());
            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("로그아웃 서버 오류: token={}, error={}", token, e.toString());
            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
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

}   
