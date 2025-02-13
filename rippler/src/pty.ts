import { spawn, IPty } from "node-pty";
import { v4 as uuidv4 } from "uuid";

const SHELL = "/bin/rbash";
const RESTRICTED_SHELL = "restricted_shell.sh";

export class TerminalManager {
  private sessions: {
    [id: string]: { terminal: IPty; replId: string; socketId: string };
  } = {};

  constructor() {
    this.sessions = {};
  }

  createPty(
    socketId: string,
    replId: string,
    onData: (data: string, sessionId: string) => void
  ): string {
    const sessionId = uuidv4();

    const term: IPty = spawn(SHELL, ["-c", RESTRICTED_SHELL], {
      cols: 100,
      rows: 30,
      name: "xterm-256color",
      cwd: "/workspace",
      env: {
        ...process.env,
        HOME: "/workspace",
        PATH: "/usr/local/bin:" + (process.env.PATH || ""),
      },
    });

    term.onData((data: string) => onData(data, sessionId));

    this.sessions[sessionId] = {
      terminal: term,
      replId,
      socketId,
    };

    term.onExit(() => {
      delete this.sessions[sessionId];
    });

    return sessionId;
  }

  suspend(sessionId: string) {
    const session = this.sessions[sessionId];
    if (session) {
      session.terminal.kill();
      delete this.sessions[sessionId];
    }
  }

  write(sessionId: string, data: string) {
    this.sessions[sessionId]?.terminal.write(data);
  }

  resize(sessionId: string, cols: number, rows: number) {
    const session = this.sessions[sessionId];
    if (session) {
      session.terminal.resize(cols, rows);
    }
  }

  clear(sessionId: string) {
    this.sessions[sessionId]?.terminal.kill();
    delete this.sessions[sessionId];
  }
}
