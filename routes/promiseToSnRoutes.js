const express = require('express');
const router = express.Router();
const stdPromiseController = require("../controllers/stdPromiseController");
const seniorPromiseController = require("../controllers/seniorPromiseController");
const promiseListController = require("../controllers/promiseListController");

//사용자 - 학생 / 상대방 - 노인프로필
router.get('/:seniorNum', seniorPromiseController.showSnProfilePromisePage);
router.post('/:seniorNum', seniorPromiseController.createSnProfilePromise);
router.get('/:seniorNum/:promiseNum', seniorPromiseController.showPromiseRequest);

module.exports = router;
