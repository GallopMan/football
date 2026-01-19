// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // players.html 페이지에서만 선수 입력 필드 초기화
    if (document.getElementById('playersContainer')) {
        initializePlayers();
    }
});

// 팀 이름 입력 후 선수 페이지로 이동
function goToPlayersPage() {
    const teamNameInput = document.getElementById('teamNameInput');
    
    if (!teamNameInput) {
        console.log('teamNameInput을 찾을 수 없습니다.');
        return;
    }
    
    const teamName = teamNameInput.value;
    
    if (!teamName.trim()) {
        alert('팀 이름을 입력하세요!');
        return;
    }
    
    console.log('팀 이름 저장:', teamName);
    
    // 팀 이름을 로컬스토리지에 저장
    localStorage.setItem('currentTeamName', teamName);
    
    // 선수 입력 페이지로 이동
    location.href = 'players.html';
}

// 선수 입력 필드 초기화 (1번부터 11번까지)
function initializePlayers() {
    const container = document.getElementById('playersContainer');
    container.innerHTML = '';
    
    for (let i = 1; i <= 11; i++) {
        addPlayerInputField(i);
    }
}

// 선수 입력 필드 추가
function addPlayerInputField(number) {
    const container = document.getElementById('playersContainer');
    const currentCount = container.children.length;
    
    // 최대 40명 제한
    if (currentCount >= 40) {
        alert('최대 40명까지만 추가할 수 있습니다.');
        return;
    }
    
    const playerField = document.createElement('div');
    playerField.className = 'player-input-field';
    playerField.id = `player-${number}`;
    
    playerField.innerHTML = `
        <div class="player-number">${number}.</div>
        <input type="text" placeholder="선수 이름 입력" class="player-name-input" data-player-number="${number}">
    `;
    
    container.appendChild(playerField);
}

// + 버튼 클릭 시 새로운 선수 추가
function addPlayerField() {
    const container = document.getElementById('playersContainer');
    const currentCount = container.children.length;
    
    // 최대 40명 제한
    if (currentCount >= 40) {
        alert('최대 40명까지만 추가할 수 있습니다.');
        return;
    }
    
    const newNumber = currentCount + 1;
    addPlayerInputField(newNumber);
}

// 팀 완료 후 필드 페이지로 이동
function goToField() {
    const container = document.getElementById('playersContainer');
    
    if (!container) {
        console.log('playersContainer를 찾을 수 없습니다.');
        return;
    }
    
    const playerFields = container.querySelectorAll('.player-input-field');
    const players = [];
    
    // 입력된 선수들 수집
    playerFields.forEach((field) => {
        const input = field.querySelector('.player-name-input');
        if (input && input.value.trim()) {
            const playerNumber = parseInt(input.dataset.playerNumber);
            players.push({
                number: playerNumber,
                name: input.value.trim()
            });
        }
    });
    
    // 최소 1명 이상 입력 확인
    if (players.length === 0) {
        alert('최소 1명 이상의 선수를 입력하세요!');
        return;
    }
    
    // 팀 정보 저장
    const teamName = localStorage.getItem('currentTeamName');
    
    const teamData = {
        name: teamName,
        players: players,
        createdDate: new Date().toISOString()
    };
    
    localStorage.setItem('currentTeam', JSON.stringify(teamData));
    
    // 필드 페이지로 이동
    location.href = 'field.html';
}