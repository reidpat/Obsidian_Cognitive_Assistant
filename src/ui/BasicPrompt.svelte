<script lang="ts">
    import "dotenv/config";
    import { requestUrl, Notice, TAbstractFile, parseFrontMatterEntry} from "obsidian";

    let promptInput = "";
    export let openAIKey: string = "";
    export let app;

    import { ChatOpenAI } from "langchain/chat_models/openai";
    import {
        HumanChatMessage,
        SystemChatMessage,
        BaseChatMessage,
        AIChatMessage,
    } from "langchain/schema";
    import { onMount } from "svelte";

    onMount(async () => {
        await init();
    });

    type ChatHistory = {
        content: string;
        file: TAbstractFile;
        metaData: any;
    };

    let chatIndex: number = 0;
    let chatHistoryList: ChatHistory[] = [];

    let personasIndex: number = 0;
    let personasList: any[] = [];

    async function init() {
        chatHistoryList = await getFiles("./LLM History");
        personasList = await getFiles("./LLM Personas");
        chatIndex = 0;
        selectNewChat();
    }

    let conversationMessages: BaseChatMessage[] = [];
    let recordConversation: boolean = true;
    let loading = false;
    let messagesContainer;

    async function createNewConversation() {
        let index = findFileNameInList(chatHistoryList, "newChat.md");
        if (index < 0) {
            let newFile = await app.vault.create(
                "LLM History/newChat.md",
                ""
            );
            let loadedNewFile = await getFile(newFile.path);
            chatHistoryList = [...chatHistoryList, loadedNewFile];
            chatIndex = chatHistoryList.length - 1;
        } else {
            chatIndex = index;
        }

        await selectNewChat();
    }

    async function parseFrontMatter(f:string){
        let file = app.vault.getAbstractFileByPath(f)
        let metaData;
        await app.fileManager.processFrontMatter(file, fm => metaData = fm);
        // console.log(metadata);

        return metaData;
    }

    function findFileNameInList(list, name){
        let index = -1;
        for (let i = 0; i < list.length; i++) { 
            if (list[i].file.name.toLowerCase() == name.toLowerCase()) {
                index = i; 
                break;
            }
        }
        return index;
    }

    async function getFile(
        f: string
    ): Promise<{ content: string; file: TAbstractFile; metaData }> {
        return {
            file: await app.vault.getAbstractFileByPath(f),
            content: await app.vault.adapter.read(f),
            metaData: await parseFrontMatter(f)
        };
    }

    //this is repeated from the starterIndex file and will need to be abstracted
    async function getFiles(path: string) {
        const files = await app.vault.adapter.list(path); //"(./filepath)"
        const filesContent = await Promise.all(
            files.files.map(async (f: string) => {
                return getFile(f.substring(2));
            })
        );
        return filesContent;
    }

    async function selectNewChat() {
        chatHistoryList[chatIndex] = await getFile(
            chatHistoryList[chatIndex].file.path
        );
        conversationMessages = await loadConversationMessages(
            chatHistoryList[chatIndex].content
        );
        if(chatHistoryList[chatIndex].metaData?.system){
            loadPersona(chatHistoryList[chatIndex].metaData?.system)
        }
        else {
            selectPersona();
        }
    }

    async function loadPersona(name){
        personasIndex = findFileNameInList(personasList, name + ".md");
    }

    async function selectPersona(){
        // let persona = personasList[personasIndex]; 
        setMetadata(chatHistoryList[chatIndex].file, {system: personasList[personasIndex].file.basename})
    }

    async function setMetadata(file, data){

        app.fileManager.processFrontMatter(file, fm => {for(let x in data){fm[x] = data[x]}});
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
        app.vault.append(
            chatHistoryList[chatIndex].file,
            `\n${message.role}:\n${message.content}\n`
        );
    }

    async function renameConversation(
        file: TAbstractFile,
        newFileName: string
    ) {
        console.log(file);
        await app.vault.rename(file, "LLM History/" + newFileName);
        await init();
        chatIndex = findFileNameInList(chatHistoryList, newFileName);
    }

    async function generateNewName(file) {
        const newChat = new ChatOpenAI({
            openAIApiKey: openAIKey,
            temperature: 0.7,
        });
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
        renameConversation(file, newName + ".md");
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
            [...conversationMessages, new SystemChatMessage(personasList[personasIndex].content)],
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
        loading = false;
        if (chatHistoryList[chatIndex].file.name == "newChat.md") {
            generateNewName(chatHistoryList[chatIndex].file);
        }
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
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
    <select bind:value={personasIndex} on:change={selectPersona}>
        {#if personasList.length > 0}
            {#each personasList as persona, i}
                <option value={i}>
                    {persona.file.basename}
                </option>
            {/each}
        {/if}
    </select>
    <select bind:value={chatIndex} on:change={selectNewChat}>
        {#if chatHistoryList.length > 0} 
            {#each chatHistoryList as chatHistory, i}
                <option value={i}>
                    
                    {chatHistory.file.basename}
                </option>
            {/each}
        {/if}
    </select>

    <button on:click={createNewConversation}>New Chat</button>
    <button
        on:click={() => {
            console.log(chatHistoryList[chatIndex].file);
            renameConversation(chatHistoryList[chatIndex].file, "new Name.md");
        }}>Rename</button
    >
    <button
        on:click={() => {
            init();
        }}>Reload</button
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
    </div>
    <div class="input-area">
        <textarea bind:value={promptInput} on:keydown={handleKeydown} />
        <button
            on:click={() => {
                langChainPrompt();
            }}>Send</button
        >
    </div>
</div>

<style>
    .conversation-window {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 1200px;
        max-height: 60vh;
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
