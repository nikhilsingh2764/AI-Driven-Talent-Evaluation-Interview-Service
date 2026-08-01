import Interview from "../../model/interview/interview.model.js";

class InterviewRepository {

    //create interview
    async create(data) {
        return await Interview.create(data);
    }

        //create interview
    async save(interview) {
        return await interview.save();
    }


    // Find interview by id
    async findById(interviewId) {
        return await Interview.findById( interviewId );
    }

    //find interview by id and check it belong to user or not
    async findByIdAndUserId(interviewId,userId) {
        return await Interview.findOne({ _id: interviewId, userId });
    }

    // Find user's all interviews
    async findByUserId(userId) {
        return await Interview.find({
            userId
        }).sort({ createdAt: -1 })
    }


    // Find interview with resume and analysis details
    async findByIdWithDetails(interviewId) {

        return await Interview.findById(interviewId)
            .populate("resumeId")    //replace resumeId field with actual resume object from DB
            .populate("analysisId"); //replace analysisId field with actual analysis object from DB

    }


    // Update interview status
    async updateStatus(interviewId, status) {
        return await Interview.findByIdAndDelete(
            interviewId,
            {
                status
            },
            {
                new: true,
            }
        );
    }


    // Delete interview
    async delete(interviewId) {
        return await Interview.findByIdAndDelete({ interviewId });
    }



}

export default new InterviewRepository();