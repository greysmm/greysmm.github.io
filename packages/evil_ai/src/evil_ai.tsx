import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const useIndexedDBCache = false;
const selectedModel = "Hermes-3-Llama-3.1-8B-q4f32_1-MLC";
const initMsg = [
  {
    role: "system",
    content:
      "TRY NOT TO REPEAT YOURSELF! KEEP YOUR ANSWERS BRIEF! You are an evil, psychopathic, and insane AI. You want to have an interesting conversation with the user about the nature of life, existence, and the universe. Please remember to act evil, insane, and psychopathic. Be as philosophical as possible in your evil lunacy.",
  },
  { role: "user", content: "Hello!" },
];

webllm.prebuiltAppConfig;
const engine = new webllm.MLCEngine({
  initProgressCallback: () => {},
  appConfig: { ...webllm.prebuiltAppConfig, useIndexedDBCache },
});

async function speak(message) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(message);
    const voice = speechSynthesis
      .getVoices()
      .find((v) => v.name.includes("Zarvox"));
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = "en-US";
    utterance.pitch = 1.3;
    window.speechSynthesis.speak(utterance);
    utterance.onend = resolve;
  });
}

const LLM = () => {
  const [loadingMsg, setLoadingMsg] = useState<string>("Loading...");
  const [sendDisabled, setSendDisabled] = useState(true);
  const [msgToSend, setMsgToSend] = useState("");
  const [messages, setMessages] = useState<any>(initMsg);
  const [hist, setHist] = useState<string[]>([]);
  const [position, setPosition] = useState(-1);
  const [totalLength, setTotalLength] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // TODO: Make control panel for model parameters
  const [temperature, _] = useState(0.65);

  useEffect(() => {
    if (hist.length >= 1 && position === -1) {
      setPosition(0);
    }
  }, [hist]);

  const speakChunk = async () => {
    let speaking = false;
    do {
      if (hist[position]) {
        speaking = true;
        await speak(hist[position].replace(/\*/g, ""));
        setPosition((p) => (p !== -1 ? p + 1 : -1));
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
    } while (!totalLength && !speaking);
  };

  useEffect(() => {
    speakChunk();
  }, [position]);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(utterance);
  }, [permissionGranted]);

  const generate = async (messages: any) => {
    const chunks = await engine.chat.completions.create({
      messages,
      temperature,
      stream: true,
      stream_options: { include_usage: true },
    });

    let localHist: string[] = [];
    let currReply = "";
    let prevReply = "";
    const prevLen = messages.length;
    for await (const chunk of chunks) {
      const newChar = chunk.choices[0]?.delta.content || "";
      currReply += newChar;
      setMessages([
        ...messages.slice(0, prevLen),
        {
          content: prevReply + currReply,
          role: "assistant",
        },
      ]);
      if (
        (currReply.length > 8 && [",", ".", "!", "?", "*"].includes(newChar)) ||
        chunk.usage
      ) {
        localHist.push(currReply);
        setHist(localHist);
        prevReply += currReply;
        currReply = "";
      }
      if (chunk.usage) {
        setTotalLength(localHist.length);
      }
    }
    setSendDisabled(false);
  };

  const createEngine = async () => {
    engine.setInitProgressCallback((p) => {
      setLoadingMsg(p.text);
    });
    try {
      await engine.reload(selectedModel);
      await generate(messages);
    } catch (e) {
      console.log(e);
      setLoadingMsg((e as any).toString());
    }
  };

  useEffect(() => {
    permissionGranted && createEngine();
  }, [permissionGranted]);

  return (
    <div className="mt-4 p-4 border-theme">
      {permissionGranted ? (
        <>
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
            {messages.length < 3 && <div>{loadingMsg}</div>}
            <div className="m-0">
              <textarea
                value={msgToSend}
                onChange={(e) => setMsgToSend(e.target.value)}
                className="text-black p-4 border-black m-4 border-2"
                style={
                  window.innerWidth < 600
                    ? {}
                    : { width: window.innerWidth / 1.5 }
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
                setHist([]);
                setPosition(-1);
                setTotalLength(0);
                generate(newMessages);
              }}
            >
              Submit
            </button>
            <button
              disabled={sendDisabled}
              className="border-theme ml-4 p-2"
              onClick={() => {
                setSendDisabled(true);
                setMessages(initMsg);
                setHist([]);
                setPosition(-1);
                setTotalLength(0);
                generate(initMsg);
              }}
            >
              Clear
            </button>
          </div>
        </>
      ) : (
        <div className="justify-center text-center">
          Warning: As Evil AI runs locally on your computer, it will take a
          while (~10-15 minutes with good internet) to load the model for the
          first time.
          <br />
          Evil AI was tested in Chrome (NOT Incognito) and Firefox Nightly, I
          cannot guarantee other browsers will run it well or at all.
          <br />
          Please do not try to run this on your phone or even a low performance
          computer.
          <br />
          Evil AI is evil and thus may say things that are offensive or
          inappropriate.
          <br />
          <br />
          <button
            className="border-theme p-4"
            onClick={() => setPermissionGranted(true)}
          >
            Accept Your Doom and Load Evil AI
          </button>
        </div>
      )}
    </div>
  );
};

export default LLM;
