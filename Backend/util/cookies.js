const getJwtToken = require("../Token/jwt")

const cookieToken = (user, res) => {
    const token = getJwtToken.jwtToken(user.id);

    const isProduction = process.env.NODE_ENV === 'production';

    const option = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    }

    user.password = undefined;

    res.cookie('token', token, option);
    return token;
}

module.exports = cookieToken
