import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {

    const User = sequelize.define('user', {

        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true,
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [7, 42],
            },
        },
        role: {
            type: DataTypes.STRING,
        },
    });

    User.associate = models => {
        User.hasMany(models.Message, { onDelete: 'CASCADE' });
    };

    User.findByLogin = async login => { // allow users to sign in via username or email

        let user = await User.findOne({
            where: { username: login },
        });

        if (!user) {
            user = await User.findOne({
                where: { email: login },
            });
        }

        return user;
    };

    User.prototype.generatePasswordHash = async function () { // cannot use ES6 syntax here
        let saltRounds = 10;

        return await bcrypt.hash(this.password, saltRounds);
    };

    User.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password); // use bcrypt to determine whether the passwords match
    };

    User.beforeCreate(async user => {
        user.password = await user.generatePasswordHash();
    });

    return User;
};
export default user;