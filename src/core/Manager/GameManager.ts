import { Socket } from "socket.io";
import GameEventHandler from "../events/gameEventHandler";
import { Server } from 'socket.io';
import GameService from "../services/gameService";

export class GameManager {
    currentPlayers : GameEventHandler[] = [];
    gameService : GameService;
    constructor(io:Server) {
        this.gameService = new GameService(io,this.changeState.bind(this));
        this.socketManager(io);
    }
    changeState(state : "ONGOING"| "ENDED")
    {
        currentSessionPhase = state;
        
        if(state == "ONGOING")
        this.checkBetQueue();
    }

    checkBetQueue()
    {
        this.currentPlayers.forEach(element => {
            if(element.BetQueue.length > 0)
            {
                element.BetQueue.forEach(element => {
                    
                });
                element.BetQueue = [];
            }
        });
    }

    socketManager(io:Server){
        io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            this.addPlayer(socket);
          });
    }
    addPlayer(socket : Socket){this.currentPlayers.push(new GameEventHandler(socket,() => this.playerLeft(socket)));}
    playerLeft(socket : Socket) 
    {
        this.currentPlayers.forEach( (element,index) => {
            if(element.getSocket() == socket)
            this.currentPlayers.splice(index,1);
        });
    }

    
}
export let currentSessionPhase :  "ONGOING"| "ENDED" = "ENDED";
