import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Graph } from 'redis';
import { Server as SocketServer } from 'socket.io';
import { log } from 'winston';
import GameService from '../core/services/gameService';

export class App {
  private app: Application;
  private httpServer: HTTPServer;
  private io: SocketServer;
  private port: number | string;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketServer(this.httpServer, {
      cors: { origin: process.env.ALLOWED_ORIGINS },
    });
    this.port = process.env.PORT || 5000;
    console.log(this.port);
    

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocket(); // Use `this.initializeSocket` if defined as a method.
  }



  private initializeMiddlewares(): void {
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    // Define your API routes here
  }

  private initializeSocket(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      // Register WebSocket events here
    });
  }

  public start(): void {
    this.httpServer.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

export default App;
