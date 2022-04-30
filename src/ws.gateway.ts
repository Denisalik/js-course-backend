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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway {
  @WebSocketServer()
  server: Server;

  startGame(roomName: string, game: gameStateType) {
    this.server.to(roomName).emit('startGame', {});
    setTimeout(() => {
      playGame(this.server, roomName, game);
    }, gameParams.roundBreak);
  }

  @SubscribeMessage('joinRoom')
  createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerName') playerName: string,
    @MessageBody('roomName') roomName: string,
  ) {
    if (!playerName.length || !roomName.length) {
      return 'Player name and room name are required.';
    }
    const roomExists = games.get(roomName);
    let game;
    if (roomExists) {
      game = games.get(roomName);
      if (game.full) {
        return 'Room is full.';
      }
      game.full = true;
      game.p2.name = playerName;
    } else {
      game = JSON.parse(JSON.stringify(gameState));
      game.p1.name = playerName;
      games.set(roomName, game);
    }
    client.join(roomName);
    clients.push({ client, roomName });
    this.server.to(roomName).emit('gameData', {
      playerNumber: roomExists ? 2 : 1,
      gameEnv,
      gameState: game,
    });
    if (roomExists) {
      this.startGame(roomName, game);
    }
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

  @SubscribeMessage('pauseGame')
  pauseGame(
    @MessageBody('playerNumber') playerNumber: number,
    @MessageBody('roomName') roomName: string,
  ) {
    if (games.get(roomName) === null) return;
    if (playerNumber === 1) {
      games.get(roomName).p1.paused = !games.get(roomName).p1.paused;
    } else {
      games.get(roomName).p2.paused = !games.get(roomName).p2.paused;
    }
    this.server.to(roomName).emit('interrupt', { code: playerNumber });
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].client === client) {
        games.delete(clients[i].roomName);
        this.server.to(clients[i].roomName).emit('interrupt', { code: 0 });
        clients.splice(i, 1);
        return;
      }
    }
  }
}
