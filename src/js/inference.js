// LLM Inference Engine - Handles API calls to LLM endpoints
// Supports Ollama, OpenAI-compatible APIs, and Anthropic Claude

async function callAgent(agentRole, userMessage) {
  const agent = getAgents().find((a) => a.role === agentRole);
  if (!agent) {
    console.error(`Agent with role ${agentRole} not found`);
    return null;
  }

  const systemPrompt = buildSystemPrompt(agentRole);

  try {
    let response;

    if (agent.endpointType === "ollama") {
      response = await callOllama(agent, systemPrompt, userMessage);
    } else if (agent.endpointType === "openai") {
      response = await callOpenAICompat(agent, systemPrompt, userMessage);
    } else if (agent.endpointType === "anthropic") {
      response = await callAnthropic(agent, systemPrompt, userMessage);
    } else {
      console.error(`Unknown endpoint type: ${agent.endpointType}`);
      return null;
    }

    return response;
  } catch (error) {
    console.error(`Error calling ${agentRole}:`, error);
    return null;
  }
}

async function callOllama(agent, systemPrompt, userMessage) {
  const url = `${agent.endpointUrl}/api/generate`;

  const body = {
    model: agent.model,
    prompt: `${systemPrompt}\n\nUser: ${userMessage}`,
    stream: false,
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(`Ollama API error: ${resp.status}`);
    }

    const data = await resp.json();
    return data.response || "";
  } catch (error) {
    console.error("Ollama API call failed:", error);
    throw error;
  }
}

async function callOpenAICompat(agent, systemPrompt, userMessage) {
  const url = `${agent.endpointUrl}/v1/chat/completions`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (agent.apiKey) {
    headers["Authorization"] = `Bearer ${agent.apiKey}`;
  }

  const body = {
    model: agent.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(`OpenAI API error: ${resp.status}`);
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

async function callAnthropic(agent, systemPrompt, userMessage) {
  const url = "https://api.anthropic.com/v1/messages";

  const body = {
    model: agent.model || "claude-3-sonnet-20240229",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": agent.apiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(`Anthropic API error: ${resp.status}`);
    }

    const data = await resp.json();
    return data.content?.[0]?.text || "";
  } catch (error) {
    console.error("Anthropic API call failed:", error);
    throw error;
  }
}

function buildSystemPrompt(agentRole) {
  const soul = getSoul(agentRole);
  const memory = getMemory(agentRole);

  const allMessages = getMessages();
  const recentMessages = allMessages.slice(-10);

  const mentionedMessages = [];
  if (allMessages.length > 0) {
    const mentionRegex = new RegExp(`@${agentRole}`, "gi");
    for (const msg of allMessages) {
      const matches = msg.text.match(mentionRegex);
      if (matches) {
        mentionedMessages.push(msg);
      }
    }
  }

  let mentionSection = "";
  if (mentionedMessages.length > 0) {
    mentionSection = `\n\n## Recent mentions of you:\n`;
    mentionedMessages.forEach((msg) => {
      mentionSection += `- ${msg.sender}: "${msg.text}"\n`;
    });
  }

  return `${soul}

## Current Memory State
${JSON.stringify(memory, null, 2)}

## Recent Board Activity
${recentMessages.map((m) => `${m.sender}: ${m.text}`).join("\n")}
${mentionSection}

## Your task
Respond helpfully, staying in character. Post to the message board when needed.`;
}

async function runAgentOnTask(agentRole, task) {
  const systemPrompt = buildSystemPrompt(agentRole);

  const taskContext = `
## Current Task
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
Status: ${task.status}
Repository: ${task.repo || "N/A"}
Branch: ${task.branch || "N/A"}
`;

  const userMsg = `${taskContext}\n\nReview this task and provide your assessment.`;

  let raw = "";
  try {
    raw = await callAgent(agentRole, userMsg);
  } catch (error) {
    console.error(`Failed to call agent ${agentRole}:`, error);
    return {
      role: agentRole,
      content: `Error communicating with agent: ${error.message}`,
      error: error.message,
    };
  }

  const clean = raw.trim();

  // Try to parse structured response
  const actionMatch = clean.match(/\[ACTION\]:(.+?)(?=\[|$)/s);
  const commentMatch = clean.match(/\[COMMENT\]:(.+?)(?=\[|$)/s);
  const reasoningMatch = clean.match(/\[REASONING\]:(.+?)(?=\[|$)/s);

  return {
    role: agentRole,
    content: clean,
    action: actionMatch ? actionMatch[1].trim() : null,
    comment: commentMatch ? commentMatch[1].trim() : clean,
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : null,
  };
}
