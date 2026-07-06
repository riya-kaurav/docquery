// we are making simple api which ask a question to llm
import OpenAi from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAi({
    apikey: process.env.openaikey,
})
async function main(){
    const response = await client.response.create({
        model: "gpt-5.5",
        input: "explain redis"
    });
    console.log(" full response ");
    console.dir(response, {depth: null});
    console.log(" text");
    console.log(response.output_text);
    console.log("usage");
    console.log(response.usage);
}

main().catch(console.error);