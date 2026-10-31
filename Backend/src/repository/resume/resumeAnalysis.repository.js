import ResumeAnalysis from "../../model/resume/resumeAnalysis.model.js";

class ResumeAnalysisRepository {
    findByUserId(userId) {
        return ResumeAnalysis.findOne({ userId });
    }
    // One analysis per user: created the first time, updated on every re-run (atomic, no check-then-write race).
    upsertByUserId(userId, data) {
        return ResumeAnalysis.findOneAndUpdate({ userId }, { ...data, userId }, { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true });
    }
    deleteByUserId(userId) {
        return ResumeAnalysis.findOneAndDelete({ userId });
    }
}
export default new ResumeAnalysisRepository();
