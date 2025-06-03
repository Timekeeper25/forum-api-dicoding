const CommentsHandlers = require('./handler');
const routes = require('./routes');

// In src/Interfaces/http/api/comments/index.js
module.exports = {
    name: 'comments',
    register: async (server, { container }) => {
        const commentsHandler = new CommentsHandlers(container);
        server.route(routes(commentsHandler));
    }
}
