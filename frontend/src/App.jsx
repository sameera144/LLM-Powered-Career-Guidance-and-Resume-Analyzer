import { useState } from "react";
import axios from "axios";

function App() {

  const [message, setMessage] = useState("");

  const [chat, setChat] = useState([
    {
      sender: "bot",
      text:
        "Hi👋\nI’m your AI Career Assistant.How can I help you today?"
    }
  ]);

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);


  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (customMessage = null) => {

    const finalMessage = customMessage || message;

    if (!finalMessage.trim()) return;

    const userMessage = {
      sender: "user",
      text: finalMessage
    };

    setChat((prev) => [...prev, userMessage]);

    setMessage("");

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: finalMessage
        }
      );

      const botMessage = {
        sender: "bot",
        text: response.data.reply
      };

      setChat((prev) => [...prev, botMessage]);

    } catch (error) {

      console.log(error);

    }

    setLoading(false);
  };


  // =========================
  // ANALYZE RESUME
  // =========================

  const analyzeResume = async () => {

    if (!file) {
      alert("Please upload a resume");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "role",
      "Software Engineer"
    );

    formData.append(
      "job_description",
      "General software engineering role"
    );

    const userMessage = {
      sender: "user",
      text: "📄 Analyze my uploaded resume"
    };

    setChat((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/analyze-resume/",
        formData
      );

      const botMessage = {
        sender: "bot",
        text: response.data.analysis
      };

      setChat((prev) => [...prev, botMessage]);

    } catch (error) {

      console.log(error);

    }

    setLoading(false);
  };


  // =========================
  // ENTER KEY
  // =========================

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }
  };


  // =========================
  // SUGGESTIONS
  // =========================

  const suggestions = [
    "How do I become an ML Engineer?",
    "Analyze my resume",
    "Give me React interview questions",
    "Create a Data Science roadmap"
  ];


  return (

    <div
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          padding: "18px 30px",
          borderBottom: "1px solid #e5e5e5",
          fontSize: "20px",
          fontWeight: "600",
          color: "#111"
        }}
      >
        AI Career Assistant
      </div>


      {/* CHAT AREA */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "30px",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto"
        }}
      >

        {chat.map((msg, index) => (

          <div
            key={index}
            style={{
              marginBottom: "30px",
              display: "flex",
              justifyContent:
                msg.sender === "user"
                  ? "flex-end"
                  : "flex-start"
            }}
          >

            <div
              style={{
                maxWidth: "75%",
                padding: "16px",
                borderRadius: "16px",

                backgroundColor:
                  msg.sender === "user"
                    ? "#f4f4f4"
                    : "#ffffff",

                border:
                  msg.sender === "user"
                    ? "none"
                    : "1px solid #e5e5e5",

                color: "#111",

                lineHeight: "1.7",

                whiteSpace: "pre-wrap",

                fontSize: "15px"
              }}
            >

              {msg.text}

            </div>

          </div>
        ))}


        {/* LOADING */}

        {loading && (

          <div
            style={{
              color: "#777",
              fontSize: "15px"
            }}
          >
            AI is thinking...
          </div>

        )}

      </div>


      {/* SUGGESTIONS */}

      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
          marginBottom: "15px"
        }}
      >

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >

          {suggestions.map((item, index) => (

            <button
              key={index}
              onClick={() => sendMessage(item)}
              style={{
                padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              {item}
            </button>

          ))}

        </div>

      </div>


      {/* INPUT AREA */}

      <div
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "20px",
          backgroundColor: "#ffffff"
        }}
      >

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >

          {/* FILE UPLOAD */}

          <div
            style={{
              marginBottom: "10px"
            }}
          >

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

            <button
              onClick={analyzeResume}
              style={{
                marginLeft: "10px",
                padding: "8px 14px",
                backgroundColor: "#111",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Analyze Resume
            </button>

          </div>


          {/* MESSAGE INPUT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "14px",
              padding: "10px 14px",
              backgroundColor: "#ffffff"
            }}
          >

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyPress}
              placeholder="Message AI Career Assistant"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                backgroundColor: "transparent"
              }}
            />

            <button
              onClick={() => sendMessage()}
              style={{
                backgroundColor: "#111",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
