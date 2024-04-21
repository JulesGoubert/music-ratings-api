const ServiceError = require("../core/serviceError");

const handleDBError = (error) => {
    const { code = "", sqlMessage } = error;

    if (code === "ER_DUP_ENTRY") {
        switch (true) {
            case sqlMessage.includes("idx_user_email_unique"):
                return ServiceError.validationFailed(
                    "A user with this name already exists"
                );
            case sqlMessage.includes("idx_artist_name_unique"):
                return ServiceError.validationFailed(
                    "An artist with this name already exists"
                );
            case sqlMessage.includes("idx_song_title_unique"):
                return ServiceError.validationFailed(
                    "A song with this name already exists"
                );
            case sqlMessage.includes("idx_album_title_unique"):
                return ServiceError.validationFailed(
                    "An album with this name already exists"
                );
            default:
                return ServiceError.validationFailed(
                    "This item already exists"
                );
        }
    }

    if (code.startsWith("ER_NO_REFERENCED_ROW")) {
        switch (true) {
            case sqlMessage.includes("fk_song_artist"):
                return ServiceError.notFound("This artist does not exist");
            case sqlMessage.includes("fk_transaction_place"):
                return ServiceError.notFound("This place does not exist");
        }
    }

    // Return error because we don't know what happened
    return error;
};

module.exports = handleDBError;
