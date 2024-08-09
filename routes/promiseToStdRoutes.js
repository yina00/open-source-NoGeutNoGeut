const express = require('express');
const router = express.Router();
const stdPromiseController = require("../controllers/stdPromiseController");
const seniorPromiseController = require("../controllers/seniorPromiseController");
const promiseListController = require("../controllers/promiseListController");

//사용자 - 노인프로필 / 상대방 - 학생
router.get('/:stdNum', stdPromiseController.showStdProfilePromisePage);
router.post('/:stdNum', stdPromiseController.createStdProfilePromise);
router.get('/:stdNum/:promiseNum', stdPromiseController.showPromiseRequest);

module.exports = router;