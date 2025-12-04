package com.example.back.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.DTO.ApiResponse;
import com.example.back.DTO.DeleteRequest;
import com.example.back.DTO.LoginRequest;
import com.example.back.DTO.LoginResponse;
import com.example.back.DTO.LogoutRequest;
import com.example.back.DTO.SignupRequest;
import com.example.back.service.AuthService;

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
         *   인증 성공 시 JWT 토큰을 생성하여 반환합니다.
         *
         * @param req LoginRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "id": "사용자ID",
         *         "pw": "비밀번호"
         *       }
         *
         * @return ResponseEntity<?>
         *   - 로그인 성공: 200 OK + JWT 토큰과 userId 반환
         *   - 아이디 없음: 404 NOT FOUND
         *   - 비밀번호 불일치: 401 UNAUTHORIZED
         *   - 서버 오류: 500 INTERNAL SERVER ERROR
         */
        log.info("로그인 요청: id={}", req.getId());

        try {
            LoginResponse response = authService.login(req);
            log.info("로그인 성공: id={}", req.getId());
            
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("로그인 실패 - 등록되지 않은 아이디: id={}, msg={}", req.getId(), e.getMessage());
            
            return ResponseEntity.status(404).body(
                new LoginResponse("error", "등록되지 않은 아이디입니다.", null, null)
            );

        } catch (RuntimeException e) {
            log.warn("로그인 실패 - 비밀번호 불일치: id={}", req.getId());

            return ResponseEntity.status(401).body(
                new LoginResponse("error", "비밀번호가 일치하지 않습니다.", null, null)
            );

        } catch (Exception e) {
            log.error("로그인 서버 오류: id={}, error={}", req.getId(), e.toString());

            return ResponseEntity.status(500).body(
                new LoginResponse("error", "서버 내부 오류가 발생했습니다.", null, null)
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest req) {
         /**
         * 로그아웃 API
         * - 클라이언트가 전달한 JWT 토큰을 기반으로 로그아웃 처리합니다.
         *
         * @param req LogoutRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "token": "JWT_ACCESS_TOKEN"
         *       }
         *
         * @return ResponseEntity<?>
         *   - 200: 로그아웃 성공
         *   - 401: 잘못된 토큰 또는 로그아웃 불가
         *   - 500: 서버 오류
         */
        log.info("로그아웃 요청: token={}", req.getToken());

        try {
            authService.logout(req.getToken());

            log.info("로그아웃 완료: token={}", req.getToken());

            return ResponseEntity.ok(
                new ApiResponse<>("success", "로그아웃 완료", null)
            );

        } catch (RuntimeException e) {
            log.warn("로그아웃 실패 - 잘못된 토큰: token={}, msg={}", req.getToken(), e.getMessage());

            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("로그아웃 서버 오류: token={}, error={}", req.getToken(), e.toString());

            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
    }


    @PostMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestBody DeleteRequest req) {
        /**
         * 회원 탈퇴 API
         * - 전달받은 JWT 토큰으로 사용자 신원을 확인하고,
         *   비밀번호 검증 후 해당 사용자를 DB에서 삭제합니다.
         *
         * @param req DeleteRequest
         *   - 클라이언트가 보낸 JSON:
         *       {
         *         "token": "JWT_ACCESS_TOKEN",
         *         "pw": "사용자 비밀번호"
         *       }
         * 
         * @return ResponseEntity<?>
         *   - 200: 탈퇴 성공
         *   - 401: 토큰 또는 비밀번호가 올바르지 않음
         *   - 500: 서버 내부 오류
         */
        log.info("회원 탈퇴 요청: token={}", req.getToken());

        try {
            authService.deleteUser(req.getToken(), req.getPw());
            log.info("회원 탈퇴 완료: token={}", req.getToken());

            return ResponseEntity.ok(
                new ApiResponse<>("success", "회원 탈퇴 완료", null)
            );

        } catch (RuntimeException e) {
            log.warn("회원 탈퇴 실패 - 잘못된 요청: token={}, msg={}", req.getToken(), e.getMessage());

            return ResponseEntity.status(401).body(
                new ApiResponse<>("error", e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("회원 탈퇴 서버 오류: token={}, error={}", req.getToken(), e.toString());

            return ResponseEntity.status(500).body(
                new ApiResponse<>("error", "서버 내부 오류가 발생했습니다.", null)
            );
        }
    }
}   
