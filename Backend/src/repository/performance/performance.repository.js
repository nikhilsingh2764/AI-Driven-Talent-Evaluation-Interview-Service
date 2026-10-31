import PerformanceReport from "../../model/performance/performance.report.model.js";

class PerformanceRepository {
    findByUserId(userId) {
        return PerformanceReport.findOne({ userId });
    }
    // One report per user: create it the first time, overwrite it when regenerated.
    upsertByUserId(userId, data) {
        return PerformanceReport.findOneAndUpdate({ userId }, { ...data, userId }, { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true });
    }
    deleteByUserId(userId) {
        return PerformanceReport.findOneAndDelete({ userId });
    }
}
export default new PerformanceRepository();
