const Member = require('../models/member');
const Post = require('../models/post');
const Board = require('../models/board');
const Comment = require('../models/comment');
const multer = require('multer');
const sequelize = require('../config/database');

async function fetchData(memberNum) {
    try {
        const users = await Member.findOne({ where: { memberNum: memberNum } });
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.renderCreatePost = async (req, res) => {
    const memberNum = req.session.userID;
    const user = await fetchData(memberNum);
    res.render('createPost' , { user } );
}

exports.createPost = async (req, res) => {
    try {
        // req.body에서 폼 데이터를 추출
        const { title, region, content } = req.body;

        // 세션에서 memberNum 추출
        const memberNum = req.session.userID;

        const regionToBoardID = {
            '서울시': 1,
            '경기도': 2,
            '충청남도': 3,
            '전라남도': 4,
            '전라북도': 5,
            '인천광역시': 6,
            '강원도': 7,
            '경상남도': 8,
            '경상북도': 9,
            '대전광역시': 10,
            '부산광역시': 11,
            '광주광역시': 12,
            '세종특별시': 13,
            '대구광역시': 14,
            '울산광역시': 15,
            '제주특별자치도': 16,
            '사담': 17
        };

        const boardID = regionToBoardID[region];

        // 새로운 포스트 생성
        const newPost = await Post.create({
            title: title,         // title 필드에 데이터 저장
            region: region,       // region 필드에 데이터 저장
            content: content,     // content 필드에 데이터 저장
            memberNum: memberNum, // memberNum 필드에 세션에서 가져온 데이터 저장
            boardID: boardID      // boardID 필드에 설정된 값 저장
        });

        res.redirect(`/postList/${boardID}`);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post.',
            error: error.message,
        });
    }
};

exports.viewPost = async (req, res) => {
    try {
        const memberNum = req.session.userID;
        const user = await fetchData(memberNum);
        
        const postID = req.params.id;

        const post = await Post.findOne({ 
            where: { postID : postID },
            include: [
                {
                    model: Member,
                    attributes: ['name']
                }
            ]
         });

        /*
        if (!post) {
            return res.status(404).render('404', { message: '게시글을 찾을 수 없습니다.' });
        }
        */

        const commentCount = await Comment.count({
            where: { postID: postID }
        });

        const comment = await Comment.findAll({
            where: { postID: postID,
                parentCommentID: null
            },
            include: [
            { model: Member, attributes: ['name'] },
            {
                model: Comment, as: 'Replies', // 답글 포함
                include: [{ model: Member, attributes: ['name'] }],
                separate: true, // Replies를 별도의 쿼리로 가져옴
                order: [['commentTime', 'ASC']] // 답글을 작성된 순서대로 정렬
            }
        ],
            order: [['commentTime', 'ASC']] // 댓글을 작성된 순서대로 정렬
        });

        res.render('viewPost', { post, comment, user, commentCount});
    } catch (error) {
        console.error('게시글 조회 중 오류 발생:', error);
        res.status(500).send('서버 오류');
    }
};

exports.createComment = async (req, res) => {
    try {
        const postID = req.params.id;
        const { content } = req.body;
        const memberNum = req.session.userID;

        const newComment = await Comment.create({
            content: content,
            memberNum: memberNum,
            postID: postID
        });

        res.redirect(`/post/${postID}`);
    } catch (error) {
        console.error('댓글 작성 중 오류 발생:', error);
        res.status(500).send('서버 오류');
    }
};

// 댓글에 답글 작성
exports.createReply = async (req, res) => {
    try {
        const postID = req.params.id;
        const commentID = req.params.commentID;
        const { content } = req.body;
        const memberNum = req.session.userID;

        const newReply = await Comment.create({
            content: content,
            memberNum: memberNum,
            postID: postID,
            parentCommentID: commentID
        });

        res.redirect(`/post/${postID}`);
    } catch (error) {
        console.error('답글 작성 중 오류 발생:', error);
        res.status(500).send('서버 오류');
    }
};


//마이페이지에서 작성한 게시글, 댓글 조회
exports.renderCreatedList = async (req, res) => {
    const memberNum = req.session.userID;
    const user = await fetchData(memberNum);
    res.render('createdList', { user });
};

exports.renderCreatedPostList = async (req, res) => {
    try {
        const memberNum = req.session.userID;
        const user = await fetchData(memberNum);

        // 페이지네이션을 위한 변수 설정
        const page = parseInt(req.query.page) || 1; // 현재 페이지 (쿼리 파라미터에서 가져옴, 기본값 1)
        const pageSize = 10; // 페이지당 표시할 게시글 수

        // 게시글 조회
        const { rows: post, count: totalPosts } = await Post.findAndCountAll({
            where: { memberNum: memberNum },
            include: [
                {
                    model: Member,
                    attributes: ['name']
                },
                {
                    model: Board,
                    attributes: ['boardName']
                }
            ],
            limit: pageSize, // 페이지 사이즈만큼 제한
            offset: (page - 1) * pageSize, // 건너뛸 게시글 수 계산
            order: [['creationDate', 'DESC']] // 최신 게시글부터 정렬
        });

        // 총 페이지 수 계산
        const totalPages = Math.ceil(totalPosts / pageSize);

        res.render('createdPostList', {
            user,
            post,
            postCount: totalPosts,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 에러');
    }
};

exports.renderCreatedCommentList = async (req, res) => {
    try {
        const memberNum = req.session.userID;
        const user = await fetchData(memberNum);

        // 페이지네이션을 위한 변수 설정
        const page = parseInt(req.query.page) || 1; // 현재 페이지 (쿼리 파라미터에서 가져옴, 기본값 1)
        const pageSize = 10; // 페이지당 표시할 댓글 수

        // 댓글 조회 (페이지네이션 포함)
        const { rows: comment, count: totalComments } = await Comment.findAndCountAll({
            where: { memberNum: memberNum },
            include: [
                {
                    model: Member,
                    attributes: ['name']
                },
                {
                    model: Post,
                    attributes: ['boardID'],
                    include: [{
                        model: Board,
                        attributes: ['boardName']
                    }]
                }
            ],
            limit: pageSize, // 페이지 사이즈만큼 제한
            offset: (page - 1) * pageSize, // 건너뛸 댓글 수 계산
            order: [['commentTime', 'DESC']] // 최신 댓글부터 정렬
        });

        // 총 페이지 수 계산
        const totalPages = Math.ceil(totalComments / pageSize);

        res.render('createdCommentList', {
            user,
            comment,
            commentCount: totalComments,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 에러');
    }
};
