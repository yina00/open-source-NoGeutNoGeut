
const moment = require('moment-timezone');

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('클라이언트 연결됨');

        socket.on("chatting", async (data) => {
            console.log("받은 데이터:", data);

            const { msg, num, senderNum, recipientNum, roomNum, promiseForm } = data;
            const time = moment().tz("Asia/Seoul").format("A h:mm").replace('AM', '오전').replace('PM', '오후'); // 한국 시간으로 포맷팅

            //console.log("받은 시간", time);

            io.emit("chatting", {
                msg,
                num,
                senderNum,
                //time: moment(new Date()).format("h:mm A")
                time
            });
        });

        socket.on('promise', (data) => {
            console.log('받은 약속 데이터:', data);
        });
    });
};