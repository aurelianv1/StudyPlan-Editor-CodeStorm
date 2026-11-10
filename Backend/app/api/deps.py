"""Request helpers shared by the routers."""

from __future__ import annotations

from fastapi import HTTPException, UploadFile, status

from app.config import Settings

ALLOWED_EXTENSION = ".docx"


async def read_docx(upload: UploadFile, settings: Settings) -> bytes:
    """Return the bytes of an uploaded .docx, rejecting anything else early."""
    filename = upload.filename or ""
    if not filename.lower().endswith(ALLOWED_EXTENSION):
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Format neacceptat pentru „{filename}”. Încărcați un fișier .docx.",
        )

    content = await upload.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        limit_mb = settings.max_upload_bytes / (1024 * 1024)
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"Fișierul „{filename}” depășește limita de {limit_mb:g} MB.",
        )
    if not content:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"Fișierul „{filename}” este gol."
        )
    return content
