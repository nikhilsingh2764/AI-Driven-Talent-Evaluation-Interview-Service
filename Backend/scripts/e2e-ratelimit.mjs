// Run through scripts/run-e2e.mjs (server started with rate limiting ENABLED).
const BASE = `${process.env.BASE_URL}/api/v1`;
const rand = Math.random().toString(36).slice(2, 8);
const PASS = "Passw0rd@123";
let failures = 0;
const check = (name, ok) => { console.log(`  ${ok ? "ok  " : "FAIL"} ${name}`); if (!ok) failures += 1; };
const post = async (path, body) => {
    const r = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json().catch(() => ({})) };
};

console.log("\n[rate limits]");
const email = `rl_${rand}@example.com`;
const s = await post("/signup", { username: `rl_${rand}`, email, password: PASS });
await post("/verify-otp", { email, otp: s.data.data.devOtp });

// Everyone behind one proxy (Render + Vercel) shares ONE apparent IP. 10 wrong passwords for a victim's address must
// not lock out other people - the limit is per email, not per IP.
const victim = `victim_${rand}@example.com`;
const statuses = [];
for (let i = 0; i < 12; i++) statuses.push((await post("/login", { email: victim, password: "Wrong@1234" })).status);
check("10 failed logins are answered normally (400)", statuses.slice(0, 10).every((x) => x === 400));
check("the 11th failed login for the same email is blocked (429)", statuses[10] === 429 && statuses[11] === 429);
check("a DIFFERENT account from the same IP can still sign in", (await post("/login", { email, password: PASS })).status === 200);
check("successful logins are not counted against the limit", (await post("/login", { email, password: PASS })).status === 200);

const blocked = await post("/login", { email: victim, password: "Wrong@1234" });
check("the 429 response uses the normal JSON error shape", blocked.data.success === false && blocked.data.statusCode === 429);

console.log(`\n${failures ? failures + " FAILED" : "all rate-limit checks passed"}`);
process.exit(failures ? 1 : 0);
