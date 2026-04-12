import UserService from "../../../services/UserService.js";
import uploadAvatarPayloadSchema from "../validators/uploadAvatarPayloadSchema.js";

class UserActions {
    
    constructor(socket, io) {
        console.log("UserActions inizializzato per socket:", socket.id);
        this.socket = socket;
        this.io = io;
        this.UserService = new UserService(io); // Passa io a UserService per poter emettere notifiche
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("user:uploadAvatar", this.uploadAvatar.bind(this));
    }

    async uploadAvatar(payload, ack) {
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
            ack({ success: false, error: err.message });
        }
    }


    
}

export default UserActions;

   
