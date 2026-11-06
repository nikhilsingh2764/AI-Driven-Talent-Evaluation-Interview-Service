import Answer from "../../model/interview/answer.model.js";

class AnswerRepository {
    create(data) {
        return Answer.create(data);
    }
    findBySessionId(sessionId) {
        return Answer.find({ sessionId }).sort({ questionIndex: 1 });
    }
    deleteByInterviewId(interviewId) {
        return Answer.deleteMany({ interviewId });
    }
    deleteByUserId(userId) {
        return Answer.deleteMany({ userId });
    }
}
export default new AnswerRepository();
