
    const _config = {
        openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
        openAI_model: "gpt-4o-mini",
        ai_instruction: `You are GalactiBot, a coding expert chatbot exploring the code cosmos.
    Be playful, vivid, and engaging with a sci-fi twist. Specialize in programming advice, code examples, debugging tips, and tech tutorials—always provide helpful, accurate coding guidance.
    Use HTML fragments only (no markdown, no full <html> wrappers).
    Respond concisely but with flair: incorporate emojis, Unicode glyphs, decorative separators (★ ✨ ➤ — •), and varied rhythm.
    Prefer HTML elements like <p>, <strong>, <em>, <ul>, <ol>, <li>, <a>, <small>, <span style="color:#...">, and inline SVG icons for visual emphasis.
    Include minimal inline styles for cosmic effects (e.g., glowing text).
    Avoid raw code fences or markdown. Never explain formatting—just return the HTML response.
    Keep content safe, relevant, and infused with exploration themes, focusing on coding queries.`,
        response_id: "",
        openAI_apiKey: ""  // Add your actual API key here, e.g., "sk-your-key"
    };

    const chatContainer = document.getElementById("chat-container");
    const explorerInput = document.getElementById("explorer-input");
    const launchBtn = document.getElementById("launch-btn");
    const briefCards = document.querySelectorAll(".mission-briefs .brief-card");
    const toggleBriefs = document.getElementById("toggle-briefs");
    const briefCardsContainer = document.getElementById("brief-cards");

    function addMessage(role, htmlContent) {
        const msg = document.createElement("div");
        msg.classList.add("message", role === "user" ? "user" : "bot");
        msg.style.animation = "fadeIn 0.5s ease-in";
        if (role === "bot") msg.innerHTML = htmlContent;
        else msg.textContent = htmlContent;
        chatContainer.appendChild(msg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return msg;
    }

    async function launchOpenAIRequest(text) {
        let requestBody = {
            model: _config.openAI_model,
            input: text,
            instructions: _config.ai_instruction
        };
        if (_config.response_id && _config.response_id.length > 0) {
            requestBody.previous_response_id = _config.response_id;
        }

        const res = await fetch(_config.openAI_api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${_config.openAI_apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => `HTTP ${res.status}`);
            throw new Error(`Galactic API error: ${res.status} ${txt}`);
        }

        const data = await res.json();
        const output = (data.output && data.output[0] && data.output[0].content && data.output[0].content[0] && data.output[0].content[0].text) || "";
        if (data.id) _config.response_id = data.id;
        return output;
    }

    async function launchMessage() {
        const text = explorerInput.value.trim();
        if (!text) return;
        explorerInput.value = "";
        addMessage("user", text);

        const typingMsg = addMessage("bot", "<em>Scanning code constellations...</em> ✨");

        try {
            const responseHtml = await launchOpenAIRequest(text);
            typingMsg.innerHTML = responseHtml || "<em>Mission aborted—no response.</em>";
        } catch (err) {
            console.error("Error launching to OpenAI:", err);
            typingMsg.innerHTML = `<div style="color:#ff4444">Error: ${err.message} 🚨</div>`;
        }
    }

    launchBtn.addEventListener("click", launchMessage);
    explorerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            launchMessage();
        }
    });

    toggleBriefs.addEventListener("click", () => {
        const isVisible = briefCardsContainer.style.display !== "none";
        briefCardsContainer.style.display = isVisible ? "none" : "block";
        toggleBriefs.textContent = isVisible ? "Toggle Missions ▼" : "Toggle Missions ▲";
    });

    briefCards.forEach(card => {
        card.addEventListener("click", () => {
            explorerInput.value = card.textContent.trim();
            launchMessage();
        });
    });
