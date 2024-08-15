 const reportContent = "보고서 내용";
        const reportMedia = "보고서 미디어";
        const studentNumber = "학생 번호";

        //서버로 데이터를 전송
        fetch('/submit-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reportContent: reportContent,
                reportMedia: reportMedia,
                studentNumber: studentNumber
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Submission response:', data);
        })
        .catch(error => {
            console.error('Error submitting report:', error);
        });