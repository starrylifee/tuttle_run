import { MAP_HEIGHT, MAP_WIDTH } from '../data/gameData';
import type { CollisionResult, Obstacle, Point, TurtleState } from '../types/game';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeAngle(angle: number) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getPointAtDistance(start: Point, angle: number, distance: number): Point {
  const radian = ((angle - 90) * Math.PI) / 180;

  return {
    x: start.x + Math.cos(radian) * distance,
    y: start.y + Math.sin(radian) * distance,
  };
}

export function clampPoint(point: Point, radius: number, width = MAP_WIDTH, height = MAP_HEIGHT): Point {
  return {
    x: clamp(point.x, radius, width - radius),
    y: clamp(point.y, radius, height - radius),
  };
}

function circleIntersectsRect(point: Point, radius: number, obstacle: Obstacle) {
  const closestX = clamp(point.x, obstacle.x, obstacle.x + obstacle.width);
  const closestY = clamp(point.y, obstacle.y, obstacle.y + obstacle.height);

  return distanceBetween(point, { x: closestX, y: closestY }) <= radius;
}

function circleIntersectsEllipse(point: Point, radius: number, obstacle: Obstacle) {
  const centerX = obstacle.x + obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2;
  const rx = obstacle.width / 2 + radius;
  const ry = obstacle.height / 2 + radius;
  const dx = point.x - centerX;
  const dy = point.y - centerY;

  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

function isOutOfBounds(point: Point, radius: number, width = MAP_WIDTH, height = MAP_HEIGHT) {
  return (
    point.x - radius < 0 ||
    point.x + radius > width ||
    point.y - radius < 0 ||
    point.y + radius > height
  );
}

export function findCollisionOnPath(
  start: TurtleState,
  distance: number,
  obstacles: Obstacle[],
  radius: number,
): CollisionResult | null {
  const steps = Math.max(1, Math.ceil(distance));
  let safePoint: Point = { x: start.x, y: start.y };

  for (let step = 1; step <= steps; step += 1) {
    const point = getPointAtDistance(start, start.angle, step);

    if (isOutOfBounds(point, radius)) {
      return {
        kind: 'boundary',
        safePoint,
        collisionPoint: clampPoint(point, radius),
      };
    }

    const obstacle = obstacles.find((entry) =>
      entry.shape === 'ellipse'
        ? circleIntersectsEllipse(point, radius, entry)
        : circleIntersectsRect(point, radius, entry),
    );

    if (obstacle) {
      return {
        kind: 'obstacle',
        safePoint,
        collisionPoint: point,
        obstacle,
      };
    }

    safePoint = point;
  }

  return null;
}

export function getTravelDuration(from: Point, to: Point) {
  const distance = distanceBetween(from, to);
  return clamp(Math.round(distance * 5), 240, 900);
}

export function getBouncePoint(point: Point, angle: number, amount: number, radius: number) {
  const bounced = getPointAtDistance(point, angle, -amount);
  return clampPoint(bounced, radius);
}

