import RedisCache from '../../db/infra/redis';
import Bet from '../../db/models/Bet';
import GameService from './gameService';

class BetService {
  private cache: RedisCache;

  constructor() {
    this.cache = new RedisCache();
  }

  /**
   * Place a new bet.
   * @param userId - ID of the user placing the bet.
   * @param gameId - ID of the game.
   * @param amount - Amount of the bet.
   * @returns The created bet document.
   */
  public async placeBet(userId: string, gameId: string, amount: number) {
    // Create a new bet record
    const bet = await Bet.create({
      userId,
      gameId,
      amount,
    });

    // Optionally, cache the bet for faster access
    await this.cache.set(`bet:${bet._id}`, JSON.stringify(bet));

    return bet;
  }

  /**
   * Process a cashout for a specific bet.
   * @param betId - ID of the bet to cash out.
   * @param cashoutMultiplier - Multiplier at which the cashout is processed.
   * @returns The winnings amount.
   */
  public async cashoutBet(betId: string, cashoutMultiplier: number): Promise<number> {
    // Retrieve the bet from the database
    const bet = await Bet.findById(betId);

    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.cashoutMultiplier !== null) {
      throw new Error('Bet has already been cashed out');
    }

    // Calculate winnings
    const winnings = bet.amount * cashoutMultiplier;

    // Update the bet with the cashout multiplier
    bet.cashoutMultiplier = cashoutMultiplier;
    await bet.save();

    // Invalidate cache
    await this.cache.delete(`bet:${betId}`);

    return winnings;
  }

  /**
   * Fetch a specific bet by ID.
   * @param betId - ID of the bet to retrieve.
   * @returns The bet document.
   */
  public async getBet(betId: string): Promise<any> {
    // Check if the bet is cached
    const cachedBet = await this.cache.get(`bet:${betId}`);
    if (cachedBet) {
      return JSON.parse(cachedBet);
    }

    // Fetch from database if not cached
    const bet = await Bet.findById(betId);
    if (!bet) {
      throw new Error('Bet not found');
    }

    // Cache the result for future requests
    await this.cache.set(`bet:${betId}`, JSON.stringify(bet));

    return bet;
  }

  /**
   * Get all bets for a user in a specific game.
   * @param userId - ID of the user.
   * @param gameId - ID of the game.
   * @returns An array of bets.
   */
  public async getUserBets(userId: string, gameId: string): Promise<any[]> {
    return await Bet.find({ userId, gameId });
  }
}

export default BetService;
