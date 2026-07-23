import User from "../model/auth.model.js";

class UserRepository {


    //create  

    async create(userdata) {
        return await User.create(userdata);
    }



    //find

    async findByEmail(email) {
        return await User.findOne({ email }).select("+password");
    }

    async findByIdWithPassword(id) {
        return await User.findById(id).select("+password");
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findByUsernameOrEmail(username, email) {
        return await User.findOne({
            $or: [   //any one can be true then true
                { username },
                { email }
            ]
        });
    }


    async findById(id) {
        return await User.findById(id);
    }


    async findAll() {
        return await User.find();
    }


    //VERIFY

    async verifyEmail(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                isVerified: true
            },
            {
                new: true
            }
        );
    }


    // EXISTS


    async emailExist(email) {
        return await User.exists({ email })
    }


    async usernameExist(username) {
        return await User.exists({ username })
    }



    //DELETE


    async findByIdAndDelete(id) {
        return await User.findByIdAndDelete(id);
    }

    async deactivateAccount(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                isActive: false //User account is deactivated. ❌
            },                  //if true account is activate.  ✅
            {
                //return updated document where isActive is false if return updated doc in normal isActive is true  
                returnDocument: "after",
                runValidators: true

            }
        );
    }



    //update

    async updateProfile(id, data) {
        return await User.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true  //first run schema validation like min:18, include:@ then update
            }

        )
    }






}

export default new UserRepository();