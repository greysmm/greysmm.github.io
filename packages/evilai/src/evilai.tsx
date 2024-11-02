import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const useIndexedDBCache = false;
const selectedModel = "Hermes-3-Llama-3.1-8B-q4f32_1-MLC";

webllm.prebuiltAppConfig;
const engine = new webllm.MLCEngine({
  initProgressCallback: () => {},
  appConfig: { ...webllm.prebuiltAppConfig, useIndexedDBCache },
});

const LLM = () => {
  const [loadingMsg, setLoadingMsg] = useState<string | undefined>(undefined);
  const [sendDisabled, setSendDisabled] = useState(true);
  const [msgToSend, setMsgToSend] = useState("");
  const [messages, setMessages] = useState<any>([
    {
      role: "system",
      content:
        "TRY NOT TO REPEAT YOURSELF! KEEP YOUR ANSWERS BRIEF! You are an evil, psychopathic, and insane AI. You want to have an interesting conversation with the user about the nature of life, existence, and the universe. Please remember to act evil, insane, and psychopathic. Be as philosophical as possible in your evil lunacy.",
    },
    { role: "user", content: "Hello!" },
  ]);

  const generate = async (messages: any) => {
    const chunks = await engine.chat.completions.create({
      messages,
      temperature: 0.65,
      stream: true,
    });

    let reply = "";
    const prevLen = messages.length;
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content || "";
      setMessages([
        ...messages.slice(0, prevLen),
        {
          content: reply,
          role: "assistant",
        },
      ]);
    }
    setSendDisabled(false);
  };

  const createEngine = async () => {
    engine.setInitProgressCallback((p) => {
      setLoadingMsg(p.text);
    });
    await engine.reload(selectedModel);
    await generate(messages);
  };

  useEffect(() => {
    createEngine();
  }, []);

  return (
    <div className="mt-4 p-4 border-theme">
      {messages.slice(2).map((m) => {
        const user = m.role === "user";
        return (
          <ReactMarkdown
            className={"mt-4 p-4 border-theme " + (user ? "ml-8" : "mr-8")}
          >
            {(user ? "U: " : "AI: ") + m.content}
          </ReactMarkdown>
        );
      })}
      <div className="justify-center text-center">
        {messages.length < 3 && <div>{loadingMsg || "Loading..."}</div>}
        <div>
          <textarea
            value={msgToSend}
            onChange={(e) => setMsgToSend(e.target.value)}
            className="text-black p-4 border-black mx-4 mt-4 border-2"
            style={
              window.innerWidth < 600 ? {} : { width: window.innerWidth / 1.5 }
            }
          />
        </div>
        <button
          disabled={sendDisabled}
          className="border-theme p-2"
          onClick={() => {
            setSendDisabled(true);
            const newMessages = [
              ...messages,
              {
                content: msgToSend,
                role: "user",
              },
            ];
            setMsgToSend("");
            setMessages(newMessages);
            generate(newMessages);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default LLM;
