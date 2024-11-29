import { Socket } from 'socket.io';
import { currentSessionPhase } from '../Manager/GameManager';
import { log } from 'winston';

class GameEventHandler {
  private socket: Socket;
  BetQueue: { betId : number; amount: number }[] = [];

  constructor( socket: Socket,public onLeftCallBack: () => void) {
    this.socket = socket;
    this.registerEvents();

  }
  public registerEvents(): void {
    this.socket.on('game:bet', this.handleBet);
    this.socket.on('game:cashout', this.handleCashout);
    this.socket.on('disconnect', this.handleDisconnect);
  }

  private handleBet = async (data: { betId: number; amount: number }) => {
    try {
      console.log(`Bet received: ${data}`);
      if(currentSessionPhase == "ENDED")
      {
        console.log("placed Bet");
      }
      else
      {
        this.BetQueue.push(data);
        console.log("Queued Bet");
      }
    
      // Handle bet logic here.
    } catch (error) {
      this.socket.emit('error', { message: 'Error processing bet' });
    }
  };

  private handleCashout = async (data: { userId: string; multiplier: number }) => {
    try {
      console.log(`Cashout received: ${data}`);
      // Handle cashout logic here.
    } catch (error) {
      this.socket.emit('error', { message: 'Error processing cashout' });
    }
  };

  private handleDisconnect = () => {
    console.log(`Client disconnected: ${this.socket.id}`);
    this.onLeftCallBack.bind(this);
  };
  public getSocket() : Socket {return this.socket;}

}

export default GameEventHandler;
