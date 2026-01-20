// 축구장 선수 배치 기능

let players = [];
let fieldPlayers = [];
let subPlayers = [];
let draggedElement = null;
let dragSource = null;

// 기본 포지션 (11명) - 참고용
const defaultPositions = [
    { x: 50, y: 15 },   // 골키퍼
    { x: 20, y: 30 },   // 수비수 1
    { x: 40, y: 30 },   // 수비수 2
    { x: 60, y: 30 },   // 수비수 3
    { x: 80, y: 30 },   // 수비수 4
    { x: 25, y: 50 },   // 미드필더 1
    { x: 50, y: 55 },   // 미드필더 2
    { x: 75, y: 50 },   // 미드필더 3
    { x: 20, y: 75 },   // 공격수 1
    { x: 50, y: 80 },   // 공격수 2
    { x: 80, y: 75 }    // 공격수 3
];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('field.html 로드됨');
    initializeField();
});

// 필드 초기화
function initializeField() {
    console.log('필드 초기화 시작');

    // 팀 데이터 로드
    const teamDataStr = localStorage.getItem('currentTeam');
    const teamNameStr = localStorage.getItem('currentTeamName');

    console.log('저장된 팀 데이터:', teamDataStr);
    console.log('저장된 팀 이름:', teamNameStr);

    let teamData = null;
    try {
        teamData = JSON.parse(teamDataStr);
    } catch (e) {
        console.log('팀 데이터 파싱 오류:', e);
    }

    // 팀 데이터가 없으면 빈 배열로 시작
    if (!teamData) {
        players = [];
    } else {
        players = (teamData.players || []).map(p => ({
            ...p,
            id: p.number
        }));
    }

    // 팀 이름 표시
    const teamNameDisplay = document.getElementById('teamNameDisplay');
    if (teamNameDisplay && teamNameStr) {
        teamNameDisplay.textContent = teamNameStr;
    }

    // 저장된 배치가 있는지 확인
    const savedSetup = localStorage.getItem('teamSetup');
    if (savedSetup) {
        try {
            const setup = JSON.parse(savedSetup);
            if (setup.fieldPlayers && setup.subPlayers) {
                fieldPlayers = setup.fieldPlayers.map(p => ({
                    ...p,
                    id: p.number
                }));
                subPlayers = setup.subPlayers.map(p => ({
                    ...p,
                    id: p.number
                }));
                console.log('저장된 배치 로드 완료');
            } else {
                // 처음 설정: 모든 선수를 SUB에 배치
                fieldPlayers = [];
                subPlayers = [...players];
            }
        } catch (e) {
            console.log('저장된 배치 로드 실패:', e);
            fieldPlayers = [];
            subPlayers = [...players];
        }
    } else {
        // 처음 설정: 모든 선수를 SUB에 배치
        fieldPlayers = [];
        subPlayers = [...players];
    }

    console.log('필드 선수:', fieldPlayers);
    console.log('SUB 선수:', subPlayers);

    // UI 업데이트
    updateFieldPlayers();
    updateSubPlayers();
    setupFieldDragDrop();
    updateTotalPlayers();
}

// 필드 선수 업데이트
function updateFieldPlayers() {
    const field = document.getElementById('soccerField');
    if (!field) {
        console.log('soccerField를 찾을 수 없습니다.');
        return;
    }

    // 기존 플레이어 원 제거
    field.querySelectorAll('.player-circle').forEach(el => el.remove());

    console.log('필드에 표시할 선수 수:', fieldPlayers.length);

    // 필드에 있는 선수들 표시
    fieldPlayers.forEach((player) => {
        const circle = createPlayerCircle(player);
        field.appendChild(circle);
    });
}

// SUB 선수 업데이트
function updateSubPlayers() {
    const subSection = document.getElementById('subPlayers');
    if (!subSection) {
        console.log('subPlayers를 찾을 수 없습니다.');
        return;
    }

    subSection.innerHTML = '';

    console.log('SUB에 표시할 선수 수:', subPlayers.length);

    // SUB가 비어있을 때 메시지 표시
    if (subPlayers.length === 0) {
        subSection.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-size: 14px;">교대 선수가 없습니다.<br>필드의 선수를 여기로 드래그하세요.</p>';
    }

    subPlayers.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'sub-player-item';
        playerItem.draggable = true;
        playerItem.textContent = `${player.number}. ${player.name}`;
        playerItem.dataset.playerId = player.id;

        playerItem.addEventListener('dragstart', (e) => {
            draggedElement = player;
            dragSource = 'sub';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('playerId', player.id);
            playerItem.classList.add('dragging');
        });

        playerItem.addEventListener('dragend', () => {
            playerItem.classList.remove('dragging');
        });

        subSection.appendChild(playerItem);
    });
}

// 플레이어 원 생성
function createPlayerCircle(player) {
    const circle = document.createElement('div');
    circle.className = 'player-circle';

    // 저장된 위치가 있으면 사용, 없으면 중앙에 배치
    const posX = player.x !== undefined ? player.x : 50;
    const posY = player.y !== undefined ? player.y : 50;

    circle.style.left = posX + '%';
    circle.style.top = posY + '%';
    circle.draggable = true;
    circle.dataset.playerId = player.id;

    circle.innerHTML = `
        <div class="player-number">#${player.number}</div>
        <div class="player-name">${player.name}</div>
    `;

    // 드래그 시작
    circle.addEventListener('dragstart', (e) => {
        draggedElement = player;
        dragSource = 'field';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('playerId', player.id);
        circle.classList.add('dragging');
    });

    // 드래그 종료
    circle.addEventListener('dragend', () => {
        circle.classList.remove('dragging');
    });

    return circle;
}

