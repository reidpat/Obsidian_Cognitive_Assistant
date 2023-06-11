import { App, ItemView, Platform, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';


import 'dotenv/config'
// import { OpenAI } from "langchain/llms/openai";
// import DiceRoller from "./ui/DIceRoller.svelte";
import BasicPrompt from './ui/BasicPrompt.svelte';
const VIEW_TYPE = "svelte-view";

const setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function newSetRequestHeader(
    key: string,
    val: string
) {
    if (key.toLocaleLowerCase() === "user-agent") {
        return;
    }
    setRequestHeader.apply(this, [key, val]);
};

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
    mySetting: string;
    openAI_API_Key: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    openAI_API_Key: import.meta.env.VITE_OPENAI_API_KEY
}


// class MySvelteView extends ItemView {
//     view: DiceRoller;

//     getViewType(): string {
//         return VIEW_TYPE;
//     }

//     getDisplayText(): string {
//         return "Dice Roller";
//     }

//     getIcon(): string {
//         return "dice";
//     }

//     async onOpen(): Promise<void> {

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         this.view = new DiceRoller({ target: (this as any).contentEl, props: {} });
//     }
// }

class BasicPromptView extends ItemView {
    view: BasicPrompt;
    openAIKey: string;
    personas: any[];

    constructor(leaf: WorkspaceLeaf, openAIKey: string, personas: any[]) {
        super(leaf);
        this.openAIKey = openAIKey;
        this.personas = personas;
    }


    getViewType(): string {
        return VIEW_TYPE
    }

    getDisplayText(): string {
        return "Basic Prompt";
    }

    getIcon(): string {
        return "dice"
    }


    async onOpen(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.view = new BasicPrompt({ target: (this as any).contentEl, props: { openAIKey: this.openAIKey, personas: this.personas } });
    }
}

export default class MyPlugin extends Plugin {
    // private view: MySvelteView;
    private view: BasicPromptView;
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        const openAIKey = this.settings.openAI_API_Key;
        const personas = await getFiles(this);

        async function getFiles(that) {
            const files = that.app.vault.getMarkdownFiles();
            const filteredFiles = files.filter(f => f.path.includes("LLM Personas"));
            const result = await Promise.all(filteredFiles.map(async f => {
                const content = await that.app.vault.read(f);
                const title = f.name;
                return { content, title }
            }));
            return result;
        }


        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new BasicPromptView(leaf, openAIKey, personas))
        );

        // this.registerView(
        //     VIEW_TYPE,
        //     (leaf: WorkspaceLeaf) => (this.view = new BasicPrompt(leaf))
        // );

        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

        // This creates an icon in the left ribbon.
        this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => this.openMapView());

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-sample-modal-simple',
            name: 'Open sample modal (simple)',
            callback: () => this.openMapView(),
        });
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    onLayoutReady(): void {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE,
        });
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async openMapView() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(VIEW_TYPE);
        const leaf = workspace.getLeaf(
            // @ts-ignore
            !Platform.isMobile
        );
        await leaf.setViewState({ type: VIEW_TYPE });
        workspace.revealLeaf(leaf);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });


        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('openAI_API_Key')
            .setDesc('Add your openAI API key here')
            .addText(text => text
                .setPlaceholder("enter key")
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
                
    }
}
