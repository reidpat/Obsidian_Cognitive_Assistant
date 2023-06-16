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
        init();
        console.log(chatHistoryOptions);
    });

    async function init() {
        chatHistoryOptions = await getFiles();
        selectedHistory = chatHistoryOptions[0];
        chatHistoryFile = await plugin.vault.getAbstractFileByPath(
            "LLM History/" + selectedHistory.title
        );
        conversationHistory = await loadChatHistory(selectedHistory.content);
        console.log(chatHistoryFile);
    }

    let conversationHistory: BaseChatMessage[] = [];
    let recordConversation = true;
    let chatHistoryFile;
    let rawFiles = [];
    let chatHistoryText;
    let selectedHistory;
    let chatHistoryOptions: any[] = [];
    let loading = false;
    let messagesContainer;

    async function createNewConversation() {
        let newFile = await plugin.vault.create("LLM History/newChat.md", "");
        chatHistoryFile = newFile;
        chatHistoryText = await getFile(newFile);

        chatHistoryOptions = [...chatHistoryOptions, chatHistoryText];
        await loadChatHistory(chatHistoryText.content);
        selectedHistory = chatHistoryText;
        console.log(newFile);
    }

    async function getFile(f) {
        const content = await plugin.vault.read(f);
        const title = f.name;
        return { content, title };
    }

    //this is repeated from the starterIndex file and will need to be abstracted
    async function getFiles() {
        const files = plugin.vault.getMarkdownFiles();
        rawFiles = files;
        const filteredFiles = files.filter((f) =>
            f.path.includes("LLM History")
        );
        const result = await Promise.all(
            filteredFiles.map(async (f) => getFile(f))
        );
        return result;
    }

    async function selectNewChat() {
        chatHistoryFile = await plugin.vault.getAbstractFileByPath(
            "LLM History/" + selectedHistory.title
        );
        let tempHistory = await getFile(chatHistoryFile);
        // let metaData = await getFileCache(chatHistoryFile);
        // console.log(metaData);
        conversationHistory = await loadChatHistory(tempHistory.content);
    }

    function parseChatLog(chatLog) { 
        let messages: BaseChatMessage[] = [];
        if (chatLog.length == 0) {
            return messages;
        }
        // Use a regular expression to split the text into message prefixes and contents
        const rawMessages = chatLog.match(
            /(human|ai):[\s\S]*?(?=(human|ai):|$)/g
        );

        // Create an array of message objects

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
    async function loadChatHistory(fileContent) {
        conversationHistory = parseChatLog(fileContent);
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
        console.log(chatHistoryFile);
        plugin.vault.append(
            chatHistoryFile,
            `\n${message.role}:\n${message.content}\n`
        );
    }

    async function renameConversation(fileName, newFileName) {
        console.log(fileName, newFileName);
        let file = await plugin.vault.getAbstractFileByPath(
            "LLM History/" + fileName
        );
        chatHistoryFile = file;
        
        await plugin.vault.rename(file, "LLM History/" + newFileName);
        init();
    }

    async function generateNewName() {
        const newChat = new ChatOpenAI({
            openAIApiKey: openAIKey,
            temperature: 0.7,
        }); 
        console.log(conversationHistory);
        const res = await newChat.call(
            [   ...conversationHistory,
                new SystemChatMessage(
                    "Create a short but unique name for the following conversation."
                ),
                new SystemChatMessage(
                    "your response should be no longer than 6 words"
                ),
                new SystemChatMessage(

                    "only include the exact name in your response and no other words"
                ),
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
        let newName = filterInvalidChars(res.text);
        console.log(newName);
        renameConversation("newChat.md", newName + ".md");
    }

    function filterInvalidChars(fileName) {
        // The RegExp pattern below matches all invalid characters commonly disallowed in file systems
        let pattern = /[\/\\:*?"<>#.|]/g;

        // Replace all invalid characters in the fileName string with an empty string
        let validFileName = fileName.replace(pattern, "");

        return validFileName;
    }

    async function langChainPrompt(): Promise<void> {
        if (promptInput.trim() == "") {
            return;
        }
        loading = true;
        conversationHistory.push(new HumanChatMessage(promptInput));
        conversationHistory = conversationHistory;
        addMessageToHistory({ role: "human", content: promptInput });
        promptInput = "";
        const chat = new ChatOpenAI({
            openAIApiKey: openAIKey,
            temperature: 0.3,
        });

        const response = await chat.call(
            [...conversationHistory, new SystemChatMessage(selected.content)],
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
        if ((selectedHistory.title = "newChat")) {
            generateNewName();
        }
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
    <select bind:value={selectedHistory} on:change={selectNewChat}>
        {#each chatHistoryOptions as file}
            <option value={file}>
                {file.title}
            </option>
        {/each}
    </select>

    <button
        on:click={createNewConversation}
        class:disabled={!selectedHistory ||
            selectedHistory.title == "newChat.md"}>New Chat</button
    >
    <button
        on:click={() => {
            renameConversation(selectedHistory.title, "new Name.md");
        }}>Rename</button
    >
    <button
        on:click={() => {
           init();
        }}>Reset</button
    >
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
        margin-top: 20px;
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
