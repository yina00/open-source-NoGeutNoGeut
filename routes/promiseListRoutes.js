const express = require('express');
const router = express.Router();
const promiseListController = require("../controllers/promiseListController");

router.get('/', promiseListController.showPromisesList);
router.get('/matchingPromiseList', promiseListController.getMatchingPromises);
router.get('/notMatchingPromiseList', promiseListController.getNotMatchingPromises);
router.get('/:promiseNum/deposit', promiseListController.showPromiseDeposit);
router.post('/:promiseNum/deposit', promiseListController.confirmDeposit);
router.get('/:promiseNum/request', promiseListController.showPromiseConfirmation);
router.post('/:promiseNum/request/reject', promiseListController.rejectProfilePromise);
router.post('/:promiseNum/request/accept', promiseListController.acceptPromise);
router.get('/:promiseNum/request/:promiseSender', promiseListController.showProfileDetail);
router.get('/:promiseNum/deposit/:stdNum', promiseListController.showProfileDepoistDetail);

module.exports = router;