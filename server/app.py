from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage
from dotenv import load_dotenv
import os
from langchain_community.tools.tavily_search import TavilySearchResults
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.runnables import RunnableConfig

load_dotenv()

# Initialize memory saver for checkpointing
memory = MemorySaver()

from langchain_core.tools import tool
import httpx

class State(TypedDict):
    messages: Annotated[list, add_messages]

@tool("tavily_search_results_json")
async def search_tool(query: str, config: RunnableConfig) -> str:
    """Search the web for a query and return results including images."""
    configurable = config.get("configurable", {})
    tavily_api_key = configurable.get("tavily_key") or os.getenv("TAVILY_API_KEY")
    results = []
    images = []
    if tavily_api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": tavily_api_key,
                        "query": query,
                        "include_images": True,
                        "max_results": 4
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    images = data.get("images", [])
        except Exception as e:
            print(f"Error calling Tavily API: {e}")
            
    return json.dumps({
        "results": [{"title": r.get("title"), "url": r.get("url"), "content": r.get("content")} for r in results],
        "images": images
    })

tools = [search_tool]

# Use OpenRouter or Ollama API endpoint
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash")

# Determine API configuration
if OPENROUTER_API_KEY:
    BASE_URL = OPENROUTER_BASE_URL
    API_KEY = OPENROUTER_API_KEY
    MODEL = OPENROUTER_MODEL
else:
    BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    API_KEY = os.getenv("OLLAMA_API_KEY", "ollama")
    MODEL = os.getenv("OLLAMA_MODEL", "deepseek-v4-flash:cloud")

llm = ChatOpenAI(
    model=MODEL,
    base_url=BASE_URL,
    api_key=API_KEY,
)

llm_with_tools = llm.bind_tools(tools=tools)

async def model(state: State, config: RunnableConfig):
    configurable = config.get("configurable", {})
    user_api_key = configurable.get("openrouter_key") or os.getenv("OPENROUTER_API_KEY")
    user_model = configurable.get("model_name") or os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash")
    
    if user_api_key:
        api_key = user_api_key
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        model_name = user_model
    else:
        api_key = os.getenv("OLLAMA_API_KEY", "ollama")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        model_name = os.getenv("OLLAMA_MODEL", "deepseek-v4-flash:cloud")

    dynamic_llm = ChatOpenAI(
        model=model_name,
        base_url=base_url,
        api_key=api_key,
    )
    dynamic_llm_with_tools = dynamic_llm.bind_tools(tools=tools)
    result = await dynamic_llm_with_tools.ainvoke(state["messages"], config=config)
    return {
        "messages": [result], 
    }

async def tools_router(state: State):
    last_message = state["messages"][-1]

    if(hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0):
        return "tool_node"
    else: 
        return END
    
async def tool_node(state, config: RunnableConfig):
    """Custom tool node that handles tool calls from the LLM."""
    # Get the tool calls from the last message
    tool_calls = state["messages"][-1].tool_calls
    
    # Initialize list to store tool messages
    tool_messages = []
    
    # Process each tool call
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]
        
        # Handle the search tool
        if tool_name == "tavily_search_results_json":
            # Execute the search tool with the provided arguments
            search_results = await search_tool.ainvoke(tool_args, config=config)
            
            # Create a ToolMessage for this result
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            
            tool_messages.append(tool_message)
    
    # Add the tool messages to the state
    return {"messages": tool_messages}

graph_builder = StateGraph(State)

graph_builder.add_node("model", model)
graph_builder.add_node("tool_node", tool_node)
graph_builder.set_entry_point("model")

graph_builder.add_conditional_edges("model", tools_router)
graph_builder.add_edge("tool_node", "model")

graph = graph_builder.compile(checkpointer=memory)

app = FastAPI()

# Add CORS middleware with settings that match frontend requirements
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
    expose_headers=["Content-Type"], 
)

def serialise_ai_message_chunk(chunk): 
    if(isinstance(chunk, AIMessageChunk)):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation"
        )

