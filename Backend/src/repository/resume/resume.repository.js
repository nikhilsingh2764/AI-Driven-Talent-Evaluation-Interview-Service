import Resume from "../../model/resume/resume.model.js";

class ResumeRepository {
    create(data) {
        return Resume.create(data);
    }
    findByUserId(userId) {
        return Resume.findOne({ userId });
    }
    updateByUserId(userId, data) {
        return Resume.findOneAndUpdate({ userId }, data, { returnDocument: "after", runValidators: true });
    }
    deleteByUserId(userId) {
        return Resume.findOneAndDelete({ userId });
    }
}
export default new ResumeRepository();
