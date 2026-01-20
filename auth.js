// Google OAuth 설정
// 실제 사용하려면 https://console.cloud.google.com 에서
// OAuth 2.0 클라이언트 ID를 생성해야 합니다
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

// 인증 상태 관리
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    // 로컬스토리지에서 사용자 정보 로드
    loadUserFromStorage() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // 사용자 정보 저장
    saveUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // 로그아웃
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Google Sign-Out
        if (window.google && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
    }

    // 로그인 여부 확인
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 현재 사용자 정보 가져오기
    getCurrentUser() {
        return this.currentUser;
    }

    // 사용자 ID 가져오기
    getUserId() {
        return this.currentUser ? this.currentUser.sub : null;
    }

    // 사용자별 localStorage 키 생성
    getUserKey(key) {
        const userId = this.getUserId();
        return userId ? `user_${userId}_${key}` : key;
    }

    // 사용자별 데이터 저장
    setUserData(key, value) {
        const userKey = this.getUserKey(key);
        localStorage.setItem(userKey, value);
    }

    // 사용자별 데이터 가져오기
    getUserData(key) {
        const userKey = this.getUserKey(key);
        return localStorage.getItem(userKey);
    }

    // 사용자별 데이터 삭제
    removeUserData(key) {
        const userKey = this.getUserKey(key);
        localStorage.removeItem(userKey);
    }
}

// 전역 AuthManager 인스턴스
const authManager = new AuthManager();

// Google Sign-In 콜백
function handleCredentialResponse(response) {
    // JWT 토큰 디코딩
    const userInfo = parseJwt(response.credential);

    // 사용자 정보 저장
    authManager.saveUser(userInfo);

    console.log('로그인 성공:', userInfo);

    // 로그인 UI 업데이트
    updateAuthUI();

    // 메인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지인 경우)
    if (window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    } else {
        // 현재 페이지 새로고침
        window.location.reload();
    }
}

// JWT 토큰 파싱
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('JWT 파싱 실패:', e);
        return null;
    }
}

// 로그아웃 처리
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        authManager.logout();
        alert('로그아웃되었습니다.');
        window.location.href = 'index.html';
    }
}

// 로그인 UI 업데이트
function updateAuthUI() {
    const loginLinks = document.querySelectorAll('.login-link');

    loginLinks.forEach(link => {
        if (authManager.isLoggedIn()) {
            const user = authManager.getCurrentUser();
            link.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${user.picture ? `<img src="${user.picture}" style="width: 24px; height: 24px; border-radius: 50%;">` : ''}
                    <span>${user.name || user.email}</span>
                    <button onclick="handleLogout()" style="margin-left: 8px; padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">로그아웃</button>
                </div>
            `;
            link.href = '#';
            link.onclick = (e) => e.preventDefault();
        } else {
            link.textContent = '로그인';
            link.href = 'login.html';
        }
    });
}

// 보호된 페이지 접근 제어
function requireAuth() {
    if (!authManager.isLoggedIn()) {
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Google Sign-In 초기화
function initGoogleSignIn() {
    if (window.google && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // Google Sign-In 초기화
    initGoogleSignIn();

    // 로그인 UI 업데이트
    updateAuthUI();
});