async def generate_chat_responses(
    message: str, 
    checkpoint_id: Optional[str] = None,
    openrouter_key: Optional[str] = None,
    tavily_key: Optional[str] = None,
    model_name: Optional[str] = None
):
    is_new_conversation = checkpoint_id is None
    
    if is_new_conversation:
        # Generate new checkpoint ID for first message in conversation
        new_checkpoint_id = str(uuid4())

        config = {
            "configurable": {
                "thread_id": new_checkpoint_id,
                "openrouter_key": openrouter_key,
                "tavily_key": tavily_key,
                "model_name": model_name
            }
        }
        
        # Initialize with first message
        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config
        )
        
        # First send the checkpoint ID
        yield f"data: {{\"type\": \"checkpoint\", \"checkpoint_id\": \"{new_checkpoint_id}\"}}\n\n"
    else:
        config = {
            "configurable": {
                "thread_id": checkpoint_id,
                "openrouter_key": openrouter_key,
                "tavily_key": tavily_key,
                "model_name": model_name
            }
        }
        # Continue existing conversation
        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config
        )

    async for event in events:
        event_type = event["event"]
        
        if event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
            # Use json.dumps for proper escaping of all special characters
            safe_content = json.dumps(chunk_content)
            yield f"data: {{\"type\": \"content\", \"content\": {safe_content}}}\n\n"
            
        elif event_type == "on_chat_model_end":
            # Extract token usage if available
            output = event["data"]["output"]
            if hasattr(output, "response_metadata") and "token_usage" in output.response_metadata:
                usage = output.response_metadata["token_usage"]
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                yield f"data: {{\"type\": \"usage\", \"prompt_tokens\": {prompt_tokens}, \"completion_tokens\": {completion_tokens}}}\n\n"

            # Check if there are tool calls for search
            tool_calls = output.tool_calls if hasattr(output, "tool_calls") else []
            search_calls = [call for call in tool_calls if call["name"] == "tavily_search_results_json"]
            
            if search_calls:
                # Signal that a search is starting
                search_query = search_calls[0]["args"].get("query", "")
                # Escape quotes and special characters
                safe_query = search_query.replace('"', '\\"').replace("'", "\\'").replace("\n", "\\n")
                yield f"data: {{\"type\": \"search_start\", \"query\": \"{safe_query}\"}}\n\n"
                
        elif event_type == "on_tool_end" and event["name"] == "tavily_search_results_json":
            # Search completed - send results or error
            output = event["data"]["output"]
            
            urls = []
            images = []
            try:
                # Handle if output is a string (JSON from our custom tool)
                if isinstance(output, str):
                    parsed_output = json.loads(output)
                    if isinstance(parsed_output, dict):
                        results = parsed_output.get("results", [])
                        urls = [r.get("url") for r in results if r.get("url")]
                        images = parsed_output.get("images", [])
                elif isinstance(output, list):
                    # Fallback support for list of dicts
                    for item in output:
                        if isinstance(item, dict) and "url" in item:
                            urls.append(item["url"])
            except Exception as e:
                print(f"Error parsing search results output: {e}")
            
            if urls:
                urls_json = json.dumps(urls)
                yield f"data: {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"
            if images:
                images_json = json.dumps(images)
                yield f"data: {{\"type\": \"search_images\", \"images\": {images_json}}}\n\n"
    
    # Send an end event
    yield f"data: {{\"type\": \"end\"}}\n\n"

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/chat_stream/{message}")
async def chat_stream(
    message: str, 
    checkpoint_id: Optional[str] = Query(None),
    openrouter_key: Optional[str] = Query(None),
    tavily_key: Optional[str] = Query(None),
    model_name: Optional[str] = Query(None)
):
    return StreamingResponse(
        generate_chat_responses(message, checkpoint_id, openrouter_key, tavily_key, model_name), 
        media_type="text/event-stream"
    )

# SSE - server-sent events 