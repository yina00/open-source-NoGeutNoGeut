const { format } = require('date-fns');
const moment = require('moment-timezone');
const sequelize = require("../config/database");
//const Promise = require("../models/promise");
const PromiseModel = require("../models/promise");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
const Member = require('../models/member');
const Matching = require("../models/matching");
require('moment/locale/ko'); // 한국어 로케일을 로드

// 노인프로필과 채팅
exports.showChatRooms = async (req, res) => {

    const user = req.session.userID;
    if (!user) {
        console.error('사용자 ID가 세션에 저장되지 않았습니다.');
        return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    try {
        console.log("학생프로필과 채팅 실행 중")
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType; // 사용자의 유형 가져오기
        const studentNum = Number(req.params.stdNum); // 숫자로 변환
        console.log('stdNum: ', studentNum);

        console.log('채팅방 렌더링 userId: ', user);
        // studentNum이 유효한 숫자인지 확인
        if (isNaN(studentNum)) {
            return res.status(400).json({ error: 'Invalid student number.' });
        }

        const studentProfile = await StudentProfile.findOne({ where: { stdNum: studentNum } });

        if (!studentProfile) {
            return res.status(400).json({ error: '학생 정보를 찾을 수 없습니다.' });
        }

        // studentNum을 사용하여 Member 테이블에서 name을 직접 조회 (안전하게 처리)
        const memberName = await Member.findOne({
            where: { memberNum: studentNum },
            attributes: ['name']
        });

        const studentName = memberName ? memberName.name : null;

        const chatRooms = await ChatRoom.findAll({
            where: { protectorNum: user },
            include: [
                {
                    model: StudentProfile,
                    attributes: ['stdNum', 'profileImage'],
                    include: [
                        {
                            model: Member,
                            attributes: ['name'], // 학생의 이름 가져오기
                        }
                    ]
                }
            ]
        });


        const chatRoom = chatRooms.find(room => room.dataValues.stdNum === studentNum);
        const roomNum = chatRoom ? chatRoom.roomNum : null;

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
                    sendDate: messageDate,
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
                    formattedPromiseDay: moment(message.Promise.promiseDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일'),
                    formattedStartTime: moment(message.Promise.startTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    formattedFinishTime: moment(message.Promise.finishTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    stdNum: promise.stdNum,
                    protectorNum: promise.protectorNum,
                    depositStatus: matching ? matching.depositStatus : null, // depositStatus 추가
                    promiseTitle: promise.promiseTitle
                }
            };
            console.log("formattedDate 확인", formattedDate);
        }));
        console.log('채팅방 렌더링');
        res.render('chatToStudent', { studentProfile, user: user, chatRooms, roomNum, userType, messages: formattedMessages, studentName });
    } catch (error) {
        console.error('Error showing chatting page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};

// 새로운 사람과 채팅
exports.saveChatMessage = async (req, res) => {
    try {
        console.log('채팅방 생성 및 메세지 저장');
        const user = req.session.userID;
        const { stdNum, roomNum } = req.params;

        console.log('파라미터값확인', req.params);
        console.log('채팅방 생성 및 메세지 저장 User ID:', user); // user 변수 확인

        const { msg, num, time } = req.body;

        console.log('msg: ', msg);
        console.log('time: ', time);

        const studentProfile = await StudentProfile.findOne({ where: { stdNum: stdNum } });
        const roomName = studentProfile.studentName;

        console.log('어디서');
        const transaction = await sequelize.transaction();

        // 채팅방이 존재하는지 확인합니다.
        let chatRoom = await ChatRoom.findOne({
            where: {
                protectorNum: user,
                stdNum: stdNum
            }
        }, { transaction });

        let message;

        // 채팅방이 없으면 새로 생성합니다.
        if (!chatRoom) {
            chatRoom = await ChatRoom.create({
                roomName,
                protectorNum: user,
                stdNum: stdNum,
                lastMessageContent: msg,
                lastMessageTime: time,
                lastMessageID: null // 초기 값은 null
            }, { transaction });

            message = await Message.create({
                senderNum: user,
                receiverNum: stdNum,
                roomNum: chatRoom.roomNum,
                check: false,
                message: msg
            }, { transaction });

            // 채팅방 업데이트: lastMessageID 업데이트
            await ChatRoom.update({
                lastMessageID: message.messageID
            }, {
                where: { roomNum: chatRoom.roomNum },
                transaction
            });

        } else {
            // 새로운 메시지 생성
            message = await Message.create({
                senderNum: user,
                receiverNum: stdNum,
                roomNum: chatRoom.roomNum,
                check: false,
                message: msg
            }, { transaction });

            // 채팅방이 존재하면 채팅방 정보를 업데이트합니다.
            await ChatRoom.update({
                lastMessageContent: msg,
                lastMessageTime: message.sendDay,
                lastMessageID: message.messageID
            }, {
                where: { roomNum: chatRoom.roomNum },
                transaction
            });
        }

        await transaction.commit();

        // 성공적으로 저장된 경우
        res.status(200).json({ message: 'Chat message saved successfully', data: message, roomNum });
    } catch (error) {
        console.error('Error saving chat message:', error);
        res.status(500).json({ error: 'Failed to save chat message' });
    }
};

// 특정 채팅방의 메시지 가져오기
exports.getChatMessages = async (req, res) => {
    try {
        console.log("특정 채팅방의 메시지 가져오기 실행 중");
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });

        const roomNum = req.params.roomNum;
        const chatRoom = await ChatRoom.findOne({ where: { roomNum: roomNum } });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        const studentNum = chatRoom.stdNum;
        const studentProfile = await StudentProfile.findOne({ where: { stdNum: studentNum } });

        if (!studentProfile) {
            return res.status(400).json({ error: 'Student profile not found' });
        }

        // studentNum을 사용하여 Member 테이블에서 name을 직접 조회 (안전하게 처리)
        const memberName = await Member.findOne({
            where: { memberNum: studentNum },
            attributes: ['name']
        });

        const studentName = memberName ? memberName.name : null;

        console.log("studentName 확인 ", studentName);
        const userType = member.userType;
        console.log("userType 확인 ", userType);
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
        res.json({ messages: formattedMessages, userType, studentName, roomNum });

    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
};

exports.saveInChatMessage = async (req, res) => {
    try {
        console.log("saveInChatMessage 실행 중");
        const user = req.session.userID;
        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType;

        const roomNum = req.params.roomNum;
        const { msg, senderNum, time } = req.body;
        console.log("saveInChatMessage body 확인", req.body);

        if (!senderNum) {
            throw new Error('Sender number is missing');
        }

        console.log('Received data:', { senderNum, roomNum, msg, time });

        const chatRoom = await ChatRoom.findOne({ where: { roomNum } });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        const receiverNum = (userType === 'senior') ? chatRoom.stdNum : chatRoom.protectorNum;
        console.log('Receiver Number:', receiverNum);

        const message = await Message.create({
            senderNum: senderNum,
            receiverNum: receiverNum,
            roomNum: roomNum,
            check: false,
            message: msg,
            sendDay: time
        });

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