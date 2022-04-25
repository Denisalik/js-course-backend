import { Test, TestingModule } from '@nestjs/testing';
import { WsGateway } from './ws.gateway';
import { io } from 'socket.io-client';

describe('WsGateway', () => {
  let gateway: WsGateway;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsGateway],
    }).compile();

    gateway = module.get<WsGateway>(WsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

describe('Game', () => {
  let p1, p2, gameEnv;
  const roomName = Math.random().toString();

  beforeAll((done) => {
    p1 = io('http://localhost:8080');
    p2 = io('http://localhost:8080');
    p1.on('connect', () => {
      p2.on('connect', () => {
        done();
      });
    });
  });

  afterAll((done) => {
    if (p1.connected) {
      p1.disconnect();
    }
    if (p2.connected) {
      p2.disconnect();
    }
    done();
  });

  it('should create room on server', (done) => {
    p1.emit('createRoom', { playerName: 'p1', roomName }, (error) => {
      if (error) {
        done(error);
      }
    });

    p1.on('gameData', (data) => {
      gameEnv = data.gameEnv;
      done();
    });
  });

  it('should join existing room on server', (done) => {
    p2.emit('joinRoom', { playerName: 'p2', roomName }, (error) => {
      if (error) {
        done(error);
      }
    });

    p2.on('gameData', () => {
      done();
    });
  });

  it('should change player1 location', (done) => {
    p1.emit('movePlayer', { playerNumber: 1, direction: 1, roomName });
    p1.on('locationUpdate', ({ playerNumber, newLocation }) => {
      if (playerNumber === 1) {
        expect(newLocation.y).toBeLessThan(gameEnv.p1Location.y);
        done();
      }
    });
  });

  it('should change player2 location', (done) => {
    p2.emit('movePlayer', { playerNumber: 2, direction: -1, roomName });
    p2.on('locationUpdate', ({ playerNumber, newLocation }) => {
      if (playerNumber === 2) {
        expect(newLocation.y).toBeGreaterThan(gameEnv.p2Location.y);
        done();
      }
    });
  });
});
