import RefreshToken from "../../model/auth/refreshToken.model.js";

class RefreshTokenRepository {
    create(data) {
        return RefreshToken.create(data);
    }
    findByHash(tokenHash) {
        return RefreshToken.findOne({ tokenHash });
    }
    deleteByHash(tokenHash) {
        return RefreshToken.deleteOne({ tokenHash });
    }
    deleteByUserId(userId) {
        return RefreshToken.deleteMany({ userId });
    }
}
export default new RefreshTokenRepository();
