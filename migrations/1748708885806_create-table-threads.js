/* eslint-disable camelcase */

exports.up = pgm => {
	pgm.createTable('threads', {
	  id: {
		type: 'SERIAL',
		primaryKey: true
	  },
	  title: {
		type: 'VARCHAR(255)',
		notNull: true
	  },
	  body: {
		type: 'TEXT',
		notNull: true
	  },
	  owner: {
		type: 'VARCHAR(50)',
		notNull: true
	  }
	});
  };
  
exports.down = pgm => {
	pgm.dropTable('threads');
};