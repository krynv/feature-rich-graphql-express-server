let messages = {
    1: {
        id: '1',
        text: 'Hello World',
        userId: '1',
    },
    2: {
        id: '2',
        text: 'Bye World',
        userId: '2',
    },
};

let users = {
    1: {
        id: '1',
        username: 'John Appleseed',
        messageIds: [1],
    },
    2: {
        id: '2',
        username: 'Chuck Norris',
        messageIds: [2],
    },
};

export default {
    users,
    messages,
}