// 축구장 드래그 앤 드롭 설정
function setupFieldDragDrop() {
    const field = document.getElementById('soccerField');
    if (!field) return;

    // 필드에 드래그 오버
    field.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    // 필드에 드롭
    field.addEventListener('drop', (e) => {
        e.preventDefault();

        if (!draggedElement) return;

        const rect = field.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // SUB에서 필드로 이동
        if (dragSource === 'sub') {
            const playerIndex = subPlayers.findIndex(p => p.id === draggedElement.id);
            if (playerIndex !== -1) {
                const player = subPlayers.splice(playerIndex, 1)[0];
                player.x = Math.max(5, Math.min(95, x));
                player.y = Math.max(5, Math.min(95, y));
                fieldPlayers.push(player);
            }
        }
        // 필드 내에서 이동
        else if (dragSource === 'field') {
            const player = fieldPlayers.find(p => p.id === draggedElement.id);
            if (player) {
                player.x = Math.max(5, Math.min(95, x));
                player.y = Math.max(5, Math.min(95, y));
            }
        }

        draggedElement = null;
        dragSource = null;

        updateFieldPlayers();
        updateSubPlayers();
        updateTotalPlayers();
    });

    // SUB 섹션 드래그 앤 드롭 설정
    const subSection = document.getElementById('subPlayers');
    if (!subSection) return;

    subSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        subSection.style.backgroundColor = '#ffe0b2';
    });

    subSection.addEventListener('dragleave', (e) => {
        // SUB 영역을 완전히 벗어났을 때만 배경색 제거
        const rect = subSection.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX >= rect.right ||
            e.clientY < rect.top || e.clientY >= rect.bottom) {
            subSection.style.backgroundColor = '';
        }
    });

    subSection.addEventListener('drop', (e) => {
        e.preventDefault();
        subSection.style.backgroundColor = '';

        // 필드에서 SUB로 이동
        if (dragSource === 'field' && draggedElement) {
            const playerIndex = fieldPlayers.findIndex(p => p.id === draggedElement.id);
            if (playerIndex !== -1) {
                const player = fieldPlayers.splice(playerIndex, 1)[0];
                player.x = undefined;
                player.y = undefined;
                subPlayers.push(player);
            }
        }

        draggedElement = null;
        dragSource = null;

        updateFieldPlayers();
        updateSubPlayers();
        updateTotalPlayers();
    });
}

// 선수 추가 함수
function addNewPlayer() {
    const input = document.getElementById('newPlayerName');
    const name = input.value.trim();

    if (!name) {
        alert('선수 이름을 입력하세요!');
        return;
    }

    // 새 선수 번호 생성 (현재 최대 번호 + 1)
    const allPlayers = [...fieldPlayers, ...subPlayers];
    const maxNumber = allPlayers.length > 0
        ? Math.max(...allPlayers.map(p => p.number))
        : 0;
    const newNumber = maxNumber + 1;

    // 새 선수 객체 생성
    const newPlayer = {
        id: newNumber,
        number: newNumber,
        name: name
    };

    // SUB 목록에 추가
    subPlayers.push(newPlayer);

    // 입력 필드 초기화
    input.value = '';

    // UI 업데이트
    updateSubPlayers();
    updateTotalPlayers();

    console.log('새 선수 추가:', newPlayer);
}

// 전체 선수 수 업데이트
function updateTotalPlayers() {
    const totalElement = document.getElementById('totalPlayers');
    if (totalElement) {
        const total = fieldPlayers.length + subPlayers.length;
        totalElement.textContent = `전체 선수: ${total}명 (필드: ${fieldPlayers.length}명, SUB: ${subPlayers.length}명)`;
    }
}

// 팀 배치 저장
function saveTeamSetup() {
    const teamName = localStorage.getItem('currentTeamName') || '우리팀';

    // 모든 선수에 onField 속성 추가
    const allPlayers = [];

    fieldPlayers.forEach(player => {
        allPlayers.push({
            number: player.number,
            name: player.name,
            onField: true,
            x: player.x,
            y: player.y
        });
    });

    subPlayers.forEach(player => {
        allPlayers.push({
            number: player.number,
            name: player.name,
            onField: false
        });
    });

    const setup = {
        teamName: teamName,
        players: allPlayers,
        fieldPlayers: fieldPlayers,
        subPlayers: subPlayers,
        savedDate: new Date().toISOString()
    };

    // teamSetup과 currentTeam 모두 업데이트
    localStorage.setItem('teamSetup', JSON.stringify(setup));

    // currentTeam도 업데이트 (선수 목록이 변경되었을 수 있으므로)
    const currentTeam = {
        name: teamName,
        players: allPlayers.map(p => ({
            number: p.number,
            name: p.name
        })),
        createdDate: new Date().toISOString()
    };
    localStorage.setItem('currentTeam', JSON.stringify(currentTeam));

    const message = document.getElementById('successMessage');
    if (message) {
        message.style.display = 'block';

        setTimeout(() => {
            message.style.display = 'none';
            window.location.href = 'index.html';
        }, 1500);
    } else {
        alert('팀 배치가 저장되었습니다!');
        window.location.href = 'index.html';
    }
}
