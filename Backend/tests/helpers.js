// Minimal env so modules that read process.env can be imported in unit tests.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/test";
process.env.ACCESS_TOKEN_SECRET ||= "test-access-secret-test-access-secret";
process.env.REFRESH_TOKEN_SECRET ||= "test-refresh-secret-test-refresh-secret";
