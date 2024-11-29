import express, { Router } from 'express';
import BetController from './controllers/betController';

class ApiRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const betController = new BetController();

    this.router.post('/bet', betController.placeBet);
    this.router.post('/cashout', betController.cashoutBet);
  }
}

export default ApiRouter;
