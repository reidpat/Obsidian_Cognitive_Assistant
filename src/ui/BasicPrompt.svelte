<script lang="ts">
    import "dotenv/config";
    import { requestUrl, Notice } from "obsidian";

    let systemInput = "";
    let promptInput = "";
    let promptOutput = "res...";
    export let openAIKey: string = "";
    export let personas: any[] = [];
    let selected;

    import { ChatOpenAI } from "langchain/chat_models/openai";
    import {
        HumanChatMessage,
        SystemChatMessage,
        BaseChatMessage,
        AIChatMessage,
    } from "langchain/schema";

    let conversationHistory: BaseChatMessage[] = loadChatHistory();

    //Eventually will read from a Markdown(?) file
    function loadChatHistory() {
        return [
            new HumanChatMessage("Congratulate me on completing this code"),
            new AIChatMessage(
                "Congratulations! I'm happy to hear that you've completed your code test. How do you feel like the test went overall? What can you do to improve further?"
            ),
        ];
    }

    function handleKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            langChainPrompt();
        }
    }

    async function langChainPrompt(): Promise<void> {
        if (promptInput.trim() == "") {
            return;
        }
        conversationHistory.push(new HumanChatMessage(promptInput));
        conversationHistory = conversationHistory;
        promptInput = "";
        const chat = new ChatOpenAI({ openAIApiKey: openAIKey});
        const response = await chat.call(
            [new SystemChatMessage(selected.content), ...conversationHistory],
            { 
                options: {
                    headers: {
                        mode: "cors",
                        "Access-Control-Allow-Origin": "*",
                    },
                },
            }
        );
        conversationHistory.push(new AIChatMessage(response.text));
        conversationHistory = conversationHistory;
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // console.("Text copied to clipboard");
            new Notice("Text Copied");
        } catch (err) {
            console.log("Error in copying text: ", err);
        }
    }
</script>

<div>
    <h1>Basic Prompt</h1>
    <label for="system">System Instructions</label>
    <!-- <input name="system" type="text" bind:value={systemInput} /> -->
    <select bind:value={selected}>
        {#each personas as persona}
            <option value={persona}>
                {persona.title}
            </option>
        {/each}
    </select>
    <div class="conversation-window">
        {#each conversationHistory as message (message.text)}
            {#if message._getType() != "system"}
            <div class="message" class:human="{message._getType() === "human"}" class:ai="{message._getType() === "ai"}">
                <span>{message.text}</span>
                <button  
                    class="copy-button"
                    on:click={() => copyToClipboard(message.text)}>📋</button
                >
            </div>
            {/if}
         
        {/each}
        <div class="input-area">
            <textarea bind:value={promptInput} on:keydown={handleKeydown} />
            <button
                on:click={() => {
                    langChainPrompt();
                }}>Send</button
            >
        </div>
    </div>
</div>

<style>
    .conversation-window {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 1200px;
    }
    .message {
        border: 1px solid white;
        max-width: 80%;
        margin: 10px;
    }
    .ai {
        align-self: flex-start;
    }
    .human {
        align-self: flex-end;
    }
    .input-area {
        display: flex;
        justify-content: space-between;
        padding: 1em;
    }

    .input-area textarea {
        flex-grow: 1;
        margin-right: 1em;
        resize: vertical; 
    }

    .message {  
        position: relative;
    }

    .copy-button {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        visibility: hidden;
        cursor: pointer;
        background: none;
        border: none;
        font-size: 1.2em;
    }

    .message:hover .copy-button {
        visibility: visible;
    }
</style>
