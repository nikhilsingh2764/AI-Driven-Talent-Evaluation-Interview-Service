import Business from "../model/Business.model.js";

class BusinessRepository {


    //create Business profile

    async create(userdata) {
        return await Business.create(userdata);
    }



    //find Business profile using userId  and email

    async findByUserId(userId) {
        return await Business.findOne({ userId });
    }


    async findByEmail(email) {
        return await Business.findOne({ email });
    }




    //delete Business profile using userId

    async deleteByUserId(userId) {
        return await Business.findOneAndDelete({ userId });
    }




    //update Business profile using userId

    async updateByUserId(userId, data) {
        return await Business.findByIdAndUpdate(
            { userId },
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }




    // check Business profile exist or not

    async existsByUserId(userId) {
        return await Business.exists({ userId });
    }


    
};


export default new BusinessRepository();