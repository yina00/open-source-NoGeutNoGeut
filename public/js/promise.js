const roomNum = document.getElementById('roomNum').value; // 채팅방 번호
const user = document.getElementById('currentUser').value;


document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.getElementById("settings-button");
    const settingsMenu = document.getElementById("settings-menu");

    if (settingsButton && settingsMenu) {
        settingsButton.addEventListener("click", function () {
            console.log("Settings button clicked"); // 디버깅용 로그
            console.log("roomNum 확인", roomNum);
            if (settingsMenu.style.display === "none" || settingsMenu.style.display === "") {
                settingsMenu.style.display = "block";
            } else {
                settingsMenu.style.display = "none";
            }
        });

        document.addEventListener("click", function (event) {
            const isClickInside = settingsButton.contains(event.target);
            if (!isClickInside && settingsMenu.style.display === "block") {
                settingsMenu.style.display = "none";
            }
        });
    }
});

function showModal(promiseNum) {
    // AJAX 요청을 통해 서버에서 약속 상세 정보를 가져옵니다
    fetch(`/promiseList/detailModal/${promiseNum}`)
        .then(response => response.json())
        .then(data => {
            console.log("data 확인", data);
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <div>
                    <span class="modalInfoDetail">약속 제목: </span>
                    <span>${data.promiseTitle || '제목 없음'}</span>
                </div>
                ${data.userType === 'student' ? `
                    <div>
                        <span class="modalInfoDetail">채팅 상대방 이름: </span>
                        <span class="modalInfo">${data.protectorName}</span>
                    </div>
                    <div>
                        <span class="modalInfoDetail">노인 이름: </span>
                        <span class="modalInfo">${data.seniorName}</span>
                    </div>
                ` : ''}
                ${data.userType === 'senior' ? `
                    <div>
                        <span class="modalInfoDetail">채팅 상대방 이름: </span>
                        <span class="modalInfo">${data.studentName}</span>
                    </div>
                ` : ''}
                <div>
                    <span class="modalInfoDetail">약속 날짜: </span>
                    <span class="modalInfo">${data.date}</span>
                </div>
                <div class="infoTime">
                    <div>
                        <span class="modalInfoDetail">시작 시간: </span>
                        <span class="modalInfo">${data.startTime}</span>
                    </div>
                    <div>
                        <span class="modalInfoDetail">종료 시간: </span>
                        <span class="modalInfo">${data.finishTime}</span>
                    </div>
                </div>
            `;
            // 모달을 보이도록 설정
            document.getElementById('promise-modal').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}


// 현재 날짜를 YYYY-MM-DD 형식으로 가져오기
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 현재 시간의 시간과 분을 가져오기
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Custom Alert 표시
function showCustomAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').classList.remove('hidden');
}

// Custom Alert 닫기
function closeAlert() {
    document.getElementById('customAlert').classList.add('hidden');
}

// 페이지 로드 후 현재 날짜와 시간을 설정
document.addEventListener('DOMContentLoaded', function () {
    const todayDate = getCurrentDate();
    const currentTime = getCurrentTime();

    //document.getElementById('promiseDay').setAttribute('min', todayDate);
    //document.getElementById('startTime').setAttribute('min', currentTime);
    //document.getElementById('finishTime').setAttribute('min', currentTime);

    // 날짜 선택 이벤트 리스너 추가
    document.getElementById('promiseDay').addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const today = new Date(todayDate);

        if (selectedDate < today) {
            showCustomAlert('오늘 이전의 날짜를 선택할 수 없습니다.');
            this.value = ''; // 날짜 필드를 비워서 유효하지 않은 날짜를 제거
        }
    });

    // 시작 시간과 종료 시간을 저장할 변수
    let startTimeValue = '';
    let finishTimeValue = '';

    // 시작 시간 선택 이벤트 리스너 추가
    document.getElementById('startTime').addEventListener('change', function () {
        startTimeValue = this.value; // 선택한 시작 시간을 저장
        validateTimes(); // 시간 검증 함수 호출
    });

    // 종료 시간 선택 이벤트 리스너 추가
    document.getElementById('finishTime').addEventListener('change', function () {
        finishTimeValue = this.value; // 선택한 종료 시간을 저장
        validateTimes(); // 시간 검증 함수 호출
    });

    // 시간 검증 함수
    function validateTimes() {
        if (startTimeValue && finishTimeValue) {
            const start24HourTime = convertTo24HourFormat(startTimeValue);
            const finish24HourTime = convertTo24HourFormat(finishTimeValue);

            console.log("start24HourTime", start24HourTime);
            console.log("finish24HourTime", finish24HourTime);
            // 종료 시간이 시작 시간보다 이른 경우
            if (finish24HourTime < start24HourTime) {
                showCustomAlert('종료 시간은 시작 시간보다 빠를 수 없습니다.');
                document.getElementById('finishTime').value = ''; // 종료 시간 필드를 비워서 유효하지 않은 시간을 제거
                finishTimeValue = ''; // 저장된 종료 시간도 비우기
            }
        }
    }

    // 12시간 형식의 시간을 24시간 형식으로 변환하는 함수
    function convertTo24HourFormat(time) {
        const [timePart, period] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes; // 시간을 분 단위로 변환
    }
});