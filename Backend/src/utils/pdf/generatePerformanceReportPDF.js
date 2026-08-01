import PDFDocument from "pdfkit";

export const generatePerformanceReportPDF = async (report) => {

    return new Promise((resolve, reject) => {

        try {

            const doc = new PDFDocument({
                margin: 50,
                size: "A4"
            });

            const buffers = [];

            doc.on("data", (chunk) => buffers.push(chunk));

            doc.on("end", () => {
                resolve(Buffer.concat(buffers));
            });

            // Heading
            doc
                .fontSize(22)
                .text("Performance Report", {
                    align: "center"
                });

            doc.moveDown();

            // Scores
            doc
                .fontSize(16)
                .text("Overall Progress");

            doc.moveDown(0.5);

            doc.fontSize(12);

            doc.text(`Overall Progress : ${report.overallProgress}%`);
            doc.text(`Technical Progress : ${report.technicalProgress}%`);
            doc.text(`Communication Progress : ${report.communicationProgress}%`);
            doc.text(`Problem Solving Progress : ${report.problemSolvingProgress}%`);
            doc.text(`Confidence Progress : ${report.confidenceProgress}%`);
            doc.text(`Interview Readiness : ${report.interviewReadiness}%`);
            doc.text(`Total Interviews : ${report.totalInterviews}`);

            doc.moveDown();

            // Strongest Skill
            doc
                .fontSize(16)
                .text("Strongest Skill");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .text(report.strongestSkill);

            doc.moveDown();

            // Weakest Skill
            doc
                .fontSize(16)
                .text("Weakest Skill");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .text(report.weakestSkill);

            doc.moveDown();

            // Improvement Areas
            doc
                .fontSize(16)
                .text("Improvement Areas");

            doc.moveDown(0.5);

            report.improvementAreas.forEach((item) => {
                doc.fontSize(12).text(`• ${item}`);
            });

            doc.moveDown();

            // Study Plan
            doc
                .fontSize(16)
                .text("Study Plan");

            doc.moveDown(0.5);

            report.studyPlan.forEach((item) => {
                doc.fontSize(12).text(`• ${item}`);
            });

            doc.moveDown();

            // Summary
            doc
                .fontSize(16)
                .text("Summary");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .text(report.summary, {
                    align: "justify"
                });

            doc.end();

        } catch (error) {

            reject(error);

        }

    });

};