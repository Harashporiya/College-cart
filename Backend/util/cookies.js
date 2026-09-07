const getJwtToken = require("../Token/jwt")

const cookieToken = (user, res) => {
    const token = getJwtToken.jwtToken(user.id);

    const isProduction = process.env.NODE_ENV === 'production';

    const option = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        // This was spelled `sameite: "Strict"` - not a real cookie option, so
        // it was ignored and the browser fell back to its default.
        //
        // The frontend and API are served from different origins in
        // production, which makes this a cross-site cookie: it needs
        // SameSite=None *and* Secure to be stored at all. Locally the API is
        // plain HTTP, where SameSite=None without Secure is rejected, so dev
        // uses Lax.
        sameSite: isProduction ? 'none' : 'lax',
    }

    // Never let the password hash reach the response body.
    user.password = undefined;

    res.cookie('token', token, option);
    return token;
}

module.exports = cookieToken
