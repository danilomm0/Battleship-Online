const User = require('../../models/User')


/**
 * update WL of user
 * 
 * @param {String} username - username were searching for
 * @param {*} status - 0 for a loss, 1 for a win.
 */
const updateWL = async (username, status) => {
    try {
        const user = await User.findOne({ username });

        if (status === 1) {
            user.wins += 1;
        } else {
            user.losses += 1;
        }

        await user.save();
    } catch (err) {
        console.error(`Error updating user WL: ${err.message}`);
    }
};


module.exports = {
    updateWL,
};
