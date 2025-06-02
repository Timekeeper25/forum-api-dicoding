/* eslint-disable camelcase */

exports.up = pgm => {
	pgm.createTable('comments', {
	  id: {
		type: 'SERIAL',
		primaryKey: true
	  },
	  content: {
		type: 'TEXT',
		notNull: true
	  },
	  threadId: {
		type: 'INTEGER',
		notNull: true,
		references: '"threads"',
		onDelete: 'CASCADE'
	  },
	  owner: {
		type: 'VARCHAR(50)',
		notNull: true
	  }
	});
  };
  
exports.down = pgm => {
	pgm.dropTable('comments');
};