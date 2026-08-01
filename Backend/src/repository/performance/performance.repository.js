import PerformanceReport from "../../model/performance/performance.report.model.js";

class PerformanceRepository {

    async create(data) {
        return await PerformanceReport.create(data);
    }

    async findById(_id) {
        return await PerformanceReport.findById(_id);
    }

    async findByUserId(userId) {
        return await PerformanceReport.findOne({ userId });
    }

    async updateByUserId(userId, data) {
        return await PerformanceReport.findOneAndUpdate(
            { userId },
            data,
            {
                new: true
            }
        );
    }

    async deleteByUserId(userId) {
        return await PerformanceReport.findOneAndDelete({ userId });
    }

}

export default new PerformanceRepository();