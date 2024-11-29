import { Request, Response } from 'express';
import BetService from '../../core/services/betService';

class BetController {
  private betService: BetService;

  constructor() {
    this.betService = new BetService();
  }

  public placeBet = async (req: Request, res: Response): Promise<void> => {
    const { userId, gameId, amount } = req.body;

    try {
      const bet = await this.betService.placeBet(userId, gameId, amount);
      res.status(201).json({ message: 'Bet placed successfully', bet });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public cashoutBet = async (req: Request, res: Response): Promise<void> => {
    const { betId, cashoutMultiplier } = req.body;

    try {
      const winnings = await this.betService.cashoutBet(betId, cashoutMultiplier);
      res.status(200).json({ message: 'Cashout successful', winnings });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default BetController;
