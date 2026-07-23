import OTP from "../model/opt.model.js";


class OTPRepository {


    // Save OTP and signup data in DB
    async create(data) {
        return await OTP.create(data);
    }


    // Find OTP using email during verification
    // Include password field
    async findByEmail(email) {
        return await OTP.findOne({ email })
            .select("+password");
    }


    // Remove all old OTP before generating a new one
    async deleteByEmail(email) {
        return await OTP.deleteMany({ email });
    }


    async deleteById(id) {
        return await OTP.findByIdAndDelete(id);
    }


    // Find by email + type
    async findByEmailAndType(email, type) {

        return await OTP.findOne({
            email,
            type
        })
        .select("+password");

    }


    // Delete by email + type
    async deleteByEmailAndType(email, type) {

        return await OTP.deleteMany({
            email,
            type
        });

    }


}


export default new OTPRepository();