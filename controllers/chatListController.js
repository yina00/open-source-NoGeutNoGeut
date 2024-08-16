const { format } = require('date-fns');
const moment = require('moment-timezone');
const sequelize = require("../config/database");
const Member = require('../models/member');
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
//const Promise = require("../models/promise");
const PromiseModel = require("../models/promise");
const Matching = require("../models/matching");

//채팅 리스트
exports.showChatRoomsList = async (req, res) => {

    const user = req.session.userID;
    if (!user) {
        console.error('사용자 ID가 세션에 저장되지 않았습니다.');
        return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    try {
        console.log("채팅 리스트 컨트롤러 작동 중");
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });

        let chatRooms;
        const userType = member.userType; // 사용자의 유형 가져오기
        let studentName;
        let seniorName;
        let seniorNum;
        let stdNum;
        let roomNum;

        if (userType === 'student') {
            // 사용자가 대학생인 경우
            chatRooms = await ChatRoom.findAll({
                where: {
                    stdNum: user // 대학생 번호와 일치하는 채팅방 조회
                },
                include: [
                    {
                        model: SeniorProfile, // SeniorProfile 모델과 연관된 정보 가져오기
                        attributes: ['seniorNum', 'seniorName', 'profileImage'], // 가져올 속성들
                    }
                ]
            });

            if (chatRooms.length > 0) {
                seniorName = SeniorProfile.seniorName;
                seniorNum = SeniorProfile.seniorNum;
                roomNum = chatRooms[0].roomNum; // roomNum 추출
            } else {
                return res.render('chat', { user: user });
            }
        } else if (userType === 'senior') {
            // 사용자가 노인인 경우
            chatRooms = await ChatRoom.findAll({
                where: { protectorNum: user },
                include: [
                    {
                        model: StudentProfile,
                        attributes: ['stdNum', 'profileImage'],
                        include: [
                            {
                                model: Member,
                                attributes: ['name'],
                            }
                        ]
                    }
                ]
            });
            if (chatRooms.length > 0) {
                const studentProfile = chatRooms[0].StudentProfile;

                // 명시적으로 StudentProfile과 연결된 Member 데이터를 조회
                if (studentProfile) {
                    const fullStudentProfile = await StudentProfile.findOne({
                        where: { stdNum: studentProfile.stdNum },
                        include: {
                            model: Member,
                            attributes: ['name'],
                        }
                    });

                    if (fullStudentProfile && fullStudentProfile.Member) {
                        studentName = fullStudentProfile.Member.name;
                        stdNum = fullStudentProfile.stdNum;
                    } else {
                        console.log('Member not found or not associated with StudentProfile');
                        studentName = 'No Name';  // 기본값 설정
                    }
                } else {
                    console.log('StudentProfile is null');
                    studentName = 'No Name';  // 기본값 설정
                }
                if (chatRooms.length > 0) {
                    roomNum = chatRooms[0].roomNum; // roomNum 추출
                } else {
                    return res.render('chat', { user: user });
                }
            }
        } else {
            return res.status(400).json({ error: '잘못된 사용자 역할입니다.' });
        }

        if (chatRooms.length === 0) {
            return res.status(400).json({ error: '채팅방을 찾을 수 없습니다.' });
        }
        // 채팅방에 대한 메시지 조회
        const chatRoom = chatRooms.find(room => room.dataValues.protectorNum === seniorNum);
        const messages = await Message.findAll({
            where: { roomNum: chatRoom ? chatRoom.roomNum : null },
            include: {
                model: PromiseModel,
                attributes: ['promiseNum', 'promiseDay', 'startTime', 'finishTime', 'stdNum', 'protectorNum', 'promiseTitle'],
                include: [
                    {
                        model: Matching,
                        attributes: ['depositStatus']
                    }
                ]
            }
        });

        console.log("Messages with Promise:", messages.filter(msg => msg.Promise));

        const formattedMessages = await Promise.all(messages.map(async (message, index) => {
            const promise = message.Promise;
            const currentDate = moment().tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd');
            const messageDate = moment(message.sendDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd');
            const previousMessageDate = index > 0 ? moment(messages[index - 1].sendDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd') : null;

            let dateSeparator = null;

            // 메시지 날짜와 이전 메시지 날짜 비교
            const shouldShowDateSeparator = (messageDate !== previousMessageDate);

            if (shouldShowDateSeparator) {
                dateSeparator = messageDate;
            }

            if (!promise) {
                console.log("No promise associated with this message");
                return {
                    ...message.toJSON(),
                    sendDay: moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후'),
                    dateSeparator: dateSeparator,
                    promiseInfo: null
                };
            }

            console.log("promise.promiseNum 확인", promise.promiseNum);
            let matching = null;

            if (promise.promiseNum) {
                matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });
                if (!matching) {
                    console.log(`No matching found for promiseNum: ${promise.promiseNum}`);
                }
            }

            const formattedDate = moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후');
            return {
                ...message.toJSON(),
                sendDay: formattedDate,
                dateSeparator: dateSeparator,
                promiseInfo: {
                    formattedPromiseDay: moment(promise.promiseDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일'),
                    formattedStartTime: moment(promise.startTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    formattedFinishTime: moment(promise.finishTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    depositStatus: matching ? matching.depositStatus : 'No matching record',
                    stdNum: promise.stdNum,
                    protectorNum: promise.protectorNum,
                    promiseTitle: promise.promiseTitle
                }
            };
        }));
        //console.log("proimseList roomNum 확인", roomNum);
        //console.log('chatRooms: ', chatRooms);
        console.log("userType 확인: ", userType);
        //console.log("Chat Rooms:", chatRooms);
        console.log("Formatted messages:", formattedMessages);

        if (chatRooms.length > 0) {
            console.log("StudentProfile:", chatRooms[0].StudentProfile);
            if (chatRooms[0].StudentProfile) {
                console.log("Member:", chatRooms[0].StudentProfile.Member);
            }
        }

        res.render('chatList', { user: user, chatRooms, roomNum, userType, messages: formattedMessages, studentName, stdNum, seniorName, seniorNum });
    } catch (error) {
        console.error('Error showing chatting list page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        console.log("getChatMessages 작동 중")
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType; // 사용자의 유형 가져오기

        const roomNum = req.params.roomNum;
        const chatRoom = await ChatRoom.findOne({ where: { roomNum: roomNum } });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        const seniorNum = chatRoom.protectorNum;
        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });

        if (!seniorProfile) {
            return res.status(400).json({ error: 'Senior profile not found' });
        }

        let name;

        if (user === chatRoom.stdNum) {
            // 사용자가 학생인 경우 보호자의 이름을 가져옴
            const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: chatRoom.protectorNum } });
            if (!seniorProfile) {
                return res.status(400).json({ error: 'Senior profile not found' });
            }
            name = seniorProfile.seniorName;
        } else if (user === chatRoom.protectorNum) {
            // 사용자가 보호자인 경우 학생의 이름을 가져옴
            const studentMember = await Member.findOne({ where: { memberNum: chatRoom.stdNum }, attributes: ['name'] });
            if (!studentMember) {
                return res.status(400).json({ error: 'Student not found' });
            }
            name = studentMember.name;
        } else {
            return res.status(400).json({ error: 'Invalid user for this chat room' });
        }

        const messages = await Message.findAll({
            where: { roomNum: chatRoom ? chatRoom.roomNum : null },
            include: {
                model: PromiseModel,
                attributes: ['promiseNum', 'promiseDay', 'startTime', 'finishTime', 'stdNum', 'protectorNum', 'promiseTitle'],
                include: [
                    {
                        model: Matching,
                        attributes: ['depositStatus']
                    }
                ]
            }
        });

        console.log("Messages with Promise:", messages.filter(msg => msg.Promise));


        const formattedMessages = await Promise.all(messages.map(async (message, index) => {
            const promise = message.Promise;
            const currentDate = moment().tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd');
            const messageDate = moment(message.sendDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd');
            const previousMessageDate = index > 0 ? moment(messages[index - 1].sendDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일 dddd') : null;

            let dateSeparator = null;

            // 메시지 날짜와 이전 메시지 날짜 비교
            const shouldShowDateSeparator = (messageDate !== previousMessageDate);

            if (shouldShowDateSeparator) {
                dateSeparator = messageDate;
            }
            if (!promise) {
                console.log("No promise associated with this message");
                return {
                    ...message.toJSON(),
                    sendDay: moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후'),
                    dateSeparator: dateSeparator,
                    promiseInfo: null
                };
            }

            console.log("promise.promiseNum 확인", promise.promiseNum);
            let matching = null;

            if (promise.promiseNum) {
                matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });
                if (!matching) {
                    console.log(`No matching found for promiseNum: ${promise.promiseNum}`);
                }
            }

            const formattedDate = moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후');
            return {
                ...message.toJSON(),
                sendDay: formattedDate,
                dateSeparator: dateSeparator,
                promiseInfo: {
                    formattedPromiseDay: moment(promise.promiseDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일'),
                    formattedStartTime: moment(promise.startTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    formattedFinishTime: moment(promise.finishTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    depositStatus: matching ? matching.depositStatus : 'No matching record',
                    promiseTitle: promise.promiseTitle
                }
            };
        }));


        console.log("messages 확인", messages);
        console.log("Formatted messages:", formattedMessages);


        res.json({ messages: formattedMessages, userType, name, roomNum });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
};

/*
exports.getChatMessages = async (req, res) => {
    try {
        console.log("getChatMessages 작동 중");
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType; // 사용자의 유형 가져오기

        const roomNum = req.params.roomNum;
        const chatRoom = await ChatRoom.findOne({ where: { roomNum: roomNum } });

        if (!chatRoom) {
            return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
        }

        let name;
        if (user === chatRoom.stdNum) {
            // 사용자가 학생인 경우 노인의 이름을 가져옴
            const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: chatRoom.protectorNum } });
            if (!seniorProfile) {
                return res.status(400).json({ error: '노인 프로필을 찾을 수 없습니다.' });
            }
            name = seniorProfile.seniorName;
        } else if (user === chatRoom.protectorNum) {
            // 사용자가 노인인 경우 학생의 이름을 가져옴
            const studentMember = await Member.findOne({ where: { memberNum: chatRoom.stdNum }, attributes: ['name'] });
            if (!studentMember) {
                return res.status(400).json({ error: '학생을 찾을 수 없습니다.' });
            }
            name = studentMember.name;
        } else {
            return res.status(400).json({ error: '이 채팅방에 대한 권한이 없습니다.' });
        }

        const messages = await Message.findAll({
            where: { roomNum: chatRoom.roomNum },
            include: {
                model: PromiseModel,
                attributes: ['promiseNum', 'promiseDay', 'startTime', 'finishTime', 'stdNum', 'protectorNum'],
                include: [
                    {
                        model: Matching,
                        attributes: ['depositStatus']
                    }
                ]
            }
        });

        console.log("Messages with Promise:", messages.filter(msg => msg.Promise));

        const formattedMessages = await Promise.all(messages.map(async message => {
            const promise = message.Promise;
            if (!promise) {
                console.log("No promise associated with this message");
                return {
                    ...message.toJSON(),
                    sendDay: moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후'),
                    promiseInfo: null
                };
            }

            console.log("promise.promiseNum 확인", promise.promiseNum);

            const matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });

            const formattedDate = moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후');
            return {
                ...message.toJSON(),
                sendDay: formattedDate,
                promiseInfo: {
                    formattedPromiseDay: moment(promise.promiseDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일'),
                    formattedStartTime: moment(promise.startTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    formattedFinishTime: moment(promise.finishTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    depositStatus: matching ? matching.depositStatus : '매칭 기록 없음'
                }
            };
        }));

        res.json({ messages: formattedMessages, userType, name, roomNum });
    } catch (error) {
        console.error('채팅 메시지를 가져오는 중 오류 발생:', error);
        res.status(500).json({ error: '채팅 메시지를 가져오는 데 실패했습니다.' });
    }
};
*/

exports.saveInChatMessage = async (req, res) => {
    try {
        console.log("saveInChatMessage 실행 중");
        const user = req.session.userID;
        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType; // 사용자의 유형 가져오기

        const roomNum = req.params.roomNum;
        const { msg, senderNum, time } = req.body;
        console.log("saveInChatMessage body 확인", req.body);

        // senderNum 값 확인
        if (!senderNum) {
            throw new Error('Sender number is missing');
        }

        console.log('Received data:', { senderNum, roomNum, msg, time });

        // ChatRoom에서 `roomNum`으로 채팅방을 찾습니다.
        const chatRoom = await ChatRoom.findOne({ where: { roomNum } });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        // 현재 사용자의 유형에 따라 receiverNum 결정
        console.log('User Type:', userType);
        console.log('Chat Room:', chatRoom);

        const receiverNum = (userType === 'student') ? chatRoom.protectorNum : chatRoom.stdNum;
        console.log('Receiver Number:', receiverNum);  // 디버깅용 로그

        // 메시지 저장
        const message = await Message.create({
            senderNum: senderNum,
            receiverNum: receiverNum,
            roomNum: roomNum,
            check: false,
            message: msg,
            sendDay: time
        });

        // 채팅방 정보 업데이트
        await ChatRoom.update({
            lastMessageContent: msg,
            lastMessageTime: message.sendDay,
            lastMessageID: message.messageID
        }, {
            where: { roomNum: roomNum }
        });

        res.status(200).json({
            message: 'Chat message saved successfully',
            data: message,
            roomNum: chatRoom.roomNum
        });
    } catch (error) {
        console.error('Error saving chat message:', error);
        res.status(500).json({ error: 'Failed to save chat message' });
    }
};