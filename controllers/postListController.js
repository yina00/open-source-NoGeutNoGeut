const SeniorProfile = require('../models/seniorProfile');
const Member = require('../models/member');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const fs = require('fs').promises;
const Board = require('../models/board');
const Post = require('../models/post');

async function fetchData(userID) {
    try {
        const users = await Member.findOne({ where: { memberNum: userID } });
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchOneBoard(boardID) {
    try {
        const boards = await Board.findOne({ where: { boardID: boardID } });
        return boards;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getBoardsAndPost = async (req, res) => {
    try {
        const userId = req.session.userID;
        const user = await fetchData(userId);
        const boardID = req.params.boardID;
        const board = await fetchOneBoard(boardID);
        const boards = await Board.findAll();

        // 페이지와 페이지당 게시글 수를 설정합니다.
        const page = parseInt(req.query.page) || 1; // 현재 페이지
        const limit = 10; // 한 페이지에 표시할 게시글 수
        const offset = (page - 1) * limit; // 게시글 시작 위치

        const posts = await Post.findAndCountAll({
            where: { boardID: boardID },
            order: [['creationDate', 'DESC']],
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(posts.count / limit); // 총 페이지 수

        res.render('postList', {
            boards: boards,
            posts: posts.rows,
            user: user,
            currentPage: page,
            totalPages: totalPages,
            board: board
        });
    } catch (error) {
        console.error(error);
        throw error;
    }

}

exports.searchPost = async (req, res) => {
    try {
        const userId = req.session.userID;
        const query = req.query.word; // 검색어를 받습니다.
        const boardID = req.params.boardID;

        const user = await fetchData(userId);
        const board = await fetchOneBoard(boardID);
        const boards = await Board.findAll();

        // 페이지와 페이지당 게시글 수를 설정합니다.
        const page = parseInt(req.query.page) || 1; // 현재 페이지
        const limit = 10; // 한 페이지에 표시할 게시글 수
        const offset = (page - 1) * limit; // 게시글 시작 위치

        const posts = await Post.findAndCountAll({
            where:{
                boardID: boardID ,
                title:{
                    [Op.like]: "%" + query + "%"
                }
            },
            order: [['creationDate', 'DESC']],
            limit: limit,
            offset: offset
        });
        const totalPages = Math.ceil(posts.count / limit); // 총 페이지 수

        res.render('postList', {
            boards: boards,
            posts: posts.rows,
            user: user,
            currentPage: page,
            totalPages: totalPages,
            board: board
        });
 

    } catch { }
}