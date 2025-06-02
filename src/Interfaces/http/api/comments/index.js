const CommentsHandlers = require('./handler');
const routes = require('./routes');

// In src/Interfaces/http/api/comments/index.js
module.exports = {
    name: 'comments',
    register: async (server, { container }) => {
        console.log('Registering comments plugin...');
        const commentsHandler = new CommentsHandlers(container);
        console.log('Comments handler created:', commentsHandler);
        server.route(routes(commentsHandler));
        console.log('Comments routes registered');
    }
}
