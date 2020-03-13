import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { checkJwt } from '../util/secrets';

export class GameRoutes {
  public router: Router;
  public gameController: GameController = new GameController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get(
      '/:queue/:tier/:division',
      checkJwt,
      this.gameController.getGame,
    );
  }
}
