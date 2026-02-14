export interface Message {
    id: number;
    role: string;
    name: string;
    content: string;
    image: string | null
}