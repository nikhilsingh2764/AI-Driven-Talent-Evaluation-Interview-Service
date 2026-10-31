import InterviewReport from "../../model/interview/InterviewReport.model.js";

class ReportRepository {
    create(data) {
        return InterviewReport.create(data);
    }
    findById(_id) {
        return InterviewReport.findById(_id);
    }
    findOneBySessionId(sessionId) {
        return InterviewReport.findOne({ sessionId });
    }
    findByInterviewIds(interviewIds) {
        return InterviewReport.find({ interviewId: { $in: interviewIds } });
    }
    findByUserId(userId) {
        return InterviewReport.find({ userId }).sort({ createdAt: 1 });
    }
    deleteByUserId(userId) {
        return InterviewReport.deleteMany({ userId });
    }

    // Paginated history. `interviewIds` (optional) restricts it to interviews that matched the role/difficulty/category filters.
    async findInterviewHistory({ userId, page = 1, limit = 10, sort, interviewIds }) {
        const filter = { userId };
        if (interviewIds) filter.interviewId = { $in: interviewIds };

        const sortBy =
            sort === "oldest"
                ? { createdAt: 1 }
                : sort === "highest-score"
                  ? { overallScore: -1, createdAt: -1 }
                  : sort === "lowest-score"
                    ? { overallScore: 1, createdAt: -1 }
                    : { createdAt: -1 };

        const [items, total] = await Promise.all([
            InterviewReport.find(filter)
                .populate("interviewId", "role experience difficulty")
                .sort(sortBy)
                .skip((page - 1) * limit)
                .limit(limit),
            InterviewReport.countDocuments(filter),
        ]);
        return { items, total };
    }
}
export default new ReportRepository();
