import InterviewSession from "../../model/interview/interview.session.model.js";

class SessionRepository {
    create(data) {
        return InterviewSession.create(data);
    }
    save(session) {
        return session.save();
    }
    findSessionByIdAndOwner(_id, userId) {
        return InterviewSession.findOne({ _id, userId });
    }
    findActiveSession(interviewId) {
        return InterviewSession.findOne({ interviewId, status: "STARTED" });
    }
    findByInterviewIds(interviewIds) {
        return InterviewSession.find({ interviewId: { $in: interviewIds } }).sort({ createdAt: 1 });
    }
    findLatestByInterviewId(interviewId) {
        return InterviewSession.findOne({ interviewId }).sort({ createdAt: -1 });
    }
    // Moves to the next question only if the session is still on `expectedIndex` (blocks double submits).
    advanceIfAt(_id, userId, expectedIndex, status = "STARTED") {
        return InterviewSession.findOneAndUpdate(
            { _id, userId, status: "STARTED", currentQuestionIndex: expectedIndex },
            { $inc: { currentQuestionIndex: 1 }, status },
            { returnDocument: "after" },
        );
    }
    deleteByUserId(userId) {
        return InterviewSession.deleteMany({ userId });
    }
}
export default new SessionRepository();
