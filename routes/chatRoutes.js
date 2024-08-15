const express = require('express');
const router = express.Router();
const chatToSeniorController = require('../controllers/chatToSeniorController');
const chatToStudentController = require('../controllers/chatToStudentController');  // 새로 추가된 컨트롤러
const chatListController = require('../controllers/chatListController');

//채팅 목록 관련 코드
router.get('/', chatListController.showChatRoomsList);
router.get('/chatList/room/:roomNum', chatListController.getChatMessages);
router.post('/chatList/room/:roomNum', chatListController.saveInChatMessage);

// 기존 노인과의 채팅 관련 라우트
router.get('/toSenior/:seniorNum', chatToSeniorController.showChatRooms);
router.post('/toSenior/:seniorNum/save', chatToSeniorController.saveChatMessage);
router.get('/seniorRoom/:roomNum', chatToSeniorController.getChatMessages);
router.post('/seniorRoom/:roomNum', chatToSeniorController.saveInChatMessage);

// 학생과의 채팅 관련 라우트 추가
router.get('/toStudent/:stdNum', chatToStudentController.showChatRooms);
router.post('/toStudent/:stdNum/save', chatToStudentController.saveChatMessage);
router.get('/stdRoom/:roomNum', chatToStudentController.getChatMessages);
router.post('/stdRoom/:roomNum', chatToStudentController.saveInChatMessage);

module.exports = router;
