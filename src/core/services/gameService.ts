import crypto from 'crypto';
import { Server } from 'socket.io';



class GameService {
  private io: Server;
  private currentMultiplier: number = 1.0;
  private crashMultiplier: number = 0;
  private gameInterval: NodeJS.Timeout | null = null;
  private waitingTime: number = 10000; // 10 seconds for waiting
  private updateInterval: number = 100; // Update every 100ms
  private lastMultipliers : number[] = new Array(20);

  constructor(io: Server,public onStateChangeCallBack: (State :  "ONGOING"| "ENDED") => void) {
    this.io = io;
    this.startGameLoop();
  }

  // Start the game loop
  private startGameLoop(): void {
    this.startWaitingPhase();
  }

  // Waiting phase for players to place bets
  private startWaitingPhase(): void {
    this.io.emit('game:waiting', { message: 'Place your bets!', duration: this.waitingTime / 1000 });
    console.log("Waiting Phase");
    this.onStateChangeCallBack("ENDED");
    setTimeout(() => {
      this.startGamePhase();
    }, this.waitingTime);
  }

  private generateCrashMultiplier(roundId: number, secretSeed: string): number {
    // Combine roundId and secretSeed for uniqueness
    const input = `round-${roundId}:${secretSeed}`;

    // Hash the input using SHA-256
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    // Convert the hash into a numeric value
    const numericHash = parseInt(hash.slice(0, 8), 16); // Use first 8 characters
    const scaledValue = numericHash / 0xffffffff; // Scale to [0, 1]

    // Apply a bias function (e.g., power function)
    const biasedValue = 1/Math.pow(scaledValue, 1.5); // Bias towards smaller values
    console.log(`biasedValue : ${biasedValue}`);

    return Math.min(biasedValue, 500);
}

  // Game phase: Multiplier increases until crash
  private startGamePhase(): void {
    this.onStateChangeCallBack("ONGOING");
    this.currentMultiplier = 0.9;
 
    this.crashMultiplier = this.generateCrashMultiplier((crypto.randomInt(0, 1000)),"aviator");
    this.lastMultipliers.push(this.crashMultiplier);
    console.log(`Crashing Mulitplier : ${this.crashMultiplier}`);
    
    this.io.emit('game:started', { crashMultiplier: this.crashMultiplier });

    const startTime = Date.now();

    this.gameInterval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;

      // Update multiplier
      this.currentMultiplier = this.calculateMultiplier(elapsedTime);
      console.log(`currentMultiplier : ${this.currentMultiplier.toFixed(2) }`);

        
      // Broadcast multiplier updates
      this.io.emit('game:update', { multiplier: this.currentMultiplier.toFixed(2) });

      // End game if crash multiplier is reached
      if (this.currentMultiplier >= this.crashMultiplier) {
        this.endGame();
      }
    }, this.updateInterval);
  }

  // Multiplier growth formula
  private calculateMultiplier(elapsedTime: number): number {
    const growthFactor = 0.06; // Growth speed
    return 0.9 + growthFactor * Math.pow(elapsedTime, 2);
  }

  // Process a player's bet
  public processBet(playerId: string, amount: number): void {
    this.io.to(playerId).emit('game:bet-placed', { amount });
  }

  // Process a player's cash-out
  public processCashout(playerId: string, betAmount: number): void {
    const payout = betAmount * this.currentMultiplier;


    this.io.to(playerId).emit('game:cashout-success', { payout, multiplier: this.currentMultiplier });
  }

  // End the game
  private endGame(): void {
    if (this.gameInterval) clearInterval(this.gameInterval);
    console.log("-----Game Crashed --------");

    this.io.emit('game:crash', { multiplier: this.currentMultiplier.toFixed(2) });

    setTimeout(() => {
      this.startWaitingPhase();
    }, 5000); // 5 seconds delay before the next game
  }
}

export default GameService;
