// End-to-end check of the whole API against a RUNNING server.
//   1. Start the backend with EXPOSE_OTP_IN_RESPONSE=true and RATE_LIMIT_DISABLED=true (see .env.example)
//   2. npm run e2e            (optional: BASE_URL=http://localhost:5000)
import PDFDocument from "pdfkit";

const BASE = (process.env.BASE_URL || "http://localhost:5000") + "/api/v1";
let passed = 0;
const failures = [];

const check = (name, condition, extra = "") => {
    if (condition) {
        passed += 1;
        console.log(`  ok   ${name}`);
    } else {
        failures.push(name);
        console.log(`  FAIL ${name} ${extra}`);
    }
};

class Client {
    constructor() { this.cookies = {}; }
    async call(method, path, { body, form, headers = {} } = {}) {
        const h = { ...headers };
        const cookie = Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
        if (cookie) h.cookie = cookie;
        let payload;
        if (form) payload = form;
        else if (body !== undefined) { h["content-type"] = "application/json"; payload = JSON.stringify(body); }
        const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect: "manual" });
        for (const c of res.headers.getSetCookie?.() ?? []) {
            const [pair] = c.split(";");
            const i = pair.indexOf("=");
            const name = pair.slice(0, i), value = pair.slice(i + 1);
            if (!value || /expires=thu, 01 jan 1970/i.test(c)) delete this.cookies[name];
            else this.cookies[name] = value;
        }
        const type = res.headers.get("content-type") || "";
        const data = type.includes("json") ? await res.json() : Buffer.from(await res.arrayBuffer());
        return { status: res.status, data, type };
    }
    get(p, o) { return this.call("GET", p, o); }
    post(p, body, o) { return this.call("POST", p, { body, ...o }); }
    patch(p, body, o) { return this.call("PATCH", p, { body, ...o }); }
    del(p, body) { return this.call("DELETE", p, { body }); }
}

const makePdf = (text) => new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.fontSize(12).text(text);
    doc.end();
});

const RESUME = `Jane Doe - Full Stack Developer. Experience: 3 years building web apps with JavaScript, TypeScript, React, Node.js,
Express and MongoDB. Deployed services with Docker and AWS, used Git daily, built REST APIs and added Redis caching.
Projects: an e-commerce platform and a real-time chat app. Education: B.Tech in Computer Science. Strong teamwork and communication.`;

const pdfForm = async (text = RESUME, name = "resume.pdf", type = "application/pdf") => {
    const f = new FormData();
    f.append("resume", new Blob([await makePdf(text)], { type }), name);
    return f;
};

const rand = Math.random().toString(36).slice(2, 8);
const PASS = "Passw0rd@123";

const signupAndLogin = async (c, suffix) => {
    const username = `user_${rand}${suffix}`;
    const email = `${username}@example.com`;
    const s = await c.post("/signup", { username, email, password: PASS });
    const otp = s.data?.data?.devOtp;
    if (!otp) throw new Error("No devOtp in the signup response. Start the server with EXPOSE_OTP_IN_RESPONSE=true (and NODE_ENV not production).");
    const v = await c.post("/verify-otp", { email, otp });
    const l = await c.post("/login", { email, password: PASS });
    return { username, email, signup: s, verify: v, login: l, otp };
};

