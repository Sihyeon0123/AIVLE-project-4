package com.example.back.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.back.DTO.LoginRequest;
import com.example.back.DTO.LoginResponse;
import com.example.back.DTO.SignupRequest;
import com.example.back.entity.User;
import com.example.back.jwt.JwtUtil;
import com.example.back.repository.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public void signup(SignupRequest req) {

        /**
         * 회원가입 서비스 로직
         * - 중복 ID 여부 확인
         * - User 엔티티 생성 및 저장
         *
         * @param req SignupRequest
         *   - req.getId(): 사용자 ID
         *   - req.getPw(): 비밀번호
         *   - req.getName(): 이름
         */

        log.info("회원가입 처리 시작: id={}", req.getId());

        if (userRepository.existsById(req.getId())) {
            log.warn("회원가입 실패 - 이미 존재하는 아이디: id={}", req.getId());
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User user = new User();
        user.setId(req.getId());
        user.setPw(passwordEncoder.encode(req.getPw()));
        user.setName(req.getName());

        userRepository.save(user);

        log.info("회원가입 처리 완료: id={}", req.getId());
    }


    public LoginResponse login(LoginRequest req) {

        /**
         * 로그인 서비스 로직
         * - ID로 유저 조회
         * - 비밀번호 검증
         * - JWT 토큰 생성 후 LoginResponse 반환
         *
         * @param req LoginRequest
         *   - req.getId(): 로그인 ID
         *   - req.getPw(): 입력한 비밀번호
         *
         * @return LoginResponse
         */

        log.info("로그인 처리 시작: id={}", req.getId());
        User user = userRepository.findById(req.getId())
            .orElseThrow(() -> {
                log.warn("로그인 실패 - 존재하지 않는 아이디: id={}", req.getId());
                return new IllegalArgumentException("등록되지 않은 아이디입니다.");
            });

        if (!passwordEncoder.matches(req.getPw(), user.getPw())) {
            log.warn("로그인 실패 - 비밀번호 불일치: id={}", req.getId());
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtUtil.createToken(user.getId());

        log.info("로그인 성공 - 토큰 발급: id={}", req.getId());

        return new LoginResponse(
            "success",
            "로그인 성공",
            user.getId(),
            token
        );
    }


    public void logout(String token) {

        /**
         * 로그아웃 서비스 로직
         * - JWT 토큰 검증만 수행
         *   → 유효하지 않으면 예외 발생
         *
         * @param token 클라이언트 JWT Access Token
         */

        log.info("로그아웃 처리 시작: token={}", token);

        try {
            jwtUtil.getUserId(token);  // 유효성 검증
            log.info("로그아웃 처리 완료: token={}", token);

        } catch (Exception e) {
            log.warn("로그아웃 실패 - 유효하지 않은 토큰: token={}", token);
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
    }


    public void deleteUser(String token, String pw) {

        /**
         * 회원 탈퇴 서비스 로직
         * - token → userId 추출
         * - userId로 사용자 조회
         * - 비밀번호 검증
         * - DB에서 사용자 삭제
         *
         * @param token JWT Access Token
         * @param pw    비밀번호 (본인 확인용)
         */

        log.info("회원 탈퇴 처리 시작: token={}", token);

        String userId;

        // 1) 토큰 검증 및 userId 추출
        try {
            userId = jwtUtil.getUserId(token);
        } catch (Exception e) {
            log.warn("회원 탈퇴 실패 - 토큰 검증 실패: token={}", token);
            throw new RuntimeException("사용자 정보를 찾을 수 없습니다.");
        }

        // 2) 유저 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("회원 탈퇴 실패 - 사용자 조회 실패: userId={}", userId);
                return new RuntimeException("사용자 정보를 찾을 수 없습니다.");
            });

        // 3) 비밀번호 검증
        if (!passwordEncoder.matches(pw, user.getPw())) {
            log.warn("회원 탈퇴 실패 - 비밀번호 불일치: userId={}", userId);
            throw new RuntimeException("사용자 정보를 찾을 수 없습니다.");
        }

        // 4) 삭제
        userRepository.delete(user);

        log.info("회원 탈퇴 처리 완료: userId={}", userId);
    }


}
