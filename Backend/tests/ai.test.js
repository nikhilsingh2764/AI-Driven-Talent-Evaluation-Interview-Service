import "./helpers.js";
import test from "node:test";
import assert from "node:assert/strict";

const { parseAIJson, normalizeAnalysis, normalizeQuestions, normalizeInterviewReport, normalizePerformance, clampInt } =
    await import("../src/utils/ai/parseAIJson.js");
const { mockAI } = await import("../src/utils/ai/mockAI.js");

test("parseAIJson strips code fences and surrounding prose", () => {
    assert.deepEqual(parseAIJson('```json\n{"a":1}\n```'), { a: 1 });
    assert.deepEqual(parseAIJson('Sure! Here you go:\n{"a":[1,2]}\nHope that helps'), { a: [1, 2] });
    assert.deepEqual(parseAIJson('Result: [{"q":1}]'), [{ q: 1 }]);
    assert.throws(() => parseAIJson("no json here"));
    assert.throws(() => parseAIJson(""));
});

test("clampInt never trusts the model's numbers", () => {
    assert.equal(clampInt(150), 100);
    assert.equal(clampInt(-5), 0);
    assert.equal(clampInt("72.6"), 73);
    assert.equal(clampInt("abc", 0, 100, 42), 42);
});

test("normalizeAnalysis requires a summary and clamps the ATS score", () => {
    assert.throws(() => normalizeAnalysis({}));
    const a = normalizeAnalysis({ summary: "ok", atsScore: 999, technicalSkills: "React" });
    assert.equal(a.atsScore, 100);
    assert.deepEqual(a.technicalSkills, ["React"]);
});

test("normalizeQuestions fixes categories, caps at 10 and rejects too few", () => {
    const raw = Array.from({ length: 14 }, (_, i) => ({ question: `Q${i}`, category: i === 0 ? "technical" : "nonsense" }));
    const q = normalizeQuestions(raw);
    assert.equal(q.length, 10);
    assert.equal(q[0].category, "Technical");
    assert.equal(q[1].category, "Technical"); // unknown -> default
    assert.throws(() => normalizeQuestions([{ question: "only one" }]));
    assert.equal(normalizeQuestions({ questions: raw }).length, 10);
});

test("normalizePerformance always uses the real interview count", () => {
    assert.equal(normalizePerformance({ totalInterviews: 99 }, 3).totalInterviews, 3);
});

test("mock AI output passes every normalizer (so local development without a key works)", () => {
    const analysis = normalizeAnalysis(mockAI.analysis({ resumeText: "React Node.js MongoDB Docker developer" }));
    assert.ok(analysis.technicalSkills.includes("React"));
    const questions = normalizeQuestions(mockAI.questions({ role: "Backend", difficulty: "Medium", skills: analysis.technicalSkills }));
    assert.equal(questions.length, 10);
    const report = normalizeInterviewReport(mockAI.interviewReport({ interviewData: [{ answer: "a few words here" }] }));
    assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
    const perf = normalizePerformance(mockAI.performance({ performanceData: [report] }), 1);
    assert.ok(perf.strongestSkill);
});
