<script lang="ts">
    import "dotenv/config";
    import { requestUrl, Notice, App, TAbstractFile } from "obsidian";

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
    });

    type ChatHistory = {
        content: string;
        file: TAbstractFile;
    };

    let chatIndex: number = 0;
    let chatHistoryList: ChatHistory[] = [];

    async function init() {
        chatHistoryList = await getFiles("./LLM History");
        chatIndex = 0;
        conversationMessages = await loadConversationMessages(
            chatHistoryList[chatIndex].content
        );
    }

    let conversationMessages: BaseChatMessage[] = [];
    let recordConversation: boolean = true;
    let loading = false;
    let messagesContainer;

    async function createNewConversation() {
        let newFile = await plugin.vault.create("LLM History/newChat.md", "");
        chatHistoryList = [...chatHistoryList, await getFile(newFile)];
        await loadConversationMessages(chatHistoryList[chatIndex].content);
    }

    async function getFile(
        f: string
    ): Promise<{ content: string; file: TAbstractFile }> {
        return {
            file: await plugin.vault.getAbstractFileByPath(f),
            content: await plugin.vault.adapter.read(f),
        };
    }

    //this is repeated from the starterIndex file and will need to be abstracted
    async function getFiles(path: string) {
        const files = await plugin.vault.adapter.list(path); //"(./filepath)"
        const filesContent = await Promise.all(
            files.files.map(async (f: string) => {
                return getFile(f.substring(2));
            })
        );
        return filesContent;
    }

    async function selectNewChat() {
        chatHistoryList[chatIndex] = await getFile(chatHistoryList[chatIndex].file.path);
        conversationMessages = await loadConversationMessages(
            chatHistoryList[chatIndex].content
        );
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

    async function loadConversationMessages(fileContent: string) {
        let conversationHistory = parseChatLog(fileContent);
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
            chatHistoryList[chatIndex].file,
            `\n${message.role}:\n${message.content}\n`
        );
    }

    async function renameConversation(fileName, newFileName) {
        console.log(fileName, newFileName);
        let file = await plugin.vault.getAbstractFileByPath(
            "LLM History/" + fileName
        );
        chatHistoryList[chatIndex].file = file;

        await plugin.vault.rename(file, "LLM History/" + newFileName);
        init();
    }

    async function generateNewName() {
        const newChat = new ChatOpenAI({
            openAIApiKey: openAIKey,
            temperature: 0.7,
        });
        console.log(conversationMessages);
        const res = await newChat.call(
            [
                ...conversationMessages,
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
        conversationMessages = [
            ...conversationMessages,
            new HumanChatMessage(promptInput),
        ];
        addMessageToHistory({ role: "human", content: promptInput });
        promptInput = "";
        const chat = new ChatOpenAI({
            openAIApiKey: openAIKey,
            temperature: 0.3,
        });

        const response = await chat.call(
            [...conversationMessages, new SystemChatMessage(selected.content)],
            {
                options: {
                    headers: {
                        mode: "cors",
                        "Access-Control-Allow-Origin": "*",
                    },
                },
            }
        );
        conversationMessages = [
            ...conversationMessages,
            new AIChatMessage(response.text),
        ];
        addMessageToHistory({ role: "ai", content: response.text });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        // if ((.title = "newChat")) {
        //     generateNewName();
        // }
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
    <select bind:value={chatIndex} on:change={selectNewChat}>
        {#if chatHistoryList.length > 0}
            {#each chatHistoryList as chatHistory, i}
                <option value={i}>
                    {chatHistory.file.name}
                </option>
            {/each}
        {/if}
    </select>

    <button
        on:click={createNewConversation}
        >New Chat</button
    >
    <button
        on:click={() => {
            renameConversation(chatHistoryList[chatIndex].file, "new Name.md");
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
        {#each conversationMessages as message (message.text)}
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
                        >Copy</button
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
        top: 0;
        /* transform: translateY(-50%); */
        visibility: hidden;
        cursor: pointer;
        background: black;
        border: none;
        font-size: 1.2em;
    }

    .message:hover .copy-button {
        visibility: visible;
    }
</style>
