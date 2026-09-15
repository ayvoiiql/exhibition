export type RoomId = "A" | "B" | "C";

export interface ArtworkData {
  id: string;
  roomId: RoomId;
  order: number;
  title: string;
  description: string;
  image: string;
}

export interface MoveInput {
  x: number;
  y: number;
}
