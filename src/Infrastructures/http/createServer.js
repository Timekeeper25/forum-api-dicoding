const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt')
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  await server.register([
    {
      plugin: Jwt,
      options: {
        
      }
    }
  ])

  server.auth.strategy('forumapi_jwt', 'jwt', {
   keys: process.env.ACCESS_TOKEN_KEY,
   verify: {
    aud: false,
    iss: false,
    sub: false,
    maxAgeSec: process.env.ACCESS_TOKEN_AGE,
   },
   validate: (artifacts) => ({
    isValid : true,
    credentials : {
      id: artifacts.decoded.payload.id,
    },
   }),
  });

  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    }
  ]);

// Add this to your createServer.js in the onPreResponse extension:

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // LOG THE ORIGINAL ERROR FIRST
      console.error('=== ORIGINAL ERROR ===');
      console.error('Error message:', response.message);
      console.error('Error stack:', response.stack);
      console.error('Error details:', response);
      
      // bila response tersebut error, tangani sesuai kebutuhan
      const translatedError = DomainErrorTranslator.translate(response);
      
      console.error('=== TRANSLATED ERROR ===');
      console.error('Translated error:', translatedError);
      console.error('Is ClientError:', translatedError instanceof ClientError);

      // penanganan client error secara internal.
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!translatedError.isServer) {
        console.log('Continuing with Hapi native error handling');
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      console.error('=== SERVER ERROR ===');
      console.error('Sending 500 response');
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  return server;
};

module.exports = createServer;
