const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

class LoginError extends Error {
    constructor(message, type) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.type = type
    }
}

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'please enter an e-mail'],
        unique: true,
        trim: true,
        validate: [isEmail, 'please enter a valid e-mail']
    },
    password: {
        type: String,
        required: [true, 'pleas enter a password'],
        minlength: [6, 'password min lenght must be 6']
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email })
    if (!user) throw new LoginError('user not found', 'email');

    const data = await bcrypt.compare(password, user.password);
    if (!data) throw new LoginError('password is incorrect', 'password');

    return user._id;
}

const User = model('user', userSchema);

module.exports = User