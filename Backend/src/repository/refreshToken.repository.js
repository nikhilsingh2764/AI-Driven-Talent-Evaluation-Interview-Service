import RefreshToken from "../model/refreshToken.model.js";


class RefreshTokenRepository {


    async create(data){

        return await RefreshToken.create(data);

    }


    async findByToken(token){

        return await RefreshToken.findOne({
            token
        });

    }


    async deleteByToken(token){

        return await RefreshToken.deleteOne({
            token
        });

    }


    async deleteByUserId(userId){

        return await RefreshToken.deleteMany({
            userId
        });

    }


}


export default new RefreshTokenRepository();