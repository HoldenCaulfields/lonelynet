export interface Room {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface PostMarker {
  _id: string;
  text: string;
  imageUrl: string;
  tags: string[];
  loves: number;
  location: { latitude: number; longitude: number };
  userId: string;
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Soul {
  _id: string;
  text: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  position?: { lat: number; lng: number };
  loves: number;
  views?: number;
  links?: Array<{ type?: string; url: string; _id?: string } | string>;
  icon?: string;
  authorId?: string;
}

export interface OnlineUser {
  userId: string;
  status: string;
  mood?: string;
  lat?: number;
  lng?: number;
  currentRoom?: string; // Which soul they are looking at
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Reaction {
  id: string;
  emoji: string;
  x: number; // For animation positioning
  y: number;
}


export enum NodeType {
  ROOT = 'ROOT',
  USER = 'USER',
  GROUP = 'GROUP',
  ANSWER = 'ANSWER',
  RELATED = 'RELATED'
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  avatar?: string;
}

export interface AnswerData {
  text: string;
  fullAnswer: string; // Longer content
  author: string;
  votes: number;
  comments: Comment[];
  isTopRated?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  details?: string;
  img?: string;
  onlineCount?: number;
  answerData?: AnswerData; 
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface ThemeConfig {
  name: string;
  background?: string;
  bgGradient?: string;
  lineColor: string;
  fontColor: string;
  particleColor?: string;
  vibeDescription: string;
  nodeColors: {
    [key in NodeType]: string;
  };
}


export interface UniverseData {
  nodes: GraphNode[];
  links: GraphLink[];
  theme: ThemeConfig;
}
