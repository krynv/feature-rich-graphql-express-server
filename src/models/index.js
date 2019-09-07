import Sequelize from 'sequelize';
import 'dotenv/config'; // so we can use environment variables from our .env file


let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        operatorsAliases: Sequelize.Op
    });
} else {
    sequelize = new Sequelize(
        process.env.TEST_DATABASE || process.env.DATABASE,
        process.env.DATABASE_USER,
        process.env.DATABASE_PASSWORD,
        {
            dialect: 'postgres',
            operatorsAliases: Sequelize.Op
        },
    );
}

const models = {
    User: sequelize.import('./user'),
    Message: sequelize.import('./message'),
};

Object.keys(models).forEach(key => {

    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;