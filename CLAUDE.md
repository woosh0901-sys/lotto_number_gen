# 🔒 Mandatory Security & Error Handling Rules (강제 규칙)

> **경고**: 이 규칙은 모든 코드 생성 시 반드시 준수해야 합니다. 테스트 통과 결과만 제출 가능합니다.

---

## 🛡️ Security Checklist (보안 체크리스트)

모든 웹 SaaS 개발 시 아래 항목을 **전부 반영하고 테스트 통과** 후 결과만 제출:

| 카테고리 | 필수 적용 사항 |
|---------|--------------|
| **CORS/Preflight** | 화이트리스트 기반 Origin 검증, Preflight 캐싱 |
| **CSRF** | Double Submit Cookie 또는 Synchronizer Token 패턴 |
| **XSS + CSP** | 입력 이스케이프, Content-Security-Policy 헤더 설정 |
| **SSRF** | URL 화이트리스트, 내부 IP 차단, DNS Rebinding 방어 |
| **AuthN/AuthZ** | JWT/세션 기반 인증, 권한 검증 미들웨어 |
| **RBAC/ABAC + 테넌트 격리** | 역할 기반/속성 기반 접근제어, 멀티테넌트 데이터 격리 |
| **최소 권한** | 필요 최소한의 권한만 부여, 권한 상승 방지 |
| **Validation + SQLi 방어** | 입력 검증, Prepared Statement/ORM 사용 |
| **RateLimit/Bruteforce** | API Rate Limiting, 로그인 시도 제한 |
| **쿠키 보안** | `HttpOnly`, `Secure`, `SameSite=Strict` 플래그 필수 |
| **세션 보안** | 세션 고정 방지, 세션 만료 관리 |
| **Secret 관리 + Rotation** | 환경변수 분리, 주기적 키 교체 |
| **HTTPS/HSTS + 보안헤더** | TLS 강제, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Audit Log** | 모든 중요 행위 로깅 (who, what, when, where) |
| **에러 노출 차단** | 프로덕션에서 스택트레이스/내부정보 숨김 |
| **의존성 취약점** | `npm audit`, `snyk`, `dependabot` 등 정기 점검 |

---

## 🚨 Mandatory Error Handling Rules (에러 핸들링 절대 규칙)

### 1. AppError 클래스 구조

```typescript
class AppError extends Error {
  constructor(
    public code: string,           // 에러 코드 (e.g., 'VALIDATION_ERROR')
    public status: number,         // HTTP 상태 코드
    public details?: unknown,      // 추가 상세 정보
    public requestId?: string      // 요청 추적 ID
  ) {
    super(code);
    this.name = 'AppError';
  }
}
```

### 2. 전역 에러 핸들러 필수 구현

```typescript
// 모든 에러는 전역 핸들러를 통해 일관되게 처리
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // 로그 (내부용 - 상세 정보 포함)
  logger.error({
    requestId,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    path: req.path,
    method: req.method,
    code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  // 응답 (외부용 - 최소 정보만)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: getPublicMessage(err.code) },
      requestId
    });
  }
  
  // 예상치 못한 에러는 generic 응답
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    requestId
  });
});
```

### 3. 에러 타입 분리 (필수)

| 에러 타입 | HTTP Status | 용도 |
|----------|-------------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `AUTH_ERROR` | 401 | 인증 실패 (토큰 만료, 잘못된 자격증명) |
| `FORBIDDEN_ERROR` | 403 | 권한 없음 |
| `NOT_FOUND_ERROR` | 404 | 리소스 없음 |
| `CONFLICT_ERROR` | 409 | 리소스 충돌 (중복 등) |
| `RATE_LIMIT_ERROR` | 429 | 요청 제한 초과 |
| `INTERNAL_ERROR` | 500 | 서버 내부 에러 |

### 4. 운영 환경 응답 규칙 (절대 금지)

> [!CAUTION]
> **프로덕션 응답에서 절대 노출 금지:**
> - ❌ Stack trace
> - ❌ 내부 파일 경로
> - ❌ SQL 쿼리
> - ❌ API 키/시크릿
> - ❌ 데이터베이스 연결 정보
> - ❌ 내부 서버 IP

### 5. 로그 필수 포함 항목

```json
{
  "requestId": "req-uuid-here",
  "userId": "user-123",
  "tenantId": "tenant-456",
  "path": "/api/resource",
  "method": "POST",
  "code": "VALIDATION_ERROR",
  "stack": "[개발환경에서만]",
  "timestamp": "2026-01-17T18:24:02+09:00"
}
```

---

## ✅ 테스트 요구사항

모든 보안 항목 및 에러 핸들링에 대해 **테스트 통과 후에만 코드 제출**:

```bash
# 보안 테스트
npm run test:security

# 에러 핸들링 테스트
npm run test:error-handling

# 의존성 취약점 점검
npm audit --audit-level=high
```

---

## 📋 코드 리뷰 체크리스트

- [ ] 모든 API 엔드포인트에 인증/인가 적용
- [ ] 입력값 검증 (Zod/Joi 등 스키마 검증 라이브러리 사용)
- [ ] SQL Injection 방어 (Prepared Statement)
- [ ] XSS 방어 (출력 이스케이프)
- [ ] CSRF 토큰 적용
- [ ] Rate Limiting 적용
- [ ] 에러 핸들링 전역 미들웨어 적용
- [ ] 로깅에 requestId 포함
- [ ] 프로덕션 빌드에서 소스맵/스택트레이스 제거
- [ ] 환경변수로 시크릿 관리 (.env.example 제공)

---

> **이 규칙을 따르지 않은 코드는 거부됩니다.**
