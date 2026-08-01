import Answer from "../../model/interview/answer.model.js";

class AnswerRepository {

    async create(answerData) {
        return await Answer.create(answerData);
    }

    async findBySessionId(sessionId) {
        return await Answer.find({ sessionId })

    }

    async findByInterviewId(interviewId) {
        return await Answer.find({ interviewId })

    }

    async findByUserId(userId) {
        return await Answer.find({ userId })

    }

    async deleteBySessionId(sessionId) {
        return await Answer.deleteMany({ sessionId })

    }

}

export default new AnswerRepository();