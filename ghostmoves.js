import {
  DIRECTIONS,
  OBJECT_TYPE
} from './setup';

export function randomMovement(position, direction, objectExist) {
  let dir = direction;
  let nextMovePos = position + dir.movement;
  const keys = Object.keys(DIRECTIONS);

  while (
    objectExist(nextMovePos, OBJECT_TYPE.WALL) || objectExist(nextMovePos, OBJECT_TYPE.GHOST)
  ) {
    // Get a random key numbre from that array
    const key = keys[Math.floor(Math.random() * keys.length)];
    // Set the new direction
    dir = DIRECTIONS[key];
    // Set the next move
    nextMovePos = position + dir.movement;
  }

  return {
    nextMovePos,
    direction: dir
  };
}