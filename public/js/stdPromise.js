function acceptPromise(promiseNum) {
    fetch(`/promiseList/${promiseNum}/request/accept`, {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('약속 sudo apt install zip수락 중 오류 발생');
            }
            //성공적으로 처리된 경우
            return response.json(); //JSON 응답으로 받아서 처리
        })
        .then(data => {
            //서버에서 전달된 리다이렉션 URL로 이동
            //window.location.href = data.redirectUrl;
            window.location.href = '/promiseList/matchingPromiseList';
        })
        .catch(error => {
            //오류가 발생한 경우 오류 메시지를 출력합니다.
            console.error(error);
        });
}

function rejectPromise(promiseNum) {
    fetch(`/promiseList/${promiseNum}/request/reject`, {
        method: 'POST',

    })
        .then(response => {
            if (!response.ok) {
                throw new Error('약속 거절 중 오류 발생');
            }
            //성공적으로 처리된 경우, 페이지를 새로 고침합니다.
            window.location.href = '/promiseList/matchingPromiseList';
        })
        .catch(error => {
            //오류가 발생한 경우 오류 메시지를 출력합니다.
            console.error(error);
        });
}
