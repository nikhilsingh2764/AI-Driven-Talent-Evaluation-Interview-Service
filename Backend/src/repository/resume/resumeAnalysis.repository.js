import ResumeAnalysis from "../../model/resume/resumeAnalysis.model.js";

class ResumeAnalysisRepository {

    async create(data) {
        return await ResumeAnalysis.create(data);
    }

    async findByUserId(userId) {
        return await ResumeAnalysis.findOne({ userId });
    }

    async findByResumeId(resumeId) {
        return await ResumeAnalysis.findOne({ resumeId });
    }


    async findByResumeIdAndUserId(resumeId) {
        return await ResumeAnalysis.findOne({ userId, resumeId });
    }


    async updateByUserId(userId, data) {
        return await ResumeAnalysis.findOneAndUpdate(
            { userId },
            data,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async deleteByUserId(userId) {
        return await ResumeAnalysis.findOneAndDelete({ userId });
    }



};

export default new ResumeAnalysisRepository();