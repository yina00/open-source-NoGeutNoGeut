const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Member = require('./member');
const StudentProfile = require('./studentProfile');
const ChatRoom = require('./chatRoom');
const Message = require('./message');
const SeniorProfile = require('./seniorProfile');
const Matching = require('./matching');
const Promise = require('./promise');
const Review = require('./review');
const InterestField = require('./interestField');
const Report = require('./report');
const Comment = require('./comment');
const Pick = require('./pick');
const BulletinBoard = require('./bulletinBoard');
const Post = require('./post');

// 관계 설정
Member.hasOne(StudentProfile, { foreignKey: 'member_num' });
StudentProfile.belongsTo(Member, { foreignKey: 'member_num' });

Member.hasOne(SeniorProfile, { foreignKey: 'member_num' });
SeniorProfile.belongsTo(Member, { foreignKey: 'member_num' });

StudentProfile.hasMany(ChatRoom, { foreignKey: 'student_num' });
ChatRoom.belongsTo(StudentProfile, { foreignKey: 'student_num' });

StudentProfile.hasMany(ChatRoom, { foreignKey: 'guardian_num' });
ChatRoom.belongsTo(StudentProfile, { foreignKey: 'guardian_num' });

Member.hasMany(Message, { foreignKey: 'sender_num' });
Message.belongsTo(Member, { foreignKey: 'sender_num' });

Member.hasMany(Message, { foreignKey: 'receiver_num' });
Message.belongsTo(Member, { foreignKey: 'receiver_num' });

ChatRoom.hasMany(Message, { foreignKey: 'chat_room_num' });
Message.belongsTo(ChatRoom, { foreignKey: 'chat_room_num' });

Promise.belongsTo(ChatRoom, { foreignKey: 'chat_room_num' });
ChatRoom.hasMany(Promise, { foreignKey: 'chat_room_num' });

Member.hasMany(Promise, { foreignKey: 'student_num' });
Promise.belongsTo(Member, { foreignKey: 'student_num' });

Member.hasMany(Promise, { foreignKey: 'guardian_num' });
Promise.belongsTo(Member, { foreignKey: 'guardian_num' });

Promise.hasOne(Matching, { foreignKey: 'promise_num' });
Matching.belongsTo(Promise, { foreignKey: 'promise_num' });

Report.hasMany(Matching, { foreignKey: 'report_num' });
Matching.belongsTo(Report, { foreignKey: 'report_num' });

Matching.hasMany(Review, { foreignKey: 'matching_num' });
Review.belongsTo(Matching, { foreignKey: 'matching_num' });

Member.hasMany(Review, { foreignKey: 'review_writer' });
Review.belongsTo(Member, { foreignKey: 'review_writer' });

Member.hasMany(Review, { foreignKey: 'review_receiver' });
Review.belongsTo(Member, { foreignKey: 'review_receiver' });

Member.hasMany(InterestField, { foreignKey: 'member_num' });
InterestField.belongsTo(Member, { foreignKey: 'member_num' });

Member.hasMany(Comment, { foreignKey: 'member_num' });
Comment.belongsTo(Member, { foreignKey: 'member_num' });

Post.hasMany(Comment, { foreignKey: 'post_num' });
Comment.belongsTo(Post, { foreignKey: 'post_num' });

BulletinBoard.hasMany(Post, { foreignKey: 'bulletinboard_num' });
Post.belongsTo(BulletinBoard, { foreignKey: 'bulletinboard_num' });

Member.hasMany(Post, { foreignKey: 'member_num' });
Post.belongsTo(Member, { foreignKey: 'member_num' });

Member.hasMany(Pick, { foreignKey: 'student_num' });
Pick.belongsTo(Member, { foreignKey: 'student_num' });

Member.hasMany(Pick, { foreignKey: 'guardian_num' });
Pick.belongsTo(Member, { foreignKey: 'guardian_num' });

module.exports = {
  sequelize,
  Sequelize,
  Member,
  StudentProfile,
  ChatRoom,
  Message,
  SeniorProfile,
  Matching,
  Promise,
  Review,
  InterestField,
  Report,
  Comment,
  Pick,
  BulletinBoard,
  Post,
};