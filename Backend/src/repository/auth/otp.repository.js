import OTP from "../../model/auth/opt.model.js";

class OTPRepository {
    create(data) {
        return OTP.create(data);
    }
    // Newest OTP for an email + type (includes the stored password hash used at signup)
    findByEmailAndType(email, type) {
        return OTP.findOne({ email, type }).sort({ createdAt: -1 }).select("+password");
    }
    deleteById(id) {
        return OTP.findByIdAndDelete(id);
    }
    deleteByEmailAndType(email, type) {
        return OTP.deleteMany({ email, type });
    }
    incrementAttempts(id) {
        return OTP.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { returnDocument: "after" });
    }
}
export default new OTPRepository();
