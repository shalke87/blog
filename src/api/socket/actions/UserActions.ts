import UserService from "../../../services/UserService.js";
import { UploadAvatarPayload } from "../../../types/types.js";
import uploadAvatarPayloadSchema from "../validators/uploadAvatarPayloadSchema.js";
import { Server, Socket } from "socket.io";

class UserActions {
    private socket: Socket;
    private io: Server;
    private UserService: UserService;

    constructor(socket : Socket, io : Server) {
        console.log("UserActions inizializzato per socket:", socket.id);
        this.socket = socket;
        this.io = io;
        this.UserService = new UserService(io); // Passa io a UserService per poter emettere notifiche
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("user:uploadAvatar", this.uploadAvatar.bind(this));
    }

    async uploadAvatar(payload : UploadAvatarPayload, ack : (response : object) => void) {
        try {
            const {error, value} = uploadAvatarPayloadSchema.validate(payload);
            if (error) {
                console.error("Validation error for uploadAvatar:", error);
                return ack({ success: false, error: error.details[0].message });
            }
            const { filename, mimetype, size, buffer } = value;
            const result = await this.UserService.uploadAvatar(this.socket.userId, { filename, mimetype, size, buffer });
            ack({ success: true, data: result });
        } catch (err) {
            console.error("Error uploading avatar:", err);
            const message = err instanceof Error ? err.message : "Error uploading avatar";
            ack({ success: false, error: message });
        }
    }


    
}

export default UserActions;

   