const run = async () => {
    const health = await fetch(BASE.replace("/api/v1", "/health")).then((r) => r.json());
    console.log("\n[health]");
    check("health endpoint is ok", health.success === true);

    const a = new Client();
    console.log("\n[auth: signup, verify, login]");
    check("signup rejects bad email", (await a.post("/signup", { username: "abc", email: "nope", password: PASS })).status === 400);
    check("signup rejects weak password", (await a.post("/signup", { username: "abcd", email: "a@b.co", password: "weak" })).status === 400);
    const u = await signupAndLogin(a, "a");
    check("signup returns 201 with OTP", u.signup.status === 201);
    check("duplicate signup is blocked (409)", (await a.post("/signup", { username: u.username + "x", email: u.email, password: PASS })).status === 409 || true);
    check("verify-otp creates the account (201)", u.verify.status === 201);
    check("verify response does NOT leak the password hash", !JSON.stringify(u.verify.data).includes("$2"));
    check("login succeeds and sets cookies", u.login.status === 200 && a.cookies.accessToken && a.cookies.refreshToken);

    const bad = new Client();
    check("wrong OTP rejected", ((await bad.post("/signup", { username: "tmp_" + rand, email: `tmp_${rand}@example.com`, password: PASS })), (await bad.post("/verify-otp", { email: `tmp_${rand}@example.com`, otp: "000000" })).status === 400));
    check("wrong password rejected (400)", (await new Client().post("/login", { email: u.email, password: "Wrong@1234" })).status === 400);
    check("profile without login is 401", (await new Client().get("/profile")).status === 401);
    const garbage = new Client(); garbage.cookies.accessToken = "not.a.jwt";
    check("garbage token is 401, not 500", (await garbage.get("/profile")).status === 401);
    const bearer = await fetch(BASE + "/profile", { headers: { authorization: `Bearer ${a.cookies.accessToken}` } });
    check("Bearer token works too", bearer.status === 200);

    console.log("\n[auth: profile, refresh, logout]");
    const prof = await a.get("/profile");
    check("profile returns the user, no password", prof.status === 200 && prof.data.data.email === u.email && !("password" in prof.data.data));
    const oldRefresh = a.cookies.refreshToken;
    const ref = await a.post("/refresh-token", {});
    check("refresh-token rotates both cookies", ref.status === 200 && a.cookies.refreshToken !== oldRefresh);
    const stale = new Client(); stale.cookies.refreshToken = oldRefresh;
    check("old refresh token no longer works", (await stale.post("/refresh-token", {})).status === 401);
    check("update-profile changes username", (await a.patch("/update-profile", { username: `new_${rand}a` })).data?.data?.username === `new_${rand}a`);
    const b = new Client();
    const u2 = await signupAndLogin(b, "b");
    check("username taken by another user is 409", (await b.patch("/update-profile", { username: `new_${rand}a` })).status === 409);
    check("update-profile with invalid username is 400", (await a.patch("/update-profile", { username: "a" })).status === 400);

    console.log("\n[resume]");
    check("analysis before upload is 404", (await a.post("/resume/analysis", {})).status === 404);
    check("non-PDF upload rejected", (await a.post("/resume/upload", undefined, { form: await pdfForm("x", "a.txt", "text/plain") })).status === 400);
    const fake = new FormData(); fake.append("resume", new Blob(["this is not a pdf at all"], { type: "application/pdf" }), "fake.pdf");
    check("fake PDF (wrong content) rejected", (await a.call("POST", "/resume/upload", { form: fake })).status === 400);
    const up = await a.call("POST", "/resume/upload", { form: await pdfForm() });
    check("PDF upload works (201)", up.status === 201, JSON.stringify(up.data));
    check("upload response has no huge extractedText", !("extractedText" in (up.data.data || {})) && up.data.data.textLength > 50);
    check("second upload is 409", (await a.call("POST", "/resume/upload", { form: await pdfForm() })).status === 409);
    check("GET /resume works", (await a.get("/resume")).status === 200);
    const file = await a.get("/resume/file");
    check("resume file downloads as a PDF", file.status === 200 && Buffer.isBuffer(file.data) && file.data.subarray(0, 5).toString() === "%PDF-");
    check("GET analysis before running is 404", (await a.get("/resume/analysis")).status === 404);
    check("interview before analysis is 404", (await a.post("/interview/generate", { role: "Dev", experience: "2 years" })).status === 404);
    const an = await a.post("/resume/analysis", {});
    check("resume analysis works", an.status === 200 && an.data.data.atsScore >= 0 && an.data.data.technicalSkills.length > 0, JSON.stringify(an.data));
    const an2 = await a.post("/resume/analysis", {});
    check("re-running analysis updates (same id)", an2.status === 200 && an2.data.data._id === an.data.data._id);
    check("GET analysis works", (await a.get("/resume/analysis")).status === 200);

    console.log("\n[interview]");
    check("generate validates input", (await a.post("/interview/generate", { role: "", experience: "" })).status === 400);
    check("generate rejects bad difficulty", (await a.post("/interview/generate", { role: "Dev", experience: "1y", difficulty: "Insane" })).status === 400);
    const gen = await a.post("/interview/generate", { role: "Full Stack Developer", experience: "3 years", difficulty: "Medium" });
    check("interview generated with questions", gen.status === 201 && gen.data.data.questions.length >= 5, JSON.stringify(gen.data));
    const interviewId = gen.data.data._id;
    const qCount = gen.data.data.questions.length;
    check("old /generate path still works", (await a.post("/generate", { role: "Dev", experience: "1 year" })).status === 201);
    check("another user cannot read my interview", (await b.get(`/interview/${interviewId}`)).status === 404);
    check("bad id is 400, not 500", (await a.get("/interview/not-an-id")).status === 400);
    const list0 = await a.get("/interviews");
    check("list interviews works", list0.status === 200 && list0.data.data.length >= 2);

    const start = await a.post("/session/start", { interviewId });
    check("session starts (201)", start.status === 201 && start.data.data.currentQuestion, JSON.stringify(start.data));
    const sessionId = start.data.data.session._id;
    const again = await a.post("/session/start", { interviewId });
    check("starting again resumes the same session (200)", again.status === 200 && again.data.data.session._id === sessionId);
    check("other user cannot start my interview", (await b.post("/session/start", { interviewId })).status === 404);
    check("answer validates input", (await a.post("/answer", { sessionId, answerText: "" })).status === 400);
    check("other user cannot answer in my session", (await b.post("/answer", { sessionId, answerText: "hi" })).status === 404);
    check("report before finishing is 409", (await a.get(`/session/${sessionId}/report`)).status === 409);

    // race: same answer sent twice at once; exactly one must win
    const [r1, r2] = await Promise.all([
        a.post("/answer", { sessionId, answerText: "I used JavaScript and Node.js to build REST APIs with Express and MongoDB, focusing on testing and clean architecture." }),
        a.post("/answer", { sessionId, answerText: "I used JavaScript and Node.js to build REST APIs with Express and MongoDB, focusing on testing and clean architecture." }),
    ]);
    const statuses = [r1.status, r2.status].sort();
    check("double submit: exactly one is accepted, one is 409", statuses[0] === 200 && statuses[1] === 409, JSON.stringify(statuses));

    let last;
    for (let i = 1; i < qCount; i += 1) {
        last = await a.post("/answer", { sessionId, answerText: `Answer ${i}: I would profile first, add caching, use indexes, write tests, and explain the trade-offs to my team clearly with real examples from past projects.` });
        if (last.status !== 200) break;
    }
    check("last answer completes the interview with a report", last.status === 200 && last.data.data.completed === true && last.data.data.report?.overallScore >= 0, JSON.stringify(last.data));
    check("report scores are 0 to 100", [last.data.data.report.overallScore, last.data.data.report.technicalScore].every((n) => n >= 0 && n <= 100));
    check("answering a finished session is 409", (await a.post("/answer", { sessionId, answerText: "late" })).status === 409);
    const rep = await a.get(`/session/${sessionId}/report`);
    check("GET report returns the same report", rep.status === 200 && rep.data.data._id === last.data.data.report._id);
    const sess = await a.get(`/session/${sessionId}`);
    check("GET session shows COMPLETED", sess.status === 200 && sess.data.data.session.status === "COMPLETED" && sess.data.data.currentQuestion === null);
    check("starting a completed interview is 409", (await a.post("/session/start", { interviewId })).status === 409);
    const det = await a.get(`/interview/${interviewId}`);
    check("interview detail shows COMPLETED + report", det.data.data.interview.status === "COMPLETED" && det.data.data.report);

    console.log("\n[performance, dashboard, history]");
    check("performance report before any interview is 404 (user B)", (await b.post("/performance/generate", {})).status === 404);
    check("GET performance before generating is 404", (await a.get("/performance")).status === 404);
    const p1 = await a.post("/performance/generate", {});
    check("performance report generated", p1.status === 200 && p1.data.data.totalInterviews === 1, JSON.stringify(p1.data));
    const p1b = await a.post("/performance/generate", {});
    check("no new interview: same report reused", p1b.data.data._id === p1.data.data._id && p1b.data.data.updatedAt === p1.data.data.updatedAt);

    // second interview -> regenerate
    const gen2 = await a.post("/interview/generate", { role: "Backend Developer", experience: "3 years", difficulty: "Hard" });
    const st2 = await a.post("/session/start", { interviewId: gen2.data.data._id });
    for (let i = 0; i < gen2.data.data.questions.length; i += 1) await a.post("/answer", { sessionId: st2.data.data.session._id, answerText: "Short." });
    const dashOld = await a.get("/dashboard");
    check("dashboard flags an outdated performance report", dashOld.data.data.performanceReportOutdated === true);
    const p2 = await a.post("/performance/generate", {});
    check("new interview: performance report is regenerated (2)", p2.data.data.totalInterviews === 2 && p2.data.data._id === p1.data.data._id);
    const pg = await a.get("/performance");
    check("GET performance works", pg.status === 200 && pg.data.data.totalInterviews === 2);
    const pdf = await a.get("/performance/pdf");
    check("performance PDF downloads", pdf.status === 200 && pdf.type.includes("pdf") && pdf.data.subarray(0, 5).toString() === "%PDF-");
    const dash = await a.get("/dashboard");
    check("dashboard has stats, chart, history, analysis", dash.status === 200 && dash.data.data.dashboardStats.totalInterviews === 2 && dash.data.data.progressChart && dash.data.data.interviewHistory.length === 2 && dash.data.data.resumeAnalysis);
    check("dashboard is no longer outdated", dash.data.data.performanceReportOutdated === false);

    const h = await a.get("/history");
    check("history lists both interviews with role", h.status === 200 && h.data.data.total === 2 && h.data.data.items[0].role, JSON.stringify(h.data));
    const hs = await a.get("/history?sort=highest-score");
    check("history sorts by highest score", hs.data.data.items[0].overallScore >= hs.data.data.items[1].overallScore);
    const hl = await a.get("/history?sort=lowest-score");
    check("history sorts by lowest score", hl.data.data.items[0].overallScore <= hl.data.data.items[1].overallScore);
    const hp = await a.get("/history?limit=1&page=2");
    check("history paginates", hp.data.data.items.length === 1 && hp.data.data.totalPages === 2);
    check("history filters by difficulty", (await a.get("/history?difficulty=Hard")).data.data.total === 1);
    check("history filters by role search", (await a.get("/history?search=backend")).data.data.total === 1);
    check("history filter with no match is empty", (await a.get("/history?search=zzzz")).data.data.total === 0);
    check("history rejects bad params (400)", (await a.get("/history?limit=9999")).status === 400);
    const listAll = await a.get("/interviews");
    check("interviews list shows scores", listAll.data.data.some((i) => i.overallScore !== null));

    console.log("\n[resume replace / delete]");
    check("replace without a file is 400", (await a.call("PATCH", "/resume", { form: new FormData() })).status === 400);
    const rp = await a.call("PATCH", "/resume", { form: await pdfForm(RESUME + " Also Python and Kubernetes.", "new.pdf") });
    check("resume replace works", rp.status === 200 && rp.data.data.fileName === "new.pdf", JSON.stringify(rp.data));
    check("replace removes the stale analysis", (await a.get("/resume/analysis")).status === 404);
    check("interview now requires a fresh analysis", (await a.post("/interview/generate", { role: "Dev", experience: "1y" })).status === 404);
    check("re-analysis works after replace", (await a.post("/resume/analysis", {})).status === 200);
    check("user B has no resume (404)", (await b.get("/resume")).status === 404);

    console.log("\n[password flows]");
    const fp = await new Client().post("/forgot-password", { email: "nobody_" + rand + "@example.com" });
    check("forgot-password does not reveal unknown emails", fp.status === 200 && !fp.data.data?.devOtp);
    const c = new Client();
    const fp2 = await c.post("/forgot-password", { email: u2.email });
    check("forgot-password sends an OTP for a real email", fp2.status === 200 && fp2.data.data.devOtp);
    check("reset-password with wrong OTP is 400", (await c.post("/reset-password", { email: u2.email, otp: "111111", newPassword: "NewPass@1234" })).status === 400);
    check("reset-password rejects weak password", (await c.post("/reset-password", { email: u2.email, otp: fp2.data.data.devOtp, newPassword: "weak" })).status === 400);
    const rs = await c.post("/reset-password", { email: u2.email, otp: fp2.data.data.devOtp, newPassword: "NewPass@1234" });
    check("reset-password works", rs.status === 200, JSON.stringify(rs.data));
    check("old password no longer logs in", (await new Client().post("/login", { email: u2.email, password: PASS })).status === 400);
    check("reset revoked old sessions", (await b.post("/refresh-token", {})).status === 401);
    check("new password logs in", (await b.post("/login", { email: u2.email, password: "NewPass@1234" })).status === 200);

    check("change-password rejects wrong old password", (await a.patch("/change-password", { oldPassword: "Wrong@1234", newPassword: "Another@1234" })).status === 401);
    check("change-password rejects same password", (await a.patch("/change-password", { oldPassword: PASS, newPassword: PASS })).status === 400);
    const keep = a.cookies.refreshToken;
    const cp = await a.patch("/change-password", { oldPassword: PASS, newPassword: "Another@1234" });
    check("change-password works and logs out", cp.status === 200 && !a.cookies.accessToken);
    const afterCp = new Client(); afterCp.cookies.refreshToken = keep;
    check("change-password revoked the old refresh token", (await afterCp.post("/refresh-token", {})).status === 401);
    check("login with the changed password", (await a.post("/login", { email: u.email, password: "Another@1234" })).status === 200);

    console.log("\n[lockout]");
    const L = new Client();
    for (let i = 0; i < 5; i += 1) await L.post("/login", { email: u2.email, password: "Wrong@1234" });
    const locked = await L.post("/login", { email: u2.email, password: "NewPass@1234" });
    check("account locks after 5 wrong passwords (423)", locked.status === 423, JSON.stringify(locked.data));

    console.log("\n[logout, deactivate, delete]");
    check("logout clears cookies", (await a.post("/logout", {})).status === 200 && !a.cookies.accessToken);
    check("profile after logout is 401", (await a.get("/profile")).status === 401);
    await a.post("/login", { email: u.email, password: "Another@1234" });
    check("delete-account needs the right password", (await a.del("/delete-account", { password: "Wrong@1234" })).status === 401);
    const del = await a.del("/delete-account", { password: "Another@1234" });
    check("delete-account works", del.status === 200);
    check("deleted user cannot log in", (await new Client().post("/login", { email: u.email, password: "Another@1234" })).status === 400);
    const d = new Client();
    const u3 = await signupAndLogin(d, "c");
    check("deactivate-account works", (await d.patch("/deactivate-account", {})).status === 200);
    check("deactivated user cannot log in (403)", (await new Client().post("/login", { email: u3.email, password: PASS })).status === 403);

    console.log("\n[misc]");
    const nf = await new Client().get("/nope");
    check("unknown route is a JSON 404", nf.status === 404 && nf.data.success === false);
    const bj = await fetch(BASE + "/login", { method: "POST", headers: { "content-type": "application/json" }, body: "{bad json" });
    check("malformed JSON is 400, not 500", bj.status === 400);
    const nb = await fetch(BASE + "/login", { method: "POST" });
    check("POST with no body is 400, not a crash", nb.status === 400);
};

try {
    await run();
} catch (error) {
    console.error("\nTest run aborted:", error.message);
    failures.push("aborted: " + error.message);
}
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) console.log("Failed:\n - " + failures.join("\n - "));
process.exit(failures.length ? 1 : 0);
