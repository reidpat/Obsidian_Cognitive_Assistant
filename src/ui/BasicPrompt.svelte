<script lang="ts">
    import "dotenv/config";
    import { requestUrl, Notice, App } from "obsidian";

    let promptInput = "";
    export let openAIKey: string = "";
    export let personas: any[] = [];
    export let plugin;
    let selected;

    import { ChatOpenAI } from "langchain/chat_models/openai";
    import {
        HumanChatMessage,
        SystemChatMessage,
        BaseChatMessage,
        AIChatMessage,
    } from "langchain/schema";
    import { onMount } from "svelte";

    onMount(async () => {
        conversationHistory = await loadChatHistory();
    });
    let conversationHistory: BaseChatMessage[] = [];
    let recordConversation = true;
    let chatHistoryFile;
    let loading = false;
    let messagesContainer;

    async function createNewConversation() {
        let newFile = await plugin.vault.create(
            "LLM History/newChat.md",
            "this is a new chat"
        );
        chatHistoryFile = newFile;
        console.log(newFile);
    }

    function parseChatLog(chatLog) {
        // Use a regular expression to split the text into message prefixes and contents
        const rawMessages = chatLog.match(
            /(human|ai):[\s\S]*?(?=(human|ai):|$)/g
        );

        // Create an array of message objects
        let messages: BaseChatMessage[] = [];
        for (let rawMessage of rawMessages) {
            const prefix = rawMessage.slice(0, rawMessage.indexOf(":")).trim();
            const message = rawMessage
                .slice(rawMessage.indexOf(":") + 1)
                .trim();

            if (prefix === "human") {
                messages.push(new HumanChatMessage(message));
            } else if (prefix === "ai") {
                messages.push(new AIChatMessage(message));
            }
        }

        return messages;
    }

    //Eventually will read from a Markdown(?) file
    async function loadChatHistory() {
        chatHistoryFile = await plugin.vault.getAbstractFileByPath(
            "LLM History/newChat.md"
        );
        let historyContent = await plugin.vault.read(chatHistoryFile);
        conversationHistory = parseChatLog(historyContent);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return conversationHistory; 
    }

    function handleKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            langChainPrompt();
        }
    }

    async function addMessageToHistory(message) {
        plugin.vault.append(
            chatHistoryFile,
            `\n${message.role}:\n${message.content}\n`
        );
    }

    async function langChainPrompt(): Promise<void> {
        if (promptInput.trim() == "") {
            return;
        }
        let loading = true;
        conversationHistory.push(new HumanChatMessage(promptInput));
        conversationHistory = conversationHistory;
        addMessageToHistory({ role: "human", content: promptInput });
        promptInput = "";
        const chat = new ChatOpenAI({ openAIApiKey: openAIKey });
        
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
        addMessageToHistory({ role: "ai", content: response.text });
        conversationHistory = conversationHistory;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        loading = false;
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

    <button on:click={createNewConversation}>New Chat</button>
    <label for="record">Record Conversation</label>
    <input type="checkbox" name="record" bind:checked={recordConversation} />
    <div class="conversation-window" bind:this={messagesContainer}>
        {#each conversationHistory as message (message.text)}
            {#if message._getType() != "system"}
                <div
                    class="message"
                    class:human={message._getType() === "human"}
                    class:ai={message._getType() === "ai"}
                >
                    <span>{message.text}</span>
                    <button
                        class="copy-button"
                        on:click={() => copyToClipboard(message.text)}
                        >📋</button
                    >
                </div>
            {/if}
        {/each}
        {#if loading}
            <div class="message ai"><span>loading...</span></div>
        {/if}
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
        max-height: 80vh;
        overflow-y: scroll;
        border: 1px solid grey;
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
