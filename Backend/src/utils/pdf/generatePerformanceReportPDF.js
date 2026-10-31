import PDFDocument from "pdfkit";

const list = (doc, items) => {
    (Array.isArray(items) && items.length ? items : ["-"]).forEach((item) => doc.fontSize(12).text(`• ${item}`));
};

const heading = (doc, title) => {
    doc.moveDown().fontSize(16).fillColor("#111").text(title);
    doc.moveDown(0.4).fontSize(12);
};

export const generatePerformanceReportPDF = (report, username = "") =>
    new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });
            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            doc.fontSize(22).text("Performance Report", { align: "center" });
            doc.fontSize(10).fillColor("#666").text(
                `${username ? `${username} · ` : ""}Generated ${new Date(report.updatedAt || Date.now()).toLocaleDateString("en-US")}`,
                { align: "center" },
            );
            doc.fillColor("#111");

            heading(doc, "Progress");
            doc.text(`Overall Progress : ${report.overallProgress}%`);
            doc.text(`Technical Progress : ${report.technicalProgress}%`);
            doc.text(`Communication Progress : ${report.communicationProgress}%`);
            doc.text(`Problem Solving Progress : ${report.problemSolvingProgress}%`);
            doc.text(`Confidence Progress : ${report.confidenceProgress}%`);
            doc.text(`Interview Readiness : ${report.interviewReadiness}%`);
            doc.text(`Total Interviews : ${report.totalInterviews}`);

            heading(doc, "Strongest Skill");
            doc.text(report.strongestSkill || "-");
            heading(doc, "Weakest Skill");
            doc.text(report.weakestSkill || "-");
            heading(doc, "Improvement Areas");
            list(doc, report.improvementAreas);
            heading(doc, "Study Plan");
            list(doc, report.studyPlan);
            heading(doc, "Summary");
            doc.text(report.summary || "-", { align: "justify" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
