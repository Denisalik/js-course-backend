import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  gameEnv,
  gameParams,
  games,
  gameState,
  gameStateType,
} from './game/globals';
import { playGame } from './game/game';

const clients = [];

@WebSocketGateway()
export class WsGateway {
  @WebSocketServer()
  server: Server;

  startGame(roomName: string, game: gameStateType) {
    if (game.ongoing) return;
    game.ongoing = true;
    this.server.to(roomName).emit('startGame', {});
    setTimeout(() => {
      playGame(this.server, roomName, game);
    }, gameParams.roundBreak);
  }

  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerName') playerName: string,
    @MessageBody('roomName') roomName: string,
    @MessageBody('callback') callback: (error?: string) => void,
  ) {
    if (!playerName.length || !roomName.length) {
      callback('Player name and room name are required.');
      return;
    }
    if (games.get(roomName)) {
      callback('Room already exists.');
      return;
    }
    const game = JSON.parse(JSON.stringify(gameState));
    game.playerCount = 1;
    games.set(roomName, game);
    client.join(roomName);
    clients.push({ client, roomName });
    this.server.to(roomName).emit('gameData', {
      playerName,
      playerNumber: 1,
      roomName,
      gameEnv,
      gameState: game,
    });
    callback();
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerName') playerName: string,
    @MessageBody('roomName') roomName: string,
    @MessageBody('callback') callback: (error?: string) => void,
  ) {
    if (!playerName.length || !roomName.length) {
      callback('Player name and room name are required.');
      return;
    }
    const game = games.get(roomName);
    if (!game || game.playerCount === 2) {
      callback("Room doesn't exist or is full.");
      return;
    }
    game.playerCount = 2;
    client.join(roomName);
    clients.push({ client, roomName });
    this.server.to(roomName).emit('gameData', {
      playerName,
      playerNumber: 2,
      roomName,
      gameEnv,
      gameParams,
      gameState: game,
    });
    this.startGame(roomName, game);
    callback();
  }

  @SubscribeMessage('movePlayer')
  movePlayer(
    @MessageBody('playerNumber') playerNumber: number,
    @MessageBody('roomName') roomName: string,
    @MessageBody('direction') direction: number,
  ) {
    const game = games.get(roomName);
    if (!game) return;
    const player = playerNumber === 1 ? game.p1 : game.p2;
    if (direction === 1) {
      if (player.y - gameParams.playerSpeed > 0) {
        player.y -= gameParams.playerSpeed;
      } else {
        player.y = 0;
      }
    } else if (direction === -1) {
      if (
        player.y + gameEnv.paddleHeight + gameParams.playerSpeed <
        gameEnv.tableHeight
      ) {
        player.y += gameParams.playerSpeed;
      } else {
        player.y = gameEnv.tableHeight - gameEnv.paddleHeight;
      }
    }
    this.server.to(roomName).emit('locationUpdate', {
      playerNumber,
      newLocation: { x: player.x, y: player.y },
    });
  }

  @SubscribeMessage('disconnect')
  disconnect(@ConnectedSocket() client: Socket) {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].client === client) {
        games.delete(clients[i].roomName);
        this.server
          .to(clients[i].roomName)
          .emit('interrupt', { message: 'Other player disconnected.' });
        clients.splice(i, 1);
        return;
      }
    }
  }
}
