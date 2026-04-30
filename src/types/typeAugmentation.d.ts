// express - così posso aggiungere request.userId senza errori di tipo
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

// socket, così posso aggiungere socket.userId senza errori di tipo
declare module "socket.io" {
    interface Socket {
        userId: string; // Aggiungi la proprietà userId al tipo Socket
    }
}

export {};