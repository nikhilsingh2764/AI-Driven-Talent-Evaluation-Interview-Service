import openrouter from "../../config/openrouter.js";
import ApiError from "../ApiError.js"

export const askAI = async (prompt) => {

    try {

        const response = await openrouter.chat.completions.create({
            model: "inclusionai/ling-3.0-flash:free",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.3,
        });


        return response.choices[0].message.content;


    } catch (error) {

        throw new ApiError(
            500,
            error.message || "AI service failed"
        );

    }
};