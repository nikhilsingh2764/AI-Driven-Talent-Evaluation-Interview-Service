import Resume from "../model/resume.model.js"

class ResumeRepository {

    async create(data) {
        return await Resume.create(data);
    }

    async findByUserId(userId) {
        return await Resume.findOne({ userId });
    }

    async existsByUserId(userId) {
        return await Resume.exists({ userId });
    }

    async updateByUserId(userId, data) {
        return await Resume.findOneAndUpdate(
            { userId },
            data,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async deleteByUserId(userId) {
        return await Resume.findOneAndDelete({ userId });
    }


}

export default new ResumeRepository();