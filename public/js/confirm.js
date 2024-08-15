
        function submitReport() {
            //보고서 제출 확인을 서버로 요청
            fetch('/submitReportConfirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                //body: JSON.stringify({ reportNum: <%= report.reportNum %> })
            })
            .then(response => {
                if (response.ok) {
                    //성공적으로 처리되었을 때 알림창 표시
                    alert('보고서가 성공적으로 제출되었습니다.');
                } else {
                    throw new Error('보고서 제출 확인 실패');
                }
            })
            .catch(error => {
                console.error('Error submitting report confirmation:', error);
                alert('보고서 제출 확인 중 오류가 발생했습니다.');
            });
        }