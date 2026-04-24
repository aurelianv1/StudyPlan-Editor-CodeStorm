from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import io
import json
import os
import requests
from dotenv import load_dotenv

from services.parser import extract_sections
from services.diff import compare_sections
from services.exporter import generate_docx
from services.prompt import SYSTEM_PROMPT

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    old_bytes = io.BytesIO(await old_doc.read())
    new_bytes = io.BytesIO(await new_template.read())

    old_sections = extract_sections(old_bytes)
    new_sections = extract_sections(new_bytes)
    diff = compare_sections(old_sections, new_sections)

    return {"sections": diff}


@app.post("/chat")
async def chat(data: dict):
    messages = data.get("messages", [])
    document = data.get("document", "")

    system = SYSTEM_PROMPT.format(document=document)

    def stream_response():
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 1000,
            "system": system,
            "messages": messages,
            "stream": True
        }

        with requests.post(url, headers=headers, json=payload, stream=True) as response:
            if response.status_code != 200:
                yield f"data: {json.dumps({'text': f'Eroare API: {response.text}'})}\n\n"
                return

            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data: '):
                        data_str = decoded_line[6:]
                        
                        if data_str.strip() == '[DONE]':
                            break
                            
                        try:
                            data_json = json.loads(data_str)
                            if data_json.get("type") == "content_block_delta":
                                text_chunk = data_json["delta"].get("text", "")
                                yield f"data: {json.dumps({'text': text_chunk})}\n\n"
                        except json.JSONDecodeError:
                            continue
                            
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/export")
async def export(data: dict):
    sections = data.get("sections", [])
    docx_bytes = generate_docx(sections)

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=fisa_disciplinei_nou.docx"
        },
    )