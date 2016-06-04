window.server = {
	mode: "integrated",
	configuration: "development",
	version: "1.0b",
	serviceName: "Rutgers Exchange",
	supportEmail: "support@rutgersxchange.com"
};

// Deprecation notice: only integrated mode will work for image uploads
// NOTE: Servers should use the 'mode' selector, NOT the 'configuration' selector
window.servers = {
	development: "http://localhost:3000",
	production: "https://www.rutgersxchange.com",
	integrated: ""
};

// NOTE: Faye servers should use the 'configuration' selector, NOT the 'mode' selector
window.fayeServers = {
	development: "http://localhost:9292",
	production: "https://www.rutgersxchange.com:9292"
};