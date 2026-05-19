export interface Attachment {
    url: string;
    mimeType: string;
    name: string;
}

export interface Message {
    id: number;
    role: string;
    name: string;
    content: string;
    attachments: Attachment[];
}
