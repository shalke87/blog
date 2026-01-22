export default function PostActions(socket) {
    socket.on("post:create", (payload) => {
        console.log("Nuovo post creato da:", socket.user.id, payload);
        // Qui chiamerai il tuo servizio dei post
    });

    socket.on("post:like", (payload) => {
        console.log("Like da:", socket.user.id, payload);
        // Qui chiamerai il servizio per mettere like
    });
}
