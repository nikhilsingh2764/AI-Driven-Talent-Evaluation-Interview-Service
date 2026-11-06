import Interview from "../../model/interview/interview.model.js";

class InterviewRepository {
    create(data) {
        return Interview.create(data);
    }
    save(interview) {
        return interview.save();
    }
    findById(interviewId) {
        return Interview.findById(interviewId);
    }
    // Returns null when the interview exists but belongs to someone else
    findByIdAndUserId(interviewId, userId) {
        return Interview.findOne({ _id: interviewId, userId });
    }
    // `select` limits the fields (the `questions` array is the heavy part)
    findByUserId(userId, filter = {}, select = "") {
        return Interview.find({ userId, ...filter }).select(select).sort({ createdAt: -1 });
    }
    updateStatus(interviewId, status) {
        return Interview.findByIdAndUpdate(interviewId, { status }, { returnDocument: "after" });
    }
    delete(interviewId) {
        return Interview.findByIdAndDelete(interviewId);
    }
    deleteByUserId(userId) {
        return Interview.deleteMany({ userId });
    }
}
export default new InterviewRepository();
