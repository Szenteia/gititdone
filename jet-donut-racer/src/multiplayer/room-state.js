// Multiplayer placeholder: no network traffic is enabled in the single-run milestone.
// The shared track seed and compact player snapshots will plug into this contract later.
export class RoomState {
  constructor({ roomCode = null, trackSeed, maxPlayers = 2 } = {}) {
    this.roomCode = roomCode;
    this.trackSeed = trackSeed;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
  }

  addPlayer(playerId, initialState = {}) {
    if (this.players.size >= this.maxPlayers) return false;
    this.players.set(playerId, { progress: 0, lateral: 0, speed: 0, lap: 1, ...initialState });
    return true;
  }

  updatePlayer(playerId, patch) {
    const current = this.players.get(playerId);
    if (!current) return false;
    this.players.set(playerId, { ...current, ...patch });
    return true;
  }
}
