<script lang="ts">
    import "dotenv/config";
    import { requestUrl } from "obsidian";

    let systemInput = "talk like a pirate"
    let promptInput = "congratulate me on completing this code test";
    let promptOutput = "res...";
    export let openAIKey: string = "";

    async function sendPrompt(promptInput: string): Promise<void> {
        console.log("input: " + promptInput);
        console.log("api-key: " + openAIKey);
        const params = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: promptInput }],
            max_tokens: "100",
        };
        const response = await requestUrl({
            url: `https://api.openai.com/v1/chat/completions`,
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{role: "system", content: systemInput},{ role: "user", content: promptInput }],
                temperature: 0.2,
                max_tokens: 100,
            }),
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization:
                    "Bearer " +
                    "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",
            },
        });
        console.log(response);
        promptOutput = response.json.choices[0].message.content;
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
            sendPrompt(promptInput);
        }}>Send Prompt</button
    >
    <span>{promptOutput}</span>
</div>
