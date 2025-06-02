const CommentsHandlers = require('./handler');
const routes = require('./routes');

module.exports = {
	name: 'comments',
	register: async (server, { container }) => {
		const commentsHandler = new CommentsHandlers(container);
		server.route(routes(commentsHandler));
	}
}
