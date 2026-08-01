import InterviewReport from "../../model/interview/InterviewReport.model.js";


class ReportRepository {

    async create(data) {
        return await InterviewReport.create(data);
    }

    async findById(_id) {
        return await InterviewReport.findById(_id);
    }

    async findBySessionId(sessionId) {
        return await InterviewReport.find({ sessionId });
    }

    async findByInterviewId(interviewId) {
        return await InterviewReport.find({ interviewId });
    }

    async findByUserId(userId) {
        return await InterviewReport.find({ userId });
    }

    async updateById(_id, data) {
        return await InterviewReport.findByIdAndUpdate(
            _id,
            data,
            {
                new: true
            }
        );
    }

    async deleteBySessionId(sessionId) {
        return await InterviewReport.deleteOne({ sessionId });
    }

    async findInterviewHistory({
        userId,
        page = 1,
        limit = 10,
        sort
    }) {

        let query = InterviewReport.find({ userId })
            .populate(
                "interviewId",
                "role difficulty category"
            );


        switch (sort) {

            case "oldest":
                query = query.sort({ createdAt: 1 });
                break;

            case "highest-score":
                query = query.sort({ overallScore: -1 });
                break;

            case "lowest-score":
                query = query.sort({ overallScore: 1 });
                break;

            default:
                query = query.sort({ createdAt: -1 });

        }


        return await query
            .skip((page - 1) * limit)
            .limit(limit);

    }

}

export default new ReportRepository();