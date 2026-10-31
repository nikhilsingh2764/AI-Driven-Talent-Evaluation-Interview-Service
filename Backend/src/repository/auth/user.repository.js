import User from "../../model/auth/auth.model.js";

class UserRepository {
    create(userdata) {
        return User.create(userdata);
    }
    findByEmail(email) {
        return User.findOne({ email }).select("+password");
    }
    findByIdWithPassword(id) {
        return User.findById(id).select("+password");
    }
    findByUsername(username) {
        return User.findOne({ username });
    }
    findById(id) {
        return User.findById(id);
    }
    emailExist(email) {
        return User.exists({ email });
    }
    usernameExist(username) {
        return User.exists({ username });
    }
    // Is this username used by someone other than `excludeId`?
    usernameTakenByOther(username, excludeId) {
        return User.exists({ username, _id: { $ne: excludeId } });
    }
    findByIdAndDelete(id) {
        return User.findByIdAndDelete(id);
    }
    deactivateAccount(id) {
        return User.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
    }
    updateProfile(id, data) {
        return User.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
    }
    // Atomic, so two parallel wrong passwords cannot overwrite each other's counter.
    async registerFailedLogin(id, maxAttempts, lockMs) {
        const user = await User.findByIdAndUpdate(id, { $inc: { failedLoginAttempts: 1 } }, { returnDocument: "after" });
        if (user && user.failedLoginAttempts >= maxAttempts) {
            await User.updateOne({ _id: id }, { lockUntil: new Date(Date.now() + lockMs) });
        }
        return user;
    }
    resetLoginFailures(id) {
        return User.updateOne({ _id: id }, { failedLoginAttempts: 0, lockUntil: null });
    }
}
export default new UserRepository();
