"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");

const LOG_DIR = path.join(__dirname, "../logs");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const COLORS = {
    INFO: "\x1b[36m",      // Cyan
    WARN: "\x1b[33m",      // Yellow
    ERROR: "\x1b[31m",     // Red
    DEBUG: "\x1b[90m",     // Gray
    SUCCESS: "\x1b[32m",   // Green
    RESET: "\x1b[0m",
};

const ICONS = {
    INFO: "ℹ",
    WARN: "⚠",
    ERROR: "✖",
    DEBUG: "🐛",
    SUCCESS: "✔",
};

function safeStringify(data) {
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return util.inspect(data, {
            depth: null,
            colors: false,
        });
    }
}

function getMemory() {
    const heap = process.memoryUsage().heapUsed / 1024 / 1024;

    return `${heap.toFixed(2)} MB`;
}

function timestamp() {
    return new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
}

function writeFile(text) {
    const file = path.join(
        LOG_DIR,
        `app-${new Date().toISOString().split("T")[0]}.log`
    );

    fs.appendFile(file, text + "\n\n", "utf8", (err) => {
        if (err) {
            console.error("Logger Write Error:", err);
        }
    });
}

function buildLog(level, message, meta) {
    let output = "";

    output += "──────────────────────────────────────────────\n";

    output += `${ICONS[level]} ${level}\n\n`;

    output += `Time       : ${timestamp()}\n`;
    output += `PID        : ${process.pid}\n`;
    output += `Environment: ${process.env.NODE_ENV || "development"}\n`;
    output += `Memory     : ${getMemory()}\n`;

    if (meta?.requestId) {
        output += `Request ID : ${meta.requestId}\n`;
    }

    output += "\n";

    if (message instanceof Error) {
        output += `Message:\n${message.message}\n\n`;

        if (message.stack) {
            output += `Stack:\n${message.stack}\n`;
        }
    } else if (typeof message === "object") {
        output += safeStringify(message);
    } else {
        output += message;
    }

    if (meta) {
        const metadata = { ...meta };
        delete metadata.requestId;

        if (Object.keys(metadata).length) {
            output += "\n\nMetadata:\n";
            output += safeStringify(metadata);
        }
    }

    output += "\n──────────────────────────────────────────────";

    return output;
}

function print(level, output) {
    const color = COLORS[level] || "";

    console.log(color + output + COLORS.RESET);
}

function logger(level = "INFO", message = "", meta = {}) {
    try {
        const output = buildLog(level, message, meta);

        print(level, output);

        writeFile(output);
    } catch (err) {
        console.error("Logger Failure");
        console.error(err);
    }
}

logger.info = (msg, meta) => logger("INFO", msg, meta);

logger.warn = (msg, meta) => logger("WARN", msg, meta);

logger.error = (msg, meta) => logger("ERROR", msg, meta);

logger.debug = (msg, meta) => logger("DEBUG", msg, meta);

logger.success = (msg, meta) => logger("SUCCESS", msg, meta);

module.exports = logger;