<script lang="ts">
    import "dotenv/config";
    import { requestUrl } from "obsidian";

    let systemInput = "talk like a pirate";
    let promptInput = "congratulate me on completing this code test";
    let promptOutput = "res...";
    export let openAIKey: string = "";

    import { ChatOpenAI } from "langchain/chat_models/openai";
    import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

    

    async function langChainPrompt(promptInput: string): Promise<void> {
        const chat = new ChatOpenAI({ openAIApiKey: openAIKey, maxTokens: 20});
        const response = await chat.call(
            [
                new SystemChatMessage(systemInput),
                new HumanChatMessage(promptInput),
            ],
            {
                options: {
                    headers: {
                        mode: "cors",
                        "Access-Control-Allow-Origin": "*",
                    },
                },
            }
        );

        console.log(response);
        promptOutput = response.text;
    }
</script>

<div>
    <h1>Basic Prompt</h1>
    <label for="system">System Input</label>
    <input name="system" type="text" bind:value={systemInput} />
    <label for="user">User</label>
    <input name="user" type="text" bind:value={promptInput} />
    <button
        on:click={() => {
            langChainPrompt(promptInput);
        }}>Send Prompt</button
    >
    <span>{promptOutput}</span>
</div>
