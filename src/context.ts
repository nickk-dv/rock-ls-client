import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";
import * as cmd from "./commands";

export class Ctx {
    public ext: vs.ExtensionContext;
    public client: lc.LanguageClient;
    private command_registry: Record<string, cmd.CommandImpl>;
    private command_disposable: Disposable[];

    constructor(
        ext: vs.ExtensionContext,
        client: lc.LanguageClient,
        command_registry: Record<string, cmd.CommandImpl>
    ) {
        this.ext = ext;
        this.client = client;
        this.command_registry = command_registry;
        this.command_disposable = [];

        ext.subscriptions.push(this);
        this.update_commands("disable");
    }

    async dispose() {
        this.command_disposable.forEach((disposable) => disposable.dispose());
        this.command_disposable = [];
    }

    async start() {
        await this.client.start().catch((_) => {
            let msg = `Failed to activate the \`rock-ls\` language server.\n`
                + `Ensure that \`rock\` compiler install directory is added to PATH.\n`
                + `Relaunch the editor to apply the environment changes.\n`
            vs.window.showErrorMessage(msg);
        });
        this.update_commands();
    }

    async stop() {
        this.update_commands("disable");
        await this.client.stop();
    }

    async restart() {
        await this.stop();
        await this.start();
    }

    private update_commands(force_disable?: "disable") {
        this.command_disposable.forEach((disposable) => disposable.dispose());
        this.command_disposable = [];

        let use_enabled = !force_disable && this.client.isRunning();

        for (const [name, command_impl] of Object.entries(this.command_registry)) {
            const full_name = `rock-ls.${name}`;
            let callback;

            if (use_enabled) {
                callback = command_impl.enabled(this);
            } else if (command_impl.disabled) {
                callback = command_impl.disabled(this);
            } else {
                let msg = `command \`${full_name}\` failed: rock-ls server is not running`;
                callback = () => vs.window.showErrorMessage(msg);
            }

            const disposable = vs.commands.registerCommand(full_name, callback);
            this.command_disposable.push(disposable);
        }
    }
}

export interface Disposable {
    dispose(): void;
}
