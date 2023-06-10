<script lang="ts">
    import 'dotenv/config'
    import { OpenAI } from "langchain/llms/openai";
    

    let promptInput = ""
    let promptOutput = "res..."
    export const  openAIKey: string = "";

    const model = new OpenAI({ openAIApiKey: openAIKey, temperature: 0.4 });


    async function sendPrompt(promptInput: string): Promise<void> {
        console.log("input: " + promptInput);
        console.log("api-key: " + openAIKey);
        // const response = await model.call(promptInput);
        // promptOutput = response;
    }

</script>


<div>
    <h1>Basic Prompt</h1>
    <input type="text" bind:value={promptInput}>
    <button on:click={() => {sendPrompt(promptInput)}}>Send Prompt</button>
    <span>{promptOutput}</span>
</div>