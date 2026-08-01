import InterviewSession from "../../model/interview/interview.session.model.js";

class SessionRepository {

    async create(data) {
        return await InterviewSession.create(data);
    }

    //create interview
    async save(session) {
        return await session.save();
    }

    async findById(_id) {
        return await InterviewSession.findById(_id);

    }

    async findSessionByIdAndOwner(_id, userId) {
        return await InterviewSession.findOne({ _id, userId });

    }


    async findActiveSession(interviewId) {
        return await InterviewSession.findOne({
            interviewId,
            status: "STARTED"
        })
    }

    async findByInterviewId(interviewId) {
        return await InterviewSession.findOne({ interviewId });

    }

    async findByUserId(userId) {
        return await InterviewSession.find({ userId });

    }

    async updateById(_id, data) {
        return await InterviewSession.findByIdAndUpdate(
            _id,
            data,
            {
                new: true
            }
        );

    }

    async deleteById(_id) {
        return await InterviewSession.findByIdAndDelete(_id);

    }

}

export default new SessionRepository();