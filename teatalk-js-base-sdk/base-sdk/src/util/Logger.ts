/**
 * Created by H5 on 2020/2/22.
 */

enum LogLevel {
    TRACE = 1, DEBUG, INFO, WARN, ERROR, FATAL, SILENT
}

export default class Logger {
    private static logLevel: number = LogLevel.INFO;

    /**
     * 设置 SDK 的日志输出级别
     * @param level
     */
    static setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    private static log(level: LogLevel, args: any[]): void {
        if (!level || level >= LogLevel.SILENT || this.logLevel > level || !args.length) {
            return;
        }
        let logArgs: any[] = [`[${(new Date()).toLocaleString()}] [${LogLevel[level]}]`];
        let firstArg: any = args[0];
        if (typeof firstArg === "function") {
            firstArg = firstArg();
            if (firstArg instanceof Array) {
                logArgs.push.apply(logArgs, firstArg);
            } else {
                logArgs.push(firstArg);
            }
        } else {
            logArgs.push(firstArg);
        }
        if (args.length > 1) {
            logArgs = logArgs.concat(args.slice(1));
        }
        let logFunc: (...args: any[]) => void;
        switch (level) {
            case LogLevel.TRACE:
            case LogLevel.DEBUG:
                logFunc = console.debug;
                break;
            case LogLevel.INFO:
                logFunc = console.info;
                break;
            case LogLevel.WARN:
                logFunc = console.warn;
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                logFunc = console.error;
                break;
            default:
                logFunc = console.log;
                break;
        }
        logFunc.apply(console, logArgs);
    }

    static logTrace(...args: any[]): void {
        this.log(LogLevel.TRACE, args);
    }

    static logDebug(...args: any[]): void {
        this.log(LogLevel.DEBUG, args);
    }

    static logInfo(...args: any[]): void {
        this.log(LogLevel.INFO, args);
    }

    static logWarn(...args: any[]): void {
        this.log(LogLevel.WARN, args);
    }

    static logError(...args: any[]): void {
        this.log(LogLevel.ERROR, args);
    }

    static logFatal(...args: any[]): void {
        this.log(LogLevel.FATAL, args);
    }
}
