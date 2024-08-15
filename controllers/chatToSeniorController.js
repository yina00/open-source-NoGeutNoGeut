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

//노인프로필과 채팅
exports.showChatRooms = async (req, res) => {
    try {
        const user = req.session.userID;

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });
        const userType = member.userType; // 사용자의 유형 가져오기
        //const seniorNum = req.params.seniorNum;
        const seniorNum = Number(req.params.seniorNum); // 숫자로 변환
        console.log("seniorNum 확인", seniorNum);
        console.log('채팅방 렌더링 userId: ', user);
        // seniorNum이 유효한 숫자인지 확인
        if (isNaN(seniorNum)) {
            return res.status(400).json({ error: 'Invalid senior number.' });
        }


        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });

        if (!seniorProfile) {
            return res.status(400).json({ error: '노인 정보를 찾을 수 없습니다.' });
        }

        const chatRooms = await ChatRoom.findAll({
            where: { stdNum: user },
            include: [
                {
                    model: SeniorProfile,
                    as: 'SeniorProfile',
                    attributes: ['seniorNum', 'seniorName', 'profileImage']
                }
            ]
        });

        // 로그 추가: chatRooms의 내용을 확인
        //console.log('Chat Rooms:', chatRooms);

        // 채팅방에 대한 메시지 조회
        const chatRoom = chatRooms.find(room => room.dataValues.protectorNum === seniorNum);
        const roomNum = chatRoom ? chatRoom.roomNum : null // roomNum만 따로 전달

        //console.log('Chat Room:', chatRoom);
        //console.log('Chat Room Number:', chatRoom ? chatRoom.roomNum : 'No Chat Room Found');

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

        //console.log('Fetched Messages:', messages);

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
                    depositStatus: matching ? matching.depositStatus : null,
                    promiseTitle: promise.promiseTitle
                }
            };
        }));

        console.log('채팅방 렌더링');
        //res.render('chatToSenior', { seniorProfile, user: user, chatRooms });
        res.render('chatToSenior', { seniorProfile, user: user, chatRooms, roomNum, userType, messages: formattedMessages });
    } catch (error) {
        console.error('Error showing chatting page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};


/*
//db에 채팅방 정보 저장
exports.createChatRoom= async (req, res) => {
    try {
        //const stdNum = req.params.stdNum;
        const seniorNum = req.params.seniorNum;
        const user = req.session.userID;

        console.log("채팅방 생성");

        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });
        const roomName = seniorProfile.seniorName;

        const chatRoom = await ChatRoom.create({
            roomName,
            stdNum: user,
            protectorNum: seniorNum,
        });

        console.log("채팅방 생성 완료:", chatRoom);
        res.status(201).json({ roomNum: chatRoom.roomNum });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: '약속을 작성하는 동안 오류가 발생하였습니다.' });
    }
}
*/

//새로운 사람과 채팅
exports.saveChatMessage = async (req, res) => {
    try {
        console.log('채팅방 생성 및 메세지 저장');
        const user = req.session.userID;
        const { seniorNum, roomNum } = req.params;

        console.log('파라미터값확인', req.params)
        console.log('채팅방 생성 및 메세지 저장 User ID:', user); // user 변수 확인

        const { msg, num, time } = req.body;

        console.log('msg: ', msg);
        console.log('time: ', time);

        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });
        const roomName = seniorProfile.seniorName;

        console.log('어디서')
        const transaction = await sequelize.transaction();

        // 채팅방이 존재하는지 확인합니다.
        let chatRoom = await ChatRoom.findOne({
            where: {
                stdNum: user,
                protectorNum: seniorNum
            }
        }, { transaction });

        let message;

        // 채팅방이 없으면 새로 생성합니다.
        if (!chatRoom) {
            chatRoom = await ChatRoom.create({
                roomName,
                stdNum: user,
                protectorNum: seniorNum,
                lastMessageContent: msg,
                lastMessageTime: time, // 또는 message.createdAt 사용
                lastMessageID: null // 초기 값은 null
            }, { transaction });

            message = await Message.create({
                senderNum: user,
                receiverNum: seniorNum,
                roomNum: chatRoom.roomNum, // 새로 생성된 채팅방의 roomNum을 사용
                check: false,
                message: msg
            }, { transaction });

            // 채팅방 업데이트: lastMessageID 업데이트
            await ChatRoom.update({
                lastMessageID: message.messageId
            }, {
                where: { roomNum: chatRoom.roomNum },
                transaction
            });

        } else {
            // 새로운 메시지 생성
            message = await Message.create({
                senderNum: user,
                receiverNum: seniorNum,
                roomNum: chatRoom.roomNum,
                check: false,
                message: msg
            }, { transaction });

            // 채팅방이 존재하면 채팅방 정보를 업데이트합니다.
            await ChatRoom.update({
                lastMessageContent: msg,
                lastMessageTime: message.sendDay, // 또는 message.createdAt 사용
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
/*
exports.getChatMessages = async (req, res) => {
    try {
        const user = req.session.userID

        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const member = await Member.findOne({ where: { memberNum: user } });

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

        const seniorName = seniorProfile.seniorName;
        const userType = member.userType; // 사용자의 유형 가져오기
        // 특정 채팅방의 메시지들을 불러옴
        const messages = await Message.findAll({
            where: { roomNum: roomNum },
            include: {
                model: Promise,
                attributes: ['promiseDay', 'startTime', 'finishTime']
            }
            //order: [['sendDay', 'ASC']] // 메시지를 보낸 시간 기준으로 오름차순 정렬
        });

        // 모든 메시지의 promiseNum에 대한 매칭 정보를 불러오기 위해 Promise.all 사용
        const formattedMessages = await Promise.all(messages.map(async message => {
            const promise = message.Promise;
            let matching = null;

            if (promise && promise.promiseNum) {
                // promiseNum을 사용하여 Matching을 조회
                matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });
            }

            const formattedDate = moment(message.sendDay).tz('Asia/Seoul').format('A hh:mm').replace('AM', '오전').replace('PM', '오후');
            return {
                ...message.toJSON(),
                sendDay: formattedDate,
                promiseInfo: promise ? {
                    formattedPromiseDay: moment(promise.promiseDay).tz('Asia/Seoul').format('YYYY년 MM월 DD일'),
                    formattedStartTime: moment(promise.startTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    formattedFinishTime: moment(promise.finishTime, 'HH:mm').format('A h시 mm분').replace('AM', '오전').replace('PM', '오후'),
                    depositStatus: matching ? matching.depositStatus : null // 매칭 정보에서 depositStatus 추가
                } : null
            };
        }));

        res.json({ messages: formattedMessages, userType, seniorName, roomNum });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
};
*/
exports.getChatMessages = async (req, res) => {
    try {
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

        const seniorNum = chatRoom.protectorNum;
        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });

        if (!seniorProfile) {
            return res.status(400).json({ error: 'Senior profile not found' });
        }

        const seniorName = seniorProfile.seniorName;
        const userType = member.userType; // 사용자의 유형 가져오기

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



        res.json({ messages: formattedMessages, userType, seniorName, roomNum });
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