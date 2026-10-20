import { CheckIcon, UploadIcon } from "../icons";

interface DocUploadCardProps {
  label: string;
  file: File | null;
  onBrowse: () => void;
  onRemove: () => void;
}

export function DocUploadCard({ label, file, onBrowse, onRemove }: DocUploadCardProps) {
  return (
    <div
      onClick={() => !file && onBrowse()}
      className={`relative rounded-xl border transition-all duration-300 select-none ${
        file ? "border-white/30 bg-white/5 cursor-default" : "border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer"
      }`}
    >
      <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
        {file ? (
          <>
            <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-black" />
            </span>
            <p className="text-white text-sm font-semibold">Încărcat</p>
            <p className="text-white/40 text-xs font-mono truncate max-w-[180px]">{file.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-[10px] text-white/25 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center">
              <UploadIcon className="w-4 h-4 text-white/30" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">{label}</p>
              <p className="text-white/25 text-[10px] mt-0.5">DOCX · click to upload</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
