import express from 'express';
import mongoose from 'mongoose';
import 'reflect-metadata';
require('dotenv').config();

import compression from 'compression';
import cors from 'cors';

import { MONGODB_URI, checkJwt, corsOptions } from './util/secrets';

import { GameRoutes } from './routes/game.routes';
import { UserRoutes } from './routes/user.routes';

import { LogService } from './services/log.service';

class Server {
  public app: express.Application;
  protected logService: LogService = new LogService();

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use('/api/users', new UserRoutes().router);
    this.app.use('/api/games', new GameRoutes().router);
  }

  public config(): void {
    this.app.use(cors(corsOptions));
    // check if we want to disable the JWT requirement
    if (
      process.env.OFFLINE_MODE !== 'true' &&
      process.env.DISABLE_JWT !== 'true'
    ) {
      this.app.use(checkJwt);
    }
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    // log all api calls
    this.app.use((req, res, next) => {
      // log the call through the service
      this.logService.logApiCall(req.originalUrl, req.hostname);
      next();
    });
    this.app.use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).send({ message: err.message });
        // logger.error(err);
        return;
      }
      next();
    });
  }

  private mongo() {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    const connection = mongoose.connection;
    connection.on('connected', () => {
      console.log('  Mongo Connection Established');
    });
    connection.on('reconnected', () => {
      console.log('  Mongo Connection Reestablished');
    });
    connection.on('disconnected', () => {
      console.log('Mongo Connection Disconnected');
      console.log('Trying to reconnect to Mongo ...');
      setTimeout(() => {
        mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
      }, 3000);
    });
    connection.on('close', () => {
      console.log('  Mongo Connection Closed');
    });
    connection.on('error', (error: Error) => {
      console.error('  Mongo Connection ERROR: ' + error);
    });

    const run = async () => {
      await mongoose.connect(MONGODB_URI, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get('port'), () => {
      console.log(
        '  API is running at http://localhost:%d',
        this.app.get('port'),
      );
    });
  }
}

const server = new Server();

server.start();
