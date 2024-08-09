const user = "<%= user %>";


document.addEventListener('DOMContentLoaded', function () {
    const stars = document.querySelectorAll('.star-rating .star');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('click', function () {
            selectedRating = index + 1;

            //선택한 별과 그 이전 별까지 색상 변경
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('selected');
            }

            //나머지 별의 색상 초기화
            for (let i = selectedRating; i < stars.length; i++) {
                stars[i].classList.remove('selected');
            }
        });
    });
});

function handleSubmit(event) {
    event.preventDefault(); //기본 폼 제출 막기

    //한 줄 후기가 작성되었는지 확인
    const reviewInput = document.getElementById('reviewText'); 

    //평점 입력 여부 확인
    const ratingInputs = document.querySelectorAll('.star');
    let isChecked = false;

    ratingInputs.forEach(input => {
        if (input.checked) {
            isChecked = true;
        }
    });

    if (!reviewInput.value.trim() && !isChecked) {
        alert("만족 스티커와 한 줄 후기를 작성하지 않았습니다.\n 작성한 뒤 제출해주세요.");
        return;
    } else if (!reviewInput.value.trim()) {
        alert("한 줄 후기를 작성해주세요.");
        return;
    } else if (!isChecked) {
        alert("평점을 선택해주세요.");
        return;
    }

    //버튼 색 변경
    const submitButton = document.querySelector('.submit-button input[type="submit"]');
    submitButton.style.backgroundColor = '#E1EFD7'; //원하는 색상으로 변경

    //fetch 함수를 사용해 입력받은 데이터를 전송하기 위한 객체 생성
    const formData = {
        reviewContent: reviewInput.value,
        //rating: [] //선택된 개수만큼 배열에 저장
        rating: '' //선택된 별점을 저장할 변수
    };

    ratingInputs.forEach(input => {
        if (input.checked) { //체크된 별점 입력 필드인지 확인
            formData.rating = input.value; //체크된 입력 필드의 값을 formData에 할당
        }
    });

    console.log("rating: ",formData.rating);
    const promiseNum = document.getElementById('promiseNum').value;
    const matchingNum = document.getElementById('matchingNum').value;

    const url = `/review/${promiseNum}/${matchingNum}`;

    //fetch 함수를 사용해 서버로 입력받은 데이터 전달
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.error); //서버에서 전송한 오류 메시지를 에러로 처리
            });
        }
    })
    .then(data => {
        console.log('서버로부터의 응답:', data);
        alert("후기가 작성되었습니다.");
        window.location.href = '/promiseList'; //리뷰를 성공적으로 작성하면 
    })
    .catch(error => {
        console.error('서버 응답 오류:', error);
        if (error.message === '후기가 이미 존재합니다.') {
            //서버에서 받은 오류 메시지가 '후기가 이미 존재합니다.'인 경우
            alert("후기를 이미 작성하셨습니다.");
            window.location.href = '/main'; //메인홈이동
        } else {
            //그 외의 경우
            alert("알 수 없는 오류가 발생했습니다.");
            window.location.href = '/main'; //메인홈이동
        }
    });
}

/*
function handleSubmit(event) {
    event.preventDefault(); // 기본 폼 제출 막기

    // 한 줄 후기가 작성되었는지 확인
    const reviewInput = document.getElementById('reviewText'); // 한 줄 후기 입력 필드의 id가 'reviewText'

    // 평점 입력 여부 확인
    const ratingInputs = document.querySelectorAll('.star'); // 모든 별점 입력 필드의 클래스가 'star'
    let isChecked = false;

    ratingInputs.forEach(input => {
        if (input.checked) {
            isChecked = true;
        }
    });

    if (!reviewInput.value.trim() && !isChecked) {
        alert("만족 스티커와 한 줄 후기를 작성하지 않았습니다.\n 작성한 뒤 제출해주세요.");
        return;
    } else if (!reviewInput.value.trim()) {
        alert("한 줄 후기를 작성해주세요.");
        return;
    } else if (!isChecked) {
        alert("평점을 선택해주세요.");
        return;
    }

    // 버튼 색 변경
    const submitButton = document.querySelector('.submit-button input[type="submit"]');
    submitButton.style.backgroundColor = '#E1EFD7'; // 원하는 색상으로 변경

    // 알림 창 띄우기
    //alert("후기가 작성되었습니다.");

    // 폼 제출
    document.getElementById('reviewForm').submit();

    // 폼 제출
    //submitReview();

}
*/
