import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";
import * as cmd from "./commands";
import { Ctx } from "./context";

export async function activate(ext: vs.ExtensionContext) {
    const ctx = new Ctx(ext, create_client(), create_command_registry());
    await ctx.start();
}

export function deactivate(): Thenable<void> | undefined {
    return undefined;
}

function create_client(): lc.LanguageClient {
    let server_path = "rock_ls";
    let server_exe = {
        command: server_path,
        args: ["lsp"],
        transport: lc.TransportKind.stdio
    };

    const server_options: lc.ServerOptions = {
        run: server_exe,
        debug: server_exe,
    };

    const client_options: lc.LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "rock" }],
        synchronize: {
            fileEvents: vs.workspace.createFileSystemWatcher("**/*.rock"),
        },
    };

    const client = new lc.LanguageClient(
        "rock-ls",
        "rock-ls",
        server_options,
        client_options
    );
    client.registerFeature(new OverrideFeature());
    return client;
}

function create_command_registry(): Record<string, cmd.CommandImpl> {
    return {
        "restart": {
            enabled: (ctx) => async () => { await ctx.restart() },
            disabled: (ctx) => async () => { await ctx.start() },
        },
        "disable": {
            enabled: (ctx) => async () => { await ctx.stop() },
            disabled: (_) => async () => { },
        },
        "show_syntax_tree": { enabled: cmd.show_syntax_tree },
    }
}

class OverrideFeature implements lc.StaticFeature {
    getState(): lc.FeatureState {
        return { kind: "static" };
    }
    fillClientCapabilities(capabilities: lc.ClientCapabilities): void {
        const caps = capabilities.textDocument?.semanticTokens;
        if (caps) {
            caps.augmentsSyntaxTokens = false;
        }
    }
    initialize(
        _capabilities: lc.ServerCapabilities,
        _documentSelector: lc.DocumentSelector | undefined,
    ): void { }
    clear(): void { }
}
