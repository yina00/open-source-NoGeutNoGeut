const Member = require("../models/member");

async function fetchData(userID) {
    try {
        const users = await Member.findOne({ where: { memberNum: userID } });
        if (users) {
            if (users.name) {
                console.log("회원 있다있어!!!!!!!!!!!!!!");
            }
            else {
                console.log("회원 없어!!!!!!!");
            }
        }
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.create = async (req, res) => {
    try {
        if (req.session.user) {
            const userType = req.session.userType;
            console.log('Creation page accessed by user:', req.session.user);
            res.render('nonProfile', { user: req.session.user, userType: userType });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